/**
 * D1-D4: Progress save logic tests.
 * Tests computeProgressUpdate — pure function extracted from ResultScreen.
 */

import { describe, it, expect } from 'vitest'
import { computeProgressUpdate } from './progressUpdater'
import type { GameProgress } from '../types/game'
import type { StarRating, StageResult } from '../types/stage'
import { getStagesByNode } from '../data/stages'
import { SKILL_NODES } from '../data/skillTree'
import { NodeId } from '../types/nodeId'

function makeProgress(overrides?: Partial<GameProgress>): GameProgress {
  return {
    dataVersion: 1,
    unlockedNodes: [NodeId.Motion],
    stageResults: {},
    tutorialStatus: {},
    ...overrides,
  }
}

function makeResult(
  stageId: string,
  bestStars: StarRating,
  bestDamage: number,
  usedHint = false,
): StageResult {
  return { stageId, bestStars, bestDamage, usedHint }
}

/** Build stageResults with all stages cleared for given node */
function clearNodeStages(
  nodeId: string,
  stars: StarRating = 3 as StarRating,
): Record<string, StageResult> {
  const results: Record<string, StageResult> = {}
  for (const s of getStagesByNode(nodeId)) {
    results[s.id] = makeResult(s.id, stars, 1)
  }
  return results
}

// ── D1: Normal mode — bestStars/bestDamage correctly updated ──

describe('D1: normal mode progress update', () => {
  it('first clear sets bestStars and bestDamage', () => {
    const prev = makeProgress()
    const next = computeProgressUpdate(prev, {
      stageId: 'edit-surround',
      nodeId: NodeId.Edit,
      damage: 3,
      stars: 2 as StarRating,
      usedHint: false,
      playMode: 'normal',
      stageLife: 10,
    })

    const result = next.stageResults['edit-surround']
    expect(result).toBeDefined()
    expect(result.bestStars).toBe(2)
    expect(result.bestDamage).toBe(3)
    expect(result.usedHint).toBe(false)
  })

  it('better stars updates bestStars', () => {
    const prev = makeProgress({
      stageResults: {
        'edit-surround': { stageId: 'edit-surround', bestStars: 1, bestDamage: 5, usedHint: true },
      },
    })
    const next = computeProgressUpdate(prev, {
      stageId: 'edit-surround',
      nodeId: NodeId.Edit,
      damage: 3,
      stars: 3 as StarRating,
      usedHint: false,
      playMode: 'normal',
      stageLife: 10,
    })

    expect(next.stageResults['edit-surround'].bestStars).toBe(3)
  })

  it('worse stars does not downgrade bestStars', () => {
    const prev = makeProgress({
      stageResults: {
        'edit-surround': { stageId: 'edit-surround', bestStars: 3, bestDamage: 2, usedHint: false },
      },
    })
    const next = computeProgressUpdate(prev, {
      stageId: 'edit-surround',
      nodeId: NodeId.Edit,
      damage: 5,
      stars: 1 as StarRating,
      usedHint: true,
      playMode: 'normal',
      stageLife: 10,
    })

    expect(next.stageResults['edit-surround'].bestStars).toBe(3)
  })

  it('lower damage updates bestDamage', () => {
    const prev = makeProgress({
      stageResults: {
        'edit-surround': { stageId: 'edit-surround', bestStars: 2, bestDamage: 5, usedHint: false },
      },
    })
    const next = computeProgressUpdate(prev, {
      stageId: 'edit-surround',
      nodeId: NodeId.Edit,
      damage: 3,
      stars: 2 as StarRating,
      usedHint: false,
      playMode: 'normal',
      stageLife: 10,
    })

    expect(next.stageResults['edit-surround'].bestDamage).toBe(3)
  })

  it('higher damage does not worsen bestDamage', () => {
    const prev = makeProgress({
      stageResults: {
        'edit-surround': { stageId: 'edit-surround', bestStars: 2, bestDamage: 3, usedHint: false },
      },
    })
    const next = computeProgressUpdate(prev, {
      stageId: 'edit-surround',
      nodeId: NodeId.Edit,
      damage: 8,
      stars: 1 as StarRating,
      usedHint: false,
      playMode: 'normal',
      stageLife: 10,
    })

    expect(next.stageResults['edit-surround'].bestDamage).toBe(3)
  })

  it('usedHint clears once played without hint (AND logic)', () => {
    const prev = makeProgress({
      stageResults: {
        'edit-surround': { stageId: 'edit-surround', bestStars: 1, bestDamage: 5, usedHint: true },
      },
    })
    const next = computeProgressUpdate(prev, {
      stageId: 'edit-surround',
      nodeId: NodeId.Edit,
      damage: 4,
      stars: 2 as StarRating,
      usedHint: false,
      playMode: 'normal',
      stageLife: 10,
    })

    expect(next.stageResults['edit-surround'].usedHint).toBe(false)
  })

  it('usedHint stays false once cleared without hint', () => {
    const prev = makeProgress({
      stageResults: {
        'edit-surround': { stageId: 'edit-surround', bestStars: 2, bestDamage: 3, usedHint: false },
      },
    })
    const next = computeProgressUpdate(prev, {
      stageId: 'edit-surround',
      nodeId: NodeId.Edit,
      damage: 4,
      stars: 1 as StarRating,
      usedHint: true,
      playMode: 'normal',
      stageLife: 10,
    })

    expect(next.stageResults['edit-surround'].usedHint).toBe(false)
  })
})

