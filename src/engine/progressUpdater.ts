/**
 * progressUpdater — pure function to compute updated GameProgress
 * after a stage clear. Extracted from ResultScreen for testability.
 */

import type { GameProgress, PlayMode } from '../types/game'
import type { StarRating, StageResult } from '../types/stage'
import { getStagesByNode } from '../data/nodes'
import { SKILL_NODES } from '../data/skillTree'

export interface StageCompleteParams {
  stageId: string
  nodeId: string
  damage: number
  stars: StarRating
  usedHint: boolean
  playMode: PlayMode
  /** stage.life — used as worst-case bestDamage for fromTutorial */
  stageLife: number
}

/**
 * Compute updated GameProgress after completing a stage.
 * Pure function — no side effects.
 */
export function computeProgressUpdate(
  prev: GameProgress,
  params: StageCompleteParams,
): GameProgress {
  const { stageId, nodeId, damage, stars, usedHint, playMode, stageLife } = params
  const fromTutorial = playMode === 'fromTutorial'

  const existing = prev.stageResults[stageId]

  const bestStars = fromTutorial
    ? (Math.max(existing?.bestStars ?? 0, 1) as StarRating)
    : existing
      ? (Math.max(existing.bestStars, stars) as StarRating)
      : (stars as StarRating)

  const bestDamage = fromTutorial
    ? (existing?.bestDamage ?? stageLife)
    : existing
      ? Math.min(existing.bestDamage, damage)
      : damage

  const nextResults: Record<string, StageResult> = {
    ...prev.stageResults,
    [stageId]: {
      stageId,
      bestStars,
      bestDamage,
      usedHint: existing ? existing.usedHint && usedHint : usedHint,
    },
  }

  // Check if all stages in this node are now cleared → unlock dependents
  const allNodeStages = getStagesByNode(nodeId)
  const allCleared = allNodeStages.every((s) => nextResults[s.id]?.bestStars >= 1)

  let nextUnlocked = prev.unlockedNodes
  if (allCleared) {
    const dependents = SKILL_NODES.filter((n) => n.prerequisites.includes(nodeId))
      .filter((n) =>
        n.prerequisites.every((pre) => {
          const preStages = getStagesByNode(pre)
          return preStages.every((s) => nextResults[s.id]?.bestStars >= 1)
        }),
      )
      .map((n) => n.id)

    const newNodes = dependents.filter((id) => !prev.unlockedNodes.includes(id))
    if (newNodes.length > 0) {
      nextUnlocked = [...prev.unlockedNodes, ...newNodes]
    }
  }

  return { ...prev, stageResults: nextResults, unlockedNodes: nextUnlocked }
}
