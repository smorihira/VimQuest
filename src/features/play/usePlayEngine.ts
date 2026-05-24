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
import type { Command } from '../../types/command'
import { createEditorState } from '../../types/editor'
import { CommandParser } from '../../engine/commandParser'
import { executeCommand, finalizeInsertSession } from '../../engine/commandExecutor'
import { isStageClear } from '../../engine/clearChecker'
import { evaluateAttempt } from '../../engine/damageCalculator'
import type { StarRating } from '../../types/stage'
import type { SpellEntry } from '../../types/spell'

export type { SpellEntry }
export type PlayStatus = 'playing' | 'clear' | 'dead'

/** Number of free characters per INSERT session before excess damage kicks in */
const INSERT_FREE_CHARS = 5

/** Insert session tracking state */
interface InsertSession {
  entryState: EditorState
  charCount: number
  command: string
  damageAtEntry: number
  entryCommand: Command
  insertText: string
}

/** Stamp damageAtEntry on the last undoStack operation (if stack grew) */
function stampDamageAtEntry(
  next: EditorState,
  prev: EditorState,
  damageAtEntry: number,
): EditorState {
  if (next.undoStack.length <= prev.undoStack.length) return next
  const lastOp = next.undoStack[next.undoStack.length - 1]
  return {
    ...next,
    undoStack: [...next.undoStack.slice(0, -1), { ...lastOp, damageAtEntry }],
  }
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

export function usePlayEngine(
  stage: Stage,
  baseCommands?: readonly string[],
  initialEditorState?: EditorState,
): PlayState & PlayActions {
  const [editorState, setEditorState] = useState<EditorState>(
    () => initialEditorState ?? createEditorState(stage.initialText, stage.initialCursor),
  )
  const [damage, setDamage] = useState(0)
  const [usedHint, setUsedHint] = useState(false)
  // If initial state already clears the stage (tutorial completed the goal), start as 'clear'
  const [status, setStatus] = useState<PlayStatus>(() =>
    initialEditorState && isStageClear(initialEditorState, stage) ? 'clear' : 'playing',
  )
  const [parserBuffer, setParserBuffer] = useState('')
  const [lastInvalid, setLastInvalid] = useState(false)
  const [lastExecutedRaw, setLastExecutedRaw] = useState('')
  const [commandSeq, setCommandSeq] = useState(0)

  // Insert session tracking (consolidated)
  const insertRef = useRef<InsertSession | null>(null)

  // Spell (command history) tracking
  const [spells, setSpells] = useState<SpellEntry[]>([])

  // Parser instance (stable across renders, recreated on reset)
  const parserRef = useRef<CommandParser>(
    new CommandParser(
      stage.availableCommands,
      undefined,
      stage.visualCommands,
      baseCommands as string[] | undefined,
    ),
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

      // ── INSERT mode: handle all keys directly (only Esc falls through to parser) ──
      if (editorState.mode === 'insert' && key !== 'Esc') {
        // Arrow keys: disabled in INSERT mode
        if (key.startsWith('Arrow')) return

        // Backspace: only allowed for chars typed in this session
        if (key === 'Backspace') {
          if (!insertRef.current || insertRef.current.charCount <= 0) return
          insertRef.current.charCount--
          insertRef.current.insertText = insertRef.current.insertText.slice(0, -1)
          const next = executeCommand(editorState, { raw: key, valid: true })
          setEditorState(next)
          return
        }

        // Enter: counts as a typed character
        if (key === 'Enter') {
          if (insertRef.current) {
            insertRef.current.charCount++
            insertRef.current.insertText += '\n'
          }
          const next = executeCommand(editorState, { raw: key, valid: true })
          setEditorState(next)
          return
        }

        // Regular character input
        if (key.length === 1) {
          if (insertRef.current) {
            insertRef.current.charCount++
            insertRef.current.insertText += key
          }
          const next = executeCommand(editorState, { raw: key, valid: true })
          setEditorState(next)
          return
        }

        // Other keys (Ctrl combinations, etc.): ignore in INSERT
        return
      }

      // Sync parser with current editor mode (needed for visual mode d/x/y/c handling)
      parser.setEditorMode(editorState.mode)

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

      // ── Undo: restore damage to damageAtEntry (full rollback including movement damage) ──
      if (raw === 'u') {
        if (editorState.undoStack.length > 0) {
          const op = editorState.undoStack[editorState.undoStack.length - 1]
          setDamage(op.damageAtEntry)
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
        insertRef.current = {
          entryState: editorState,
          charCount: 0,
          command: raw,
          damageAtEntry: damage,
          entryCommand: parseResult.command,
          insertText: '',
        }
        setEditorState(next)
        return
      }

      // ── Visual change (c): delete selection + enter insert ──
      if (raw === 'c' && editorState.mode === 'visual') {
        const next = executeCommand(editorState, parseResult.command)
        insertRef.current = {
          entryState: editorState,
          charCount: 0,
          command: 'c',
          damageAtEntry: damage,
          entryCommand: parseResult.command,
          insertText: '',
        }
        setEditorState(next)
        return
      }

      // ── Leaving insert mode (Esc): compute session damage ──
      if (raw === 'Esc' && editorState.mode === 'insert') {
        let next = executeCommand(editorState, parseResult.command)
        const session = insertRef.current
        if (session) {
          const charCount = session.charCount
          next = finalizeInsertSession(next, session.entryState, charCount)
          next = stampDamageAtEntry(next, editorState, session.damageAtEntry)
          // Set lastCommand + lastInsertText for dot repeat
          next = {
            ...next,
            lastCommand: session.entryCommand,
            lastInsertText: session.insertText,
          }
          insertRef.current = null

          // Compute insert damage: base cost 1 + excess chars beyond free threshold
          const insertDamage = 1 + Math.max(0, charCount - INSERT_FREE_CHARS)
          const newDamage = damage + insertDamage
          setDamage(newDamage)
          setSpells((prev) => [
            ...prev,
            { command: session.command + '…Esc', damage: insertDamage },
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

      // ── Esc in visual mode: exit visual (free) ──
      if (raw === 'Esc' && editorState.mode === 'visual') {
        const next = executeCommand(editorState, parseResult.command)
        setEditorState(next)
        return
      }

      // ── Esc in normal mode: free ──
      if (raw === 'Esc') {
        return
      }

      // ── All other commands: add parser damage ──
      const next = stampDamageAtEntry(
        executeCommand(editorState, parseResult.command),
        editorState,
        damage,
      )

      // Skip damage if state didn't change (e.g., motion hitting wall)
      // Still update state for register changes (e.g., yank)
      if (
        next.text === editorState.text &&
        next.cursor.line === editorState.cursor.line &&
        next.cursor.col === editorState.cursor.col &&
        next.mode === editorState.mode &&
        next.viewportTop === editorState.viewportTop
      ) {
        setEditorState(next)
        return
      }

      // If command transitioned into insert mode (cc, cw, C, s, S, etc.),
      // defer damage to Esc (entry = 0, unified with Path A).
      if (next.mode === 'insert' && editorState.mode !== 'insert') {
        insertRef.current = {
          entryState: editorState,
          charCount: 0,
          command: raw,
          damageAtEntry: damage,
          entryCommand: parseResult.command,
          insertText: '',
        }
        setEditorState(next)
        return
      }

      const newDamage = damage + parseResult.damage
      setDamage(newDamage)
      setSpells((prev) => [...prev, { command: raw, damage: parseResult.damage }])

      if (newDamage >= life) {
        setStatus('dead')
        return
      }

      // Set lastCommand for dot repeat:
      // - Skip '.' (it preserves its own lastCommand internally)
      // - Only for commands that changed text and stayed in normal mode
      const finalNext =
        raw !== '.' && next.text !== editorState.text && next.mode !== 'insert'
          ? { ...next, lastCommand: parseResult.command }
          : next

      setEditorState(finalNext)

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
    insertRef.current = null
    parserRef.current = new CommandParser(
      stage.availableCommands,
      undefined,
      stage.visualCommands,
      baseCommands as string[] | undefined,
    )
    setSpells([])
  }, [stage, baseCommands])

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
