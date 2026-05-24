/**
 * LocalStorage persistence helper.
 * Handles save/load/clear for GameProgress.
 */

import type { GameProgress } from '../types/game'
import { SAVE_KEY, createInitialProgress } from '../types/game'
import { SKILL_NODES } from '../data/skillTree'
import { getStagesByNode } from '../data/stages'

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
    const validated = revalidateUnlocks(parsed)
    if (validated.unlockedNodes.length !== parsed.unlockedNodes.length) {
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
