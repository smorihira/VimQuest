/**
 * usePlayEngine — custom hook that wires CommandSession to React state.
 *
 * Returns editor state, damage, life %, star projection,
 * and a handleKey function for the Play screen.
 */

import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import type { Stage } from '../../types/stage'
import { isScoredStage } from '../../types/stage'
import type { EditorState } from '../../types/editor'
import { createEditorState } from '../../types/editor'
import { evaluateAttempt } from '../../engine/damageCalculator'
import { isStageClear } from '../../engine/clearChecker'
import type { StarRating } from '../../types/stage'
import type { SpellEntry } from '../../types/spell'
import { CommandSession } from '../../engine/commandSession'
import type { SessionStatus } from '../../engine/commandSession'

export type { SpellEntry }
export type PlayStatus = SessionStatus

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
  feedColonCommand: (cmd: string) => void
  reset: () => void
  useHint: () => void
}

export function usePlayEngine(
  stage: Stage,
  baseCommands?: readonly string[],
  initialEditorState?: EditorState,
): PlayState & PlayActions {
  const life = isScoredStage(stage.type) ? stage.life : 999

  const createSession = useCallback(
    () =>
      new CommandSession({
        initialText: stage.initialText,
        initialCursor: stage.initialCursor,
        availableCommands: stage.availableCommands,
        baseCommands: baseCommands as string[] | undefined,
        visualCommands: stage.visualCommands,
        life,
        stage,
        initialState: initialEditorState,
      }),
    [stage, baseCommands, life, initialEditorState],
  )

  const sessionRef = useRef<CommandSession>(null as unknown as CommandSession)
  if (sessionRef.current === null) {
    sessionRef.current = createSession()
  }

  // Compute initial values without accessing ref during render
  const initialState =
    initialEditorState ?? createEditorState(stage.initialText, stage.initialCursor)
  const initialStatus: PlayStatus =
    initialEditorState && isStageClear(initialEditorState, stage) ? 'clear' : 'playing'

  const [editorState, setEditorState] = useState<EditorState>(() => initialState)
  const [damage, setDamage] = useState(0)
  const [usedHint, setUsedHint] = useState(false)
  const [status, setStatus] = useState<PlayStatus>(() => initialStatus)
  const [parserBuffer, setParserBuffer] = useState('')
  const [lastInvalid, setLastInvalid] = useState(false)
  const [lastExecutedRaw, setLastExecutedRaw] = useState('')
  const [commandSeq, setCommandSeq] = useState(0)
  const [spells, setSpells] = useState<SpellEntry[]>([])

  const lifePercent = Math.max(0, ((life - damage) / life) * 100)

  const projectedStars = useMemo(() => {
    const { stars } = evaluateAttempt(stage, damage, usedHint)
    return stars
  }, [stage, damage, usedHint])

  const handleKey = useCallback((key: string) => {
    const session = sessionRef.current
    if (session.status !== 'playing') return

    const prevPlus = session.editorState.registers['+']
    const wasInsertNonEsc = session.editorState.mode === 'insert' && key !== 'Esc'
    const result = session.feedKey(key)
    const snap = session.getSnapshot()

    // Sync + register → system clipboard
    if (snap.editorState.registers['+'] !== prevPlus && snap.editorState.registers['+']) {
      navigator.clipboard.writeText(snap.editorState.registers['+']).catch(() => {})
    }

    // Always sync editor state and parser buffer
    setEditorState(snap.editorState)
    setParserBuffer(snap.parserBuffer)

    // INSERT mode chars: just sync editor state, no commandSeq/lastInvalid
    if (wasInsertNonEsc) return

    // Parser accumulating (e.g., waiting for motion after 'd')
    if (!result.executed && !result.invalid) return

    // Parser produced a result (valid or invalid)
    setCommandSeq((s) => s + 1)
    setLastInvalid(result.invalid)
    if (result.invalid) return

    // Valid command executed — sync remaining state
    setDamage(snap.damage)
    setStatus(snap.status)
    setSpells(snap.spells)
    setLastExecutedRaw(result.commandRaw)
  }, [])

  const feedColonCommand = useCallback((cmd: string) => {
    const session = sessionRef.current
    if (session.status !== 'playing') return
    const prevPlus = session.editorState.registers['+']
    const result = session.feedColonCommand(cmd)
    const snap = session.getSnapshot()
    if (snap.editorState.registers['+'] !== prevPlus && snap.editorState.registers['+']) {
      navigator.clipboard.writeText(snap.editorState.registers['+']).catch(() => {})
    }
    setEditorState(snap.editorState)
    if (!result.executed) return
    setCommandSeq((s) => s + 1)
    setDamage(snap.damage)
    setStatus(snap.status)
    setSpells(snap.spells)
    setLastExecutedRaw(result.commandRaw)
  }, [])

  const reset = useCallback(() => {
    const newSession = createSession()
    sessionRef.current = newSession
    const snap = newSession.getSnapshot()
    setEditorState(snap.editorState)
    setDamage(0)
    setUsedHint(false)
    setStatus(snap.status)
    setParserBuffer('')
    setLastInvalid(false)
    setLastExecutedRaw('')
    setSpells([])
  }, [createSession])

  const useHint = useCallback(() => {
    setUsedHint(true)
  }, [])

  // Sync system clipboard → + register on window focus
  useEffect(() => {
    const syncClipboard = () => {
      navigator.clipboard
        .readText()
        .then((text) => {
          if (text && sessionRef.current) {
            sessionRef.current.setRegister('+', text)
          }
        })
        .catch(() => {})
    }
    window.addEventListener('focus', syncClipboard)
    // Also sync on mount
    syncClipboard()
    return () => window.removeEventListener('focus', syncClipboard)
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
    feedColonCommand,
    reset,
    useHint,
  }
}
