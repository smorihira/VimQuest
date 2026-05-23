/**
 * Jotai atoms — global state management for VimQuest.
 *
 * Atoms:
 *   - gameProgressAtom: persisted GameProgress
 *   - currentStageAtom: Stage being played (set on route entry)
 *   - editorStateAtom: current EditorState during play
 *   - damageAtom: damage counter for current attempt
 *   - usedHintAtom: whether hint was used in current attempt
 *   - parserStateAtom: parser state display string
 */

import { atom } from 'jotai'
import type { GameProgress } from '../types/game'
import type { Stage, StarRating, StageResult } from '../types/stage'
import type { EditorState } from '../types/editor'
import { createEditorState } from '../types/editor'
import { loadProgress, saveProgress } from '../shared/persistence'

// ─── Game Progress ──────────────────────────────────────────────────

/** Base atom: loaded from LocalStorage on init */
const gameProgressBaseAtom = atom<GameProgress>(loadProgress())

/** Read/write atom with auto-persist */
export const gameProgressAtom = atom(
    (get) => get(gameProgressBaseAtom),
    (_get, set, update: GameProgress | ((prev: GameProgress) => GameProgress)) => {
        const next = typeof update === 'function' ? update(_get(gameProgressBaseAtom)) : update
        set(gameProgressBaseAtom, next)
        saveProgress(next)
    },
)

// ─── Current Stage ──────────────────────────────────────────────────

/** Currently active stage (null when not playing) */
export const currentStageAtom = atom<Stage | null>(null)

// ─── Editor State ───────────────────────────────────────────────────

/** Editor state during play */
export const editorStateAtom = atom<EditorState>(createEditorState('', { line: 0, col: 0 }))

// ─── Damage Counter ─────────────────────────────────────────────────

/** Total damage accumulated in current attempt */
export const damageAtom = atom<number>(0)

// ─── Hint State ─────────────────────────────────────────────────────

/** Whether hint was used in current attempt (locks stars at ☆1) */
export const usedHintAtom = atom<boolean>(false)

// ─── Parser Display ─────────────────────────────────────────────────

/** Parser state for UI display (e.g., "d" while waiting for motion) */
export const parserBufferAtom = atom<string>('')

// ─── Derived: Stage Result ──────────────────────────────────────────

/** Write-only atom: record a stage result */
export const recordStageResultAtom = atom(
    null,
    (get, set, result: { stageId: string; stars: StarRating; damage: number; usedHint: boolean }) => {
        set(gameProgressAtom, (prev) => {
            const existing = prev.stageResults[result.stageId]
            const newResult: StageResult = {
                stageId: result.stageId,
                bestStars: existing
                    ? (Math.max(existing.bestStars, result.stars) as StarRating)
                    : result.stars,
                bestDamage: existing
                    ? Math.min(existing.bestDamage, result.damage)
                    : result.damage,
                usedHint: existing ? existing.usedHint || result.usedHint : result.usedHint,
            }
            return {
                ...prev,
                stageResults: { ...prev.stageResults, [result.stageId]: newResult },
            }
        })
    },
)

/** Write-only atom: unlock a node */
export const unlockNodeAtom = atom(null, (get, set, nodeId: string) => {
    set(gameProgressAtom, (prev) => {
        if (prev.unlockedNodes.includes(nodeId)) return prev
        return { ...prev, unlockedNodes: [...prev.unlockedNodes, nodeId] }
    })
})
