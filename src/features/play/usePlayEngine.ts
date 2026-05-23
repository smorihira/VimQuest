/**
 * usePlayEngine — custom hook that wires together
 * commandParser + commandExecutor + damageCalculator + clearChecker.
 *
 * Returns editor state, damage, life %, star projection,
 * and a handleKey function for the Play screen.
 */

import { useState, useCallback, useRef, useMemo } from 'react'
import type { Stage } from '../../types/stage'
import type { EditorState } from '../../types/editor'
import { createEditorState } from '../../types/editor'
import { CommandParser } from '../../engine/commandParser'
import type { ParseResult } from '../../engine/commandParser'
import { executeCommand, finalizeInsertSession } from '../../engine/commandExecutor'
import { isStageClear } from '../../engine/clearChecker'
import { evaluateAttempt } from '../../engine/damageCalculator'
import type { StarRating } from '../../types/stage'

export type PlayStatus = 'playing' | 'clear' | 'dead'

export interface PlayState {
    editorState: EditorState
    damage: number
    life: number
    lifePercent: number
    projectedStars: StarRating
    status: PlayStatus
    parserBuffer: string
    usedHint: boolean
    lastInvalid: boolean
}

export interface PlayActions {
    handleKey: (key: string) => void
    reset: () => void
    useHint: () => void
}

export function usePlayEngine(stage: Stage): PlayState & PlayActions {
    const [editorState, setEditorState] = useState<EditorState>(() =>
        createEditorState(stage.initialText, stage.initialCursor),
    )
    const [damage, setDamage] = useState(0)
    const [usedHint, setUsedHint] = useState(false)
    const [status, setStatus] = useState<PlayStatus>('playing')
    const [parserBuffer, setParserBuffer] = useState('')
    const [lastInvalid, setLastInvalid] = useState(false)

    // Ref for insert-mode entry snapshot (for finalizeInsertSession)
    const insertEntryRef = useRef<EditorState | null>(null)

    // Parser instance (stable across renders, recreated on reset)
    const parserRef = useRef<CommandParser>(
        new CommandParser(stage.availableCommands),
    )

    const life = stage.life
    const lifePercent = Math.max(0, ((life - damage) / life) * 100)

    const projectedStars = useMemo(() => {
        const { stars } = evaluateAttempt(stage, damage, usedHint)
        return stars
    }, [stage, damage, usedHint])

    const handleKey = useCallback(
        (key: string) => {
            if (status !== 'playing') return

            const parser = parserRef.current

            // In insert mode, bypass parser for character input
            // (parser handles Esc, Backspace, Enter, but regular chars go direct)
            if (
                editorState.mode === 'insert' &&
                key !== 'Esc' &&
                key !== 'Backspace' &&
                key !== 'Enter' &&
                key.length === 1
            ) {
                const next = executeCommand(editorState, { raw: key, valid: true })
                setEditorState(next)
                return
            }

            const parseResult = parser.feed(key)
            setParserBuffer(parser.getState() === 'idle' ? '' : key)

            if (!parseResult) return // parser is accumulating (e.g., waiting for motion after 'd')

            handleParseResult(parseResult)
        },
        [status, editorState, stage],
    )

    const handleParseResult = useCallback(
        (result: ParseResult) => {
            setLastInvalid(!result.command.valid)

            if (!result.command.valid) {
                // Invalid command — no damage, red flash
                return
            }

            // Track damage
            const newDamage = damage + result.damage
            setDamage(newDamage)

            // Check death
            if (newDamage >= life) {
                setStatus('dead')
                return
            }

            // Execute the command
            let next: EditorState

            // Entering insert mode
            if (
                (result.command.raw === 'i' || result.command.raw === 'a') &&
                editorState.mode === 'normal'
            ) {
                next = executeCommand(editorState, result.command)
                insertEntryRef.current = editorState
                setEditorState(next)
                return
            }

            // Leaving insert mode
            if (result.command.raw === 'Esc' && editorState.mode === 'insert') {
                next = executeCommand(editorState, result.command)
                if (insertEntryRef.current) {
                    next = finalizeInsertSession(next, insertEntryRef.current)
                    insertEntryRef.current = null
                }
                setEditorState(next)
                checkClear(next, newDamage)
                return
            }

            next = executeCommand(editorState, result.command)
            setEditorState(next)

            // Check clear (only in normal mode)
            if (next.mode === 'normal') {
                checkClear(next, newDamage)
            }
        },
        [editorState, damage, life, stage, usedHint],
    )

    const checkClear = useCallback(
        (state: EditorState, currentDamage: number) => {
            if (isStageClear(state, stage)) {
                setStatus('clear')
            }
        },
        [stage],
    )

    const reset = useCallback(() => {
        setEditorState(createEditorState(stage.initialText, stage.initialCursor))
        setDamage(0)
        setUsedHint(false)
        setStatus('playing')
        setParserBuffer('')
        setLastInvalid(false)
        insertEntryRef.current = null
        parserRef.current = new CommandParser(stage.availableCommands)
    }, [stage])

    const useHint = useCallback(() => {
        setUsedHint(true)
    }, [])

    return {
        editorState,
        damage,
        life,
        lifePercent,
        projectedStars,
        status,
        parserBuffer,
        usedHint,
        lastInvalid,
        handleKey,
        reset,
        useHint,
    }
}
