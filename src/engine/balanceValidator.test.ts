/**
 * S14 バランス検証テスト
 * 全ステージが STAGE-SPEC の公式に適合しているか検証する。
 *
 * 公式:
 *   Teach:     ☆3=opt, ☆2=opt+1, ☆1=opt+3, life=opt+6
 *   Practice:  ☆3=opt, ☆2=opt+2, ☆1=opt+4, life=opt+6
 *   Challenge: ☆3=opt, ☆2=opt+3, ☆1=opt+6, life=opt+8
 */

import { describe, it, expect } from 'vitest'
import { ALL_STAGES } from '../data/stages'
import { SKILL_NODES, SKILL_NODE_MAP } from '../data/skillTree'
import type { Stage, StageType } from '../types/stage'

/** Expected offsets per stage type */
const FORMULA: Record<StageType, { s2: number; s1: number; life: number }> = {
    teach: { s2: 1, s1: 3, life: 6 },
    practice: { s2: 2, s1: 4, life: 6 },
    challenge: { s2: 3, s1: 6, life: 8 },
}

const allStages = Object.values(ALL_STAGES)

describe('Stage data integrity', () => {
    it('has at least 59 stages', () => {
        expect(allStages.length).toBeGreaterThanOrEqual(59)
    })

    it('all stage IDs are unique', () => {
        const ids = allStages.map((s) => s.id)
        expect(new Set(ids).size).toBe(ids.length)
    })

    it('every stage references a valid node', () => {
        for (const stage of allStages) {
            expect(SKILL_NODE_MAP[stage.nodeId], `stage ${stage.id} → node ${stage.nodeId}`).toBeDefined()
        }
    })

    it('every node has its declared stageCount', () => {
        for (const node of SKILL_NODES) {
            const nodeStages = allStages.filter((s) => s.nodeId === node.id)
            expect(nodeStages.length, `node ${node.id} expected ${node.stageCount} stages`).toBe(
                node.stageCount,
            )
        }
    })
})

describe('Star / Life formula compliance', () => {
    for (const stage of allStages) {
        const opt = stage.stars[0]
        const f = FORMULA[stage.type]

        describe(`${stage.id} (${stage.type}, opt=${opt})`, () => {
            it('stars are in ascending order [☆3 ≤ ☆2 ≤ ☆1]', () => {
                expect(stage.stars[0]).toBeLessThanOrEqual(stage.stars[1])
                expect(stage.stars[1]).toBeLessThanOrEqual(stage.stars[2])
            })

            it(`☆2 = opt + ${f.s2}`, () => {
                expect(stage.stars[1], `☆2`).toBe(opt + f.s2)
            })

            it(`☆1 = opt + ${f.s1}`, () => {
                expect(stage.stars[2], `☆1`).toBe(opt + f.s1)
            })

            it(`life = opt + ${f.life}`, () => {
                expect(stage.life, `life`).toBe(opt + f.life)
            })

            it('life > ☆1 threshold', () => {
                expect(stage.life).toBeGreaterThan(stage.stars[2])
            })
        })
    }
})

describe('Stage content sanity', () => {
    for (const stage of allStages) {
        describe(stage.id, () => {
            it('has non-empty initialText', () => {
                expect(stage.initialText.length).toBeGreaterThan(0)
            })

            it('has non-empty goalText', () => {
                expect(stage.goalText.length).toBeGreaterThan(0)
            })

            it('has at least one hint', () => {
                expect(stage.hints.length).toBeGreaterThanOrEqual(1)
            })

            it('has non-empty flavor', () => {
                expect(stage.flavor.length).toBeGreaterThan(0)
            })

            it('has at least 2 available commands', () => {
                expect(stage.availableCommands.length).toBeGreaterThanOrEqual(2)
            })

            it('opt ≥ 1', () => {
                expect(stage.stars[0]).toBeGreaterThanOrEqual(1)
            })
        })
    }
})
