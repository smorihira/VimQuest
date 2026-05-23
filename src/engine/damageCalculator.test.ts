import { describe, it, expect } from 'vitest'
import {
    calculateStars,
    isAlive,
    applyHintPenalty,
    evaluateAttempt,
} from './damageCalculator'
import { isStageClear, checkClearConditions } from './clearChecker'
import { createEditorState } from '../types/editor'
import type { Stage } from '../types/stage'

// ─── damageCalculator ───────────────────────────────────────────────

describe('calculateStars', () => {
    // stars: [☆3, ☆2, ☆1]
    const stars: [number, number, number] = [5, 7, 9]

    it('returns 3 at or below ☆3 threshold', () => {
        expect(calculateStars(3, stars)).toBe(3)
        expect(calculateStars(5, stars)).toBe(3)
    })

    it('returns 2 between ☆3 and ☆2', () => {
        expect(calculateStars(6, stars)).toBe(2)
        expect(calculateStars(7, stars)).toBe(2)
    })

    it('returns 1 between ☆2 and ☆1', () => {
        expect(calculateStars(8, stars)).toBe(1)
        expect(calculateStars(9, stars)).toBe(1)
    })

    it('returns 0 above ☆1 threshold', () => {
        expect(calculateStars(10, stars)).toBe(0)
    })

    it('returns 3 for 0 damage', () => {
        expect(calculateStars(0, stars)).toBe(3)
    })
})

describe('isAlive', () => {
    it('alive when damage < life', () => {
        expect(isAlive(5, 10)).toBe(true)
    })

    it('dead when damage >= life', () => {
        expect(isAlive(10, 10)).toBe(false)
        expect(isAlive(11, 10)).toBe(false)
    })

    it('alive at damage 0', () => {
        expect(isAlive(0, 1)).toBe(true)
    })
})

describe('applyHintPenalty', () => {
    it('caps stars at 1 when hint used', () => {
        expect(applyHintPenalty(3, true)).toBe(1)
        expect(applyHintPenalty(2, true)).toBe(1)
    })

    it('keeps 1 star unchanged with hint', () => {
        expect(applyHintPenalty(1, true)).toBe(1)
    })

    it('keeps 0 star unchanged with hint', () => {
        expect(applyHintPenalty(0, true)).toBe(0)
    })

    it('no change without hint', () => {
        expect(applyHintPenalty(3, false)).toBe(3)
        expect(applyHintPenalty(2, false)).toBe(2)
    })
})

describe('evaluateAttempt', () => {
    const stage: Stage = {
        id: 'TEST-T',
        nodeId: 'TEST',
        type: 'teach',
        title: 'Test',
        language: 'plaintext',
        initialText: 'hello',
        goalText: 'world',
        initialCursor: { line: 0, col: 0 },
        life: 11,
        stars: [5, 6, 8],
        availableCommands: ['h', 'l'],
        hints: [],
        flavor: 'test',
    }

    it('returns 3 stars for optimal play', () => {
        const r = evaluateAttempt(stage, 4, false)
        expect(r.stars).toBe(3)
        expect(r.alive).toBe(true)
    })

    it('returns 0 stars and dead when over life', () => {
        const r = evaluateAttempt(stage, 11, false)
        expect(r.stars).toBe(0)
        expect(r.alive).toBe(false)
    })

    it('applies hint penalty', () => {
        const r = evaluateAttempt(stage, 4, true)
        expect(r.stars).toBe(1)
        expect(r.alive).toBe(true)
    })
})

// ─── clearChecker ───────────────────────────────────────────────────

describe('isStageClear', () => {
    const stage: Stage = {
        id: 'CC-T',
        nodeId: 'CC',
        type: 'teach',
        title: 'Clear Test',
        language: 'plaintext',
        initialText: 'abc',
        goalText: 'xyz',
        initialCursor: { line: 0, col: 0 },
        life: 10,
        stars: [3, 4, 6],
        availableCommands: ['h', 'l'],
        hints: [],
        flavor: 'test',
    }

    it('returns true when text matches goalText', () => {
        const state = createEditorState('xyz', { line: 0, col: 0 })
        expect(isStageClear(state, stage)).toBe(true)
    })

    it('returns false when text does not match', () => {
        const state = createEditorState('abc', { line: 0, col: 0 })
        expect(isStageClear(state, stage)).toBe(false)
    })

    it('returns false when whitespace differs', () => {
        const state = createEditorState('xyz ', { line: 0, col: 0 })
        expect(isStageClear(state, stage)).toBe(false)
    })
})

describe('isStageClear with cursor condition', () => {
    const stage: Stage = {
        id: 'CC2-T',
        nodeId: 'CC2',
        type: 'teach',
        title: 'Cursor Test',
        language: 'plaintext',
        initialText: 'abc',
        goalText: 'abc',
        initialCursor: { line: 0, col: 0 },
        life: 10,
        stars: [3, 4, 6],
        availableCommands: ['h', 'l'],
        clearConditions: { cursor: { line: 0, col: 2 } },
        hints: [],
        flavor: 'test',
    }

    it('returns true when text and cursor match', () => {
        const state = createEditorState('abc', { line: 0, col: 2 })
        expect(isStageClear(state, stage)).toBe(true)
    })

    it('returns false when cursor does not match', () => {
        const state = createEditorState('abc', { line: 0, col: 0 })
        expect(isStageClear(state, stage)).toBe(false)
    })
})

describe('checkClearConditions', () => {
    it('checks register values', () => {
        const state = {
            ...createEditorState('abc', { line: 0, col: 0 }),
            registers: { '': 'x' },
        }
        expect(checkClearConditions(state, { registers: { '': 'x' } })).toBe(true)
        expect(checkClearConditions(state, { registers: { '': 'y' } })).toBe(false)
    })

    it('passes when no conditions specified', () => {
        const state = createEditorState('abc', { line: 0, col: 0 })
        expect(checkClearConditions(state, {})).toBe(true)
    })
})