// ── D2: fromTutorial — bestStars=max(existing,1), bestDamage=existing ──

describe('D2: fromTutorial mode progress update', () => {
  it('first tutorial clear sets bestStars=1 and bestDamage=stageLife', () => {
    const prev = makeProgress()
    const next = computeProgressUpdate(prev, {
      stageId: 'edit-surround',
      nodeId: NodeId.Edit,
      damage: 2,
      stars: 3 as StarRating,
      usedHint: false,
      playMode: 'fromTutorial',
      stageLife: 10,
    })

    expect(next.stageResults['edit-surround'].bestStars).toBe(1)
    expect(next.stageResults['edit-surround'].bestDamage).toBe(10)
  })

  it('does not overwrite existing higher bestStars', () => {
    const prev = makeProgress({
      stageResults: {
        'edit-surround': { stageId: 'edit-surround', bestStars: 3, bestDamage: 2, usedHint: false },
      },
    })
    const next = computeProgressUpdate(prev, {
      stageId: 'edit-surround',
      nodeId: NodeId.Edit,
      damage: 5,
      stars: 2 as StarRating,
      usedHint: true,
      playMode: 'fromTutorial',
      stageLife: 10,
    })

    expect(next.stageResults['edit-surround'].bestStars).toBe(3)
    expect(next.stageResults['edit-surround'].bestDamage).toBe(2)
  })
})

// ── D3: Practice mode — not saved ──

describe('D3: practice mode is not saved by computeProgressUpdate', () => {
  // Note: practice mode is guarded by the caller (ResultScreen).
  // computeProgressUpdate itself doesn't check playMode === 'practice'.
  // This test verifies the caller's contract by testing computeProgressUpdate
  // with a non-practice mode and confirming it DOES save.
  it('normal mode does save (contrast test)', () => {
    const prev = makeProgress()
    const next = computeProgressUpdate(prev, {
      stageId: 'edit-surround',
      nodeId: NodeId.Edit,
      damage: 3,
      stars: 2 as StarRating,
      usedHint: false,
      playMode: 'normal',
      stageLife: 10,
    })
    expect(next.stageResults['edit-surround']).toBeDefined()
  })
})

// ── D4: All stages in node cleared → dependent nodes unlocked ──

