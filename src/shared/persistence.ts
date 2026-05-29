/**
 * LocalStorage persistence helper.
 * Handles save/load/clear for GameProgress.
 */

import type { GameProgress } from '../types/game'
import { SAVE_KEY, createInitialProgress } from '../types/game'
import { SKILL_NODES } from '../data/skillTree'
import { getStagesByNode } from '../data/nodes'

// ── Migration maps (v1 numeric IDs → v2 semantic slugs) ────────────

const NODE_ID_MIGRATION: Record<string, string> = {
  N01: 'motion',
  N02: 'edit',
  N03: 'mode',
  N04: 'search',
  N05: 'operator',
  N06: 'textobj',
  N07: 'linewise',
  N08: 'visual',
  N09: 'visual-adv',
  N10: 'register',
  N11: 'shortcut',
  N12: 'struct-jump',
  N13: 'operator-adv',
  N14: 'motion-adv',
  N15: 'number',
  N16: 'scroll-mark',
  N17: 'screen',
}

const STAGE_ID_MIGRATION: Record<string, string> = {
  'N01-1': 'motion-hl',
  'N01-2': 'motion-jk',
  'N01-3': 'motion-word',
  'N01-4': 'motion-adv-word',
  'N01-5': 'motion-line',
  'N01-6': 'motion-file',
  'N01-7': 'edit-delete',
  'N01-8': 'edit-insert',
  'N01-P': 'motion-practice',
  'N01-C': 'motion-challenge',
  'N02-T': 'edit-surround',
  'N02-Ta': 'edit-newline',
  'N02-P': 'edit-practice',
  'N03-T': 'edit-replace',
  'N03-Tb': 'mode-substitute',
  'N04-P': 'search-practice',
  'N05-T': 'screen-center',
  'N05-T1': 'operator-yank',
  'N05-T2': 'operator-dc',
  'N05-T3': 'operator-combo',
  'N05-P': 'operator-practice',
  'N06-T': 'search-find',
  'N06-T1': 'textobj-word',
  'N06-T2': 'textobj-delim',
  'N06-Ta': 'search-star',
  'N06-P': 'textobj-practice',
  'N07-T': 'linewise-intro',
  'N07-P': 'linewise-practice',
  'N08-P': 'visual-practice',
  'N09-T1': 'visual-adv-select',
  'N09-T2': 'visual-adv-block',
  'N09-T3': 'visual-adv-replace',
  'N09-P': 'visual-adv-practice',
  'N10-T': 'register-intro',
  'N10-Ta': 'register-clipboard',
  'N10-P': 'register-practice',
  'N11-T': 'edit-repeat',
  'N11-T1': 'shortcut-sub',
  'N11-T2': 'shortcut-line-end',
  'N11-T3': 'shortcut-join',
  'N11-P': 'shortcut-practice',
  'N12-T': 'motion-find',
  'N12-T1': 'struct-jump-match',
  'N12-T2': 'struct-jump-section',
  'N12-P': 'struct-jump-practice',
  'N13-P': 'operator-adv-practice',
  'N14-T1': 'motion-adv-back-find',
  'N14-T2': 'motion-adv-screen-pos',
  'N14-P': 'motion-adv-practice',
  'N15-T': 'number-intro',
  'N15-P': 'number-practice',
  'N16-T': 'scroll-mark-page',
  'N16-Ta': 'scroll-mark-mark',
  'N16-Tb': 'scroll-mark-gi',
  'N16-P': 'scroll-mark-practice',
  'N17-T1': 'screen-scroll',
  'N17-P': 'screen-practice',
  'N19-T': 'operator-adv-tilde',
  'N19-Ta': 'operator-adv-case',
  'N20-T': 'operator-adv-indent',
  'N21-T': 'visual-char',
  'N21-Ta': 'visual-line',
  'N21-Tb': 'visual-block',
  'N23-T': 'mode-visual-delete',
  'N23-Ta': 'mode-overwrite',
  'N23-P': 'mode-practice',
  'N24-T': 'visual-adv-cgn',
}

function migrateV1toV2(progress: GameProgress): GameProgress {
  const unlockedNodes = progress.unlockedNodes.map((id) => NODE_ID_MIGRATION[id] ?? id)
  const stageResults: Record<string, import('../types/stage').StageResult> = {}
  for (const [key, val] of Object.entries(progress.stageResults)) {
    stageResults[STAGE_ID_MIGRATION[key] ?? key] = val
  }
  const tutorialStatus: Record<string, import('../types/game').TutorialStatus> = {}
  for (const [key, val] of Object.entries(progress.tutorialStatus)) {
    tutorialStatus[NODE_ID_MIGRATION[key] ?? key] = val
  }
  return { ...progress, dataVersion: 2, unlockedNodes, stageResults, tutorialStatus }
}

/**
 * Revalidate unlockedNodes based on current stageResults and stage data.
 * Fixes inconsistencies caused by adding/removing stages after a save was created.
 */
export function revalidateUnlocks(progress: GameProgress): GameProgress {
  const unlocked = new Set(progress.unlockedNodes)
  let changed = true
  while (changed) {
    changed = false
    for (const node of SKILL_NODES) {
      if (unlocked.has(node.id)) continue
      const allPrereqsCleared = node.prerequisites.every((pre) => {
        if (!unlocked.has(pre)) return false
        const preStages = getStagesByNode(pre)
        return preStages.every((s) => progress.stageResults[s.id]?.bestStars >= 1)
      })
      if (node.prerequisites.length > 0 && allPrereqsCleared) {
        unlocked.add(node.id)
        changed = true
      }
    }
  }
  if (unlocked.size === progress.unlockedNodes.length) return progress
  return { ...progress, unlockedNodes: Array.from(unlocked) }
}

/**
 * Load game progress from LocalStorage.
 * Returns fresh progress if no save found or parse fails.
 */
export function loadProgress(): GameProgress {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return createInitialProgress()
    const parsed = JSON.parse(raw) as GameProgress
    // Basic validation
    if (!parsed.dataVersion || !Array.isArray(parsed.unlockedNodes)) {
      return createInitialProgress()
    }
    // Migrate v1 (numeric IDs) → v2 (semantic slugs)
    const migrated = parsed.dataVersion < 2 ? migrateV1toV2(parsed) : parsed
    const validated = revalidateUnlocks(migrated)
    if (validated !== parsed || migrated !== parsed) {
      saveProgress(validated)
    }
    return validated
  } catch {
    return createInitialProgress()
  }
}

/**
 * Save game progress to LocalStorage.
 */
export function saveProgress(progress: GameProgress): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(progress))
}

/**
 * Clear saved progress (new game).
 */
export function clearProgress(): void {
  localStorage.removeItem(SAVE_KEY)
}
