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
import { executeCommand, finalizeInsertSession } from '../../engine/commandExecutor'
import { isStageClear } from '../../engine/clearChecker'
import { evaluateAttempt } from '../../engine/damageCalculator'
import type { StarRating } from '../../types/stage'

export type PlayStatus = 'playing' | 'clear' | 'dead'

export interface SpellEntry {
  command: string
  damage: number
}

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
  spells: SpellEntry[]
  lastExecutedRaw: string
  commandSeq: number
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
  const [lastExecutedRaw, setLastExecutedRaw] = useState('')
  const [commandSeq, setCommandSeq] = useState(0)

  // Ref for insert-mode entry snapshot (for finalizeInsertSession)
  const insertEntryRef = useRef<EditorState | null>(null)
  // Net character count during current insert session
  const insertCharCount = useRef(0)
  // Command that started the current insert session
  const insertCommandRef = useRef<string>('')

  // Spell (command history) tracking
  const [spells, setSpells] = useState<SpellEntry[]>([])

  // Parser instance (stable across renders, recreated on reset)
  const parserRef = useRef<CommandParser>(new CommandParser(stage.availableCommands))

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
        insertCharCount.current++
        const next = executeCommand(editorState, { raw: key, valid: true })
        setEditorState(next)
        return
      }

      // Arrow keys in insert mode: move cursor without damage
      if (editorState.mode === 'insert' && key.startsWith('Arrow')) {
        const motionMap: Record<string, string> = {
          ArrowLeft: 'h',
          ArrowDown: 'j',
          ArrowUp: 'k',
          ArrowRight: 'l',
        }
        const motion = motionMap[key]
        if (motion) {
          const next = executeCommand(
            { ...editorState, mode: 'normal' },
            { raw: motion, motion: motion as 'h' | 'j' | 'k' | 'l', valid: true },
          )
          setEditorState({ ...next, mode: 'insert' })
        }
        return
      }

      // Track Backspace/Enter char count in insert mode
      if (editorState.mode === 'insert') {
        if (key === 'Backspace') {
          insertCharCount.current = Math.max(0, insertCharCount.current - 1)
        } else if (key === 'Enter') {
          insertCharCount.current++
        }
      }

      const parseResult = parser.feed(key)
      setParserBuffer(parser.getState() === 'idle' ? '' : parser.getDisplayBuffer())

      if (!parseResult) return // parser is accumulating (e.g., waiting for motion after 'd')

      // --- inline handleParseResult ---
      setLastInvalid(!parseResult.command.valid)
      setCommandSeq((s) => s + 1)

      if (!parseResult.command.valid) {
        // Invalid command — no damage, red flash
        return
      }

      const raw = parseResult.command.raw
      setLastExecutedRaw(raw)

      // ── Undo: restore damage from undone operation ──
      if (raw === 'u') {
        if (editorState.undoStack.length > 0) {
          const op = editorState.undoStack[editorState.undoStack.length - 1]
          setDamage((prev) => Math.max(0, prev - op.damage))
          setSpells((prev) => prev.slice(0, -1))
        }
        const next = executeCommand(editorState, parseResult.command)
        setEditorState(next)
        if (next.mode === 'normal' && isStageClear(next, stage)) {
          setStatus('clear')
        }
        return
      }

      // ── Redo: re-add damage from redone operation ──
      if (raw === 'Ctrl+R') {
        if (editorState.redoStack.length > 0) {
          const op = editorState.redoStack[editorState.redoStack.length - 1]
          const newDamage = damage + op.damage
          setDamage(newDamage)
          setSpells((prev) => [...prev, { command: 'Ctrl+R', damage: op.damage }])
          if (newDamage >= life) {
            setStatus('dead')
            return
          }
        }
        const next = executeCommand(editorState, parseResult.command)
        setEditorState(next)
        return
      }

      // ── Entering insert mode (i/a/I/A): defer damage to session finalize ──
      if (
        (raw === 'i' || raw === 'a' || raw === 'I' || raw === 'A' || raw === 'o' || raw === 'O') &&
        editorState.mode === 'normal'
      ) {
        const next = executeCommand(editorState, parseResult.command)
        insertEntryRef.current = editorState
        insertCharCount.current = 0
        insertCommandRef.current = raw
        setEditorState(next)
        return
      }

      // ── Leaving insert mode (Esc): compute session damage ──
      if (raw === 'Esc' && editorState.mode === 'insert') {
        let next = executeCommand(editorState, parseResult.command)
        if (insertEntryRef.current) {
          const charCount = insertCharCount.current
          next = finalizeInsertSession(next, insertEntryRef.current, charCount)
          insertEntryRef.current = null

          // Compute insert damage: 0 for empty session, ceil(charCount/5) otherwise
          const insertDamage =
            charCount === 0 && next.text === editorState.text
              ? 0
              : charCount <= 0
                ? 1
                : Math.ceil(charCount / 5)
          const newDamage = damage + insertDamage
          setDamage(newDamage)
          setSpells((prev) => [
            ...prev,
            { command: insertCommandRef.current + '…Esc', damage: insertDamage },
          ])
          if (newDamage >= life) {
            setStatus('dead')
            return
          }
        }
        setEditorState(next)
        if (isStageClear(next, stage)) {
          setStatus('clear')
        }
        return
      }

      // ── Esc in normal mode: free ──
      if (raw === 'Esc') {
        return
      }

      // ── All other commands: add parser damage ──
      const next = executeCommand(editorState, parseResult.command)

      // Skip damage if state didn't change (e.g., motion hitting wall)
      if (
        next.text === editorState.text &&
        next.cursor.line === editorState.cursor.line &&
        next.cursor.col === editorState.cursor.col &&
        next.mode === editorState.mode
      ) {
        return
      }

      const newDamage = damage + parseResult.damage
      setDamage(newDamage)
      setSpells((prev) => [...prev, { command: raw, damage: parseResult.damage }])

      if (newDamage >= life) {
        setStatus('dead')
        return
      }

      setEditorState(next)

      // Check clear (only in normal mode)
      if (next.mode === 'normal' && isStageClear(next, stage)) {
        setStatus('clear')
      }
    },
    [status, editorState, damage, life, stage],
  )

  const reset = useCallback(() => {
    setEditorState(createEditorState(stage.initialText, stage.initialCursor))
    setDamage(0)
    setUsedHint(false)
    setStatus('playing')
    setParserBuffer('')
    setLastInvalid(false)
    setLastExecutedRaw('')
    insertEntryRef.current = null
    insertCharCount.current = 0
    insertCommandRef.current = ''
    parserRef.current = new CommandParser(stage.availableCommands)
    setSpells([])
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
    spells,
    lastExecutedRaw,
    commandSeq,
    handleKey,
    reset,
    useHint,
  }
}