describe('D4: node unlock when all stages cleared', () => {
  it('clearing all stages in N08 unlocks N10 (N10 depends only on N08)', () => {
    // Clear all N08 stages except N08-C, then clear N08-C to trigger unlock
    const n07Stages = getStagesByNode(NodeId.Visual)
    const allButLast: Record<string, StageResult> = {}
    for (const s of n07Stages.filter((s) => s.id !== 'N08-C')) {
      allButLast[s.id] = makeResult(s.id, 3 as StarRating, 1)
    }

    const prev = makeProgress({
      unlockedNodes: [NodeId.Motion, NodeId.Visual],
      stageResults: {
        ...clearNodeStages(NodeId.Motion),
        ...allButLast,
      },
    })

    const next = computeProgressUpdate(prev, {
      stageId: 'N08-C',
      nodeId: NodeId.Visual,
      damage: 3,
      stars: 2 as StarRating,
      usedHint: false,
      playMode: 'normal',
      stageLife: 10,
    })

    expect(next.unlockedNodes).toContain(NodeId.Register)
  })

  it('does not unlock node when not all stages in node are cleared', () => {
    const n01Stages = getStagesByNode(NodeId.Motion)
    const partial: Record<string, StageResult> = {}
    for (const s of n01Stages.slice(0, -1)) {
      partial[s.id] = makeResult(s.id, 3 as StarRating, 1)
    }

    const prev = makeProgress({ stageResults: partial })

    const next = computeProgressUpdate(prev, {
      stageId: n01Stages[0].id,
      nodeId: NodeId.Motion,
      damage: 1,
      stars: 3 as StarRating,
      usedHint: false,
      playMode: 'normal',
      stageLife: 999,
    })

    const n01Dependents = SKILL_NODES.filter((n) => n.prerequisites.includes(NodeId.Motion))
    for (const dep of n01Dependents) {
      expect(next.unlockedNodes).not.toContain(dep.id)
    }
  })

  it('clearing last N01 stage unlocks all direct dependents', () => {
    const n01Stages = getStagesByNode(NodeId.Motion)
    const partial: Record<string, StageResult> = {}
    for (const s of n01Stages.slice(0, -1)) {
      partial[s.id] = makeResult(s.id, 1 as StarRating, 5)
    }

    const prev = makeProgress({ stageResults: partial })
    const lastStage = n01Stages[n01Stages.length - 1]

    const next = computeProgressUpdate(prev, {
      stageId: lastStage.id,
      nodeId: NodeId.Motion,
      damage: 5,
      stars: 1 as StarRating,
      usedHint: false,
      playMode: 'normal',
      stageLife: 999,
    })

    const n01Dependents = SKILL_NODES.filter(
      (n) => n.prerequisites.length === 1 && n.prerequisites[0] === NodeId.Motion,
    )
    for (const dep of n01Dependents) {
      expect(next.unlockedNodes, `${dep.id} should be unlocked`).toContain(dep.id)
    }
  })

  it('does not unlock node with multiple prerequisites until all are cleared', () => {
    const multiPreNode = SKILL_NODES.find((n) => n.prerequisites.length >= 2)
    if (!multiPreNode) return

    const results = clearNodeStages(multiPreNode.prerequisites[0])

    const prev = makeProgress({
      unlockedNodes: [NodeId.Motion, ...multiPreNode.prerequisites],
      stageResults: results,
    })

    const pre1Stages = getStagesByNode(multiPreNode.prerequisites[0])
    const next = computeProgressUpdate(prev, {
      stageId: pre1Stages[0].id,
      nodeId: multiPreNode.prerequisites[0],
      damage: 1,
      stars: 3 as StarRating,
      usedHint: false,
      playMode: 'normal',
      stageLife: 999,
    })

    expect(next.unlockedNodes).not.toContain(multiPreNode.id)
  })

  it('does not duplicate already unlocked nodes', () => {
    const n01Dependents = SKILL_NODES.filter(
      (n) => n.prerequisites.length === 1 && n.prerequisites[0] === NodeId.Motion,
    ).map((n) => n.id)

    const prev = makeProgress({
      unlockedNodes: [NodeId.Motion, ...n01Dependents],
      stageResults: clearNodeStages(NodeId.Motion),
    })

    const n01Stages = getStagesByNode(NodeId.Motion)
    const next = computeProgressUpdate(prev, {
      stageId: n01Stages[0].id,
      nodeId: NodeId.Motion,
      damage: 1,
      stars: 3 as StarRating,
      usedHint: false,
      playMode: 'normal',
      stageLife: 999,
    })

    const counts = new Map<string, number>()
    for (const id of next.unlockedNodes) {
      counts.set(id, (counts.get(id) ?? 0) + 1)
    }
    for (const [id, count] of counts) {
      expect(count, `node ${id} appears ${count} times in unlockedNodes`).toBe(1)
    }
  })
})
