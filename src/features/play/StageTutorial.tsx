/**
 * StageTutorial — the single tutorial rendering component (SSOT).
 * Used by both PlayScreen (inline before stage) and TutorialScreen (standalone route).
 *
 * Supports three step types:
 *   'key'           — wait for a specific key press (default)
 *   'hold_space'    — wait for Space hold then release (shows goal overlay)
 *   'colon_command' — wait for a :command input (e.g. :h, :e!)
 *   'search'        — wait for a /pattern search input (e.g. /bug)
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import type { Tutorial, TutorialStep } from '../../types/tutorial'
import type { Stage } from '../../types/stage'
import type { EditorState } from '../../types/editor'
import type { TutorialStatus } from '../../types/game'
import { createEditorState } from '../../types/editor'
import { executeCommand, finalizeInsertSession } from '../../engine/commandExecutor'
import { parseKeys, CommandParser } from '../../engine/commandParser'
import {
  parseSubstituteCommand,
  executeSubstituteCommand,
} from '../../engine/executors/commandLine'
import { EditorView } from './EditorView'
import { HintOverlay } from './HintOverlay'
import { playTick, playHint } from '../../engine/sound'
import { displayLabel } from './commandMetadata'
import '../tutorial/TutorialScreen.css'

interface Props {
  tutorial: Tutorial
  /** Stage data for goal overlay + title + fallback initial state. */
  stage?: Stage
  onComplete: (status: TutorialStatus, editorState?: EditorState) => void
  /** When true, this is a review (re-watch) — skip button says "閉じる" instead of "Skip" */
  isReview?: boolean
}

function stepType(step: TutorialStep) {
  return step.type ?? 'key'
}

export function StageTutorial({ tutorial, stage, onComplete, isReview }: Props) {
  // Resolve initial text/cursor: tutorial.initialSetup (legacy) > stage data
  const initText = tutorial.initialSetup?.text ?? stage?.initialText ?? ''
  const initCursor = useMemo(
    () => tutorial.initialSetup?.cursor ?? stage?.initialCursor ?? { line: 0, col: 0 },
    [tutorial.initialSetup?.cursor, stage?.initialCursor],
  )

  const [stepIdx, setStepIdx] = useState(0)
  const [editorState, setEditorState] = useState<EditorState>(() =>
    createEditorState(initText, initCursor),
  )
  const [wrongMessage, setWrongMessage] = useState<string | null>(null)
  const [spaceHeld, setSpaceHeld] = useState(false)
  const [colonBuffer, setColonBuffer] = useState('')
  const [searchBuffer, setSearchBuffer] = useState('')
  const [showHint, setShowHint] = useState(false)
  const spaceDownTime = useRef(0)
  const spaceHeldRef = useRef(false)
  const keyBuffer = useRef('')
  const [displayBuffer, setDisplayBuffer] = useState('')
  const insertEntryRef = useRef<{
    entryState: EditorState
    charCount: number
    insertText: string
    entryCommand: import('../../types/command').Command | null
  } | null>(null)

  const step = tutorial.steps[stepIdx] as TutorialStep | undefined

  // ─── Advance helper ────────────────────────────────────────
  const advance = useCallback(() => {
    setWrongMessage(null)
    setColonBuffer('')
    setSearchBuffer('')
    keyBuffer.current = ''
    setDisplayBuffer('')
    const nextIdx = stepIdx + 1
    if (nextIdx >= tutorial.steps.length) {
      // Pass editor state so PlayScreen can continue from here
      onComplete('completed', editorState)
    } else {
      setStepIdx(nextIdx)
      const nextStep = tutorial.steps[nextIdx]
      if (nextStep?.editorSetup) {
        insertEntryRef.current = null
        setEditorState(createEditorState(nextStep.editorSetup.text, nextStep.editorSetup.cursor))
      }
    }
  }, [stepIdx, tutorial, onComplete, editorState])

  // ─── keydown handler ───────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!step) return

      // Ignore bare modifier keys globally
      if (e.key === 'Shift' || e.key === 'Alt' || e.key === 'Control' || e.key === 'Meta') {
        return
      }

      const st = stepType(step)

      // ── hold_space step ──
      if (st === 'hold_space') {
        if (e.code === 'Space') {
          e.preventDefault()
          if (!spaceHeldRef.current) {
            spaceHeldRef.current = true
            setSpaceHeld(true)
            spaceDownTime.current = Date.now()
            setWrongMessage(null)
          }
          return
        }
        // Skip with Esc
        if (e.key === 'Escape') {
          e.preventDefault()
          playTick()
          onComplete('skipped', editorState)
          return
        }
        e.preventDefault()
        setWrongMessage('Space を長押ししろ')
        return
      }

      // ── search step ──
      if (st === 'search') {
        e.preventDefault()
        const target = step.searchCommand ?? '/pattern'

        if (e.key === 'Escape') {
          if (searchBuffer) {
            setSearchBuffer('')
            setWrongMessage(null)
            return
          }
          playTick()
          onComplete('skipped', editorState)
          return
        }

        // Start search buffer
        if (!searchBuffer && e.key === '/') {
          playTick()
          setSearchBuffer('/')
          setWrongMessage(null)
          return
        }

        if (searchBuffer) {
          if (e.key === 'Enter') {
            playTick()
            if (searchBuffer === target) {
              // Execute search via parser
              const pattern = target.slice(1)
              const keys = ['/', ...pattern.split(''), 'Enter']
              const parsed = parseKeys(keys)
              if (parsed) {
                const next = executeCommand(editorState, parsed.command)
                setEditorState(next)
              }
              advance()
            } else {
              setWrongMessage(
                step.wrongKeyMessage ?? `${searchBuffer} ではない。${target} と入力しろ`,
              )
              setSearchBuffer('')
            }
            return
          }
          if (e.key === 'Backspace') {
            const next = searchBuffer.slice(0, -1)
            setSearchBuffer(next || '')
            return
          }
          const key = mapKey(e)
          if (key && key.length === 1) {
            setSearchBuffer(searchBuffer + key)
            return
          }
          return
        }

        // Not starting with /
        setWrongMessage(`/ から入力しろ。${target} と入力してみろ`)
        return
      }

      // ── colon_command step ──
      if (st === 'colon_command') {
        e.preventDefault()
        const target = step.colonCommand ?? ':h'

        if (e.key === 'Escape') {
          if (colonBuffer) {
            setColonBuffer('')
            setWrongMessage(null)
            return
          }
          playTick()
          onComplete('skipped', editorState)
          return
        }

        // Start colon buffer
        if (!colonBuffer && e.key === ':') {
          playTick()
          setColonBuffer(':')
          setWrongMessage(null)
          return
        }

        if (colonBuffer) {
          if (e.key === 'Enter') {
            playTick()
            if (colonBuffer === target) {
              // Execute actual command effect
              if (target === ':e!') {
                setEditorState(createEditorState(initText, initCursor))
              } else if (target === ':q!') {
                onComplete('skipped', editorState)
                return
              } else if (target === ':h' && stage && stage.hints.length > 0) {
                playHint()
                setShowHint(true)
                return
              } else {
                // :s substitute commands
                const args = parseSubstituteCommand(target)
                if (args) {
                  setEditorState((s) => executeSubstituteCommand(s, args))
                }
              }
              advance()
            } else {
              setWrongMessage(
                step.wrongKeyMessage ?? `${colonBuffer} ではない。${target} と入力しろ`,
              )
              setColonBuffer('')
            }
            return
          }
          if (e.key === 'Backspace') {
            const next = colonBuffer.slice(0, -1)
            setColonBuffer(next || '')
            return
          }
          const key = mapKey(e)
          if (key && key.length === 1) {
            setColonBuffer(colonBuffer + key)
            return
          }
          return
        }

        // Not starting with :
        setWrongMessage(`: から入力しろ。${target} と入力してみろ`)
        return
      }

      // ── default key step ──
      e.preventDefault()

      const key = mapKey(e)
      if (!key) return

      // Skip with Esc — but not if the current step expects Esc
      if (key === 'Esc' && step.expectedKey !== 'Esc') {
        playTick()
        onComplete('skipped', editorState)
        return
      }

      playTick()

      // Info step (expectedKey === null) — any key advances
      if (step.expectedKey === null) {
        advance()
        return
      }

      // Check if key matches
      const accepted = step.acceptedKeys
        ? [...step.acceptedKeys, step.expectedKey]
        : [step.expectedKey]

      // Multi-key command handling (e.g. 'gg')
      const isMultiKey =
        step.expectedKey &&
        step.expectedKey.length > 1 &&
        !step.expectedKey.includes('+') &&
        step.expectedKey !== 'Esc' &&
        step.expectedKey !== 'Enter' &&
        step.expectedKey !== 'Backspace'

      if (isMultiKey) {
        const buf = keyBuffer.current + key
        if (step.expectedKey!.startsWith(buf)) {
          keyBuffer.current = buf
          setDisplayBuffer(buf)
          if (buf === step.expectedKey) {
            setDisplayBuffer('')
            setWrongMessage(null)
            const parsed = parseKeys(buf.split(''))
            if (parsed) {
              const next = executeCommand(editorState, parsed.command)
              if (next.mode === 'insert' && editorState.mode !== 'insert') {
                insertEntryRef.current = {
                  entryState: editorState,
                  charCount: 0,
                  insertText: '',
                  entryCommand: parsed.command,
                }
              }
              setEditorState(next)
            }
            advance()
          }
          return
        }
        keyBuffer.current = ''
        setDisplayBuffer('')
        setWrongMessage(step.wrongKeyMessage ?? `${key} じゃない。${step.expectedKey} を押してみろ`)
        return
      }

      if (accepted.includes(key)) {
        setWrongMessage(null)
        // Apply key to editor
        if (editorState.mode === 'insert') {
          if (key === 'Esc') {
            let next = executeCommand(editorState, { raw: key, valid: true })
            if (insertEntryRef.current) {
              next = finalizeInsertSession(
                next,
                insertEntryRef.current.entryState,
                insertEntryRef.current.charCount,
              )
              if (insertEntryRef.current.entryCommand) {
                next = {
                  ...next,
                  lastCommand: insertEntryRef.current.entryCommand,
                  lastInsertText: insertEntryRef.current.insertText,
                }
              }
              insertEntryRef.current = null
            }
            setEditorState(next)
          } else {
            const next = executeCommand(editorState, { raw: key, valid: true })
            setEditorState(next)
            if (insertEntryRef.current) {
              insertEntryRef.current.charCount++
              insertEntryRef.current.insertText += key === 'Enter' ? '\n' : key
            }
          }
        } else if (editorState.mode === 'visual') {
          // Visual mode: use parser with editor mode set so d/y/c are standalone
          const parser = new CommandParser()
          parser.setEditorMode('visual')
          const parsed = parser.feed(key)
          if (parsed) {
            const next = executeCommand(editorState, parsed.command)
            if (next.mode === 'insert') {
              insertEntryRef.current = {
                entryState: editorState,
                charCount: 0,
                insertText: '',
                entryCommand: parsed.command,
              }
            }
            setEditorState(next)
          } else {
            // Motion keys (j/k/h/l etc.) — parse normally
            const motionParsed = parseKeys([key])
            if (motionParsed) {
              const next = executeCommand(editorState, motionParsed.command)
              setEditorState(next)
            }
          }
        } else {
          const parsed = parseKeys([key])
          if (parsed) {
            const next = executeCommand(editorState, parsed.command)
            if (next.mode === 'insert') {
              insertEntryRef.current = {
                entryState: editorState,
                charCount: 0,
                insertText: '',
                entryCommand: parsed.command,
              }
            }
            setEditorState(next)
          }
        }

        if (key === step.expectedKey) {
          advance()
        }
      } else {
        setWrongMessage(step.wrongKeyMessage ?? `${key} じゃない。${step.expectedKey} を押してみろ`)
      }
    },
    [
      step,
      editorState,
      onComplete,
      colonBuffer,
      searchBuffer,
      advance,
      initText,
      initCursor,
      stage,
    ],
  )

  // ─── keyup handler (for hold_space) ────────────────────────
  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceHeldRef.current = false
        setSpaceHeld(false)
        if (step && stepType(step) === 'hold_space') {
          const held = Date.now() - spaceDownTime.current
          if (held >= 500) {
            playTick()
            advance()
          } else {
            setWrongMessage('もっと長く押せ！ ゴールをよく見ろ')
          }
        }
      }
    },
    [step, advance],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  const isReplace = editorState.mode === 'insert' && editorState.replaceMode === true
  const modeClass = isReplace
    ? ' replace-mode'
    : editorState.mode === 'insert'
      ? ' insert-mode'
      : editorState.mode === 'visual'
        ? ' visual-mode'
        : ''

  // Goal data for hold_space overlay
  const showGoal = spaceHeld && step !== undefined && stepType(step) === 'hold_space'

  // Key hint display
  const keyHintText =
    step &&
    (stepType(step) === 'hold_space'
      ? 'Space (長押し)'
      : stepType(step) === 'colon_command'
        ? `${step.colonCommand ?? ':h'} ↵`
        : stepType(step) === 'search'
          ? `${step.searchCommand ?? '/pattern'} ↵`
          : step.expectedKey === ' '
            ? 'Space'
            : step.expectedKey)

  return (
    <div className={`tutorial-screen${modeClass}`}>
      {/* Top Bar */}
      <div className="tutorial-top-bar">
        <div className="tutorial-top-left">
          <span className="tutorial-badge">TUTORIAL</span>
          <span className="tutorial-title">
            {stage ? `${stage.id}: ${stage.title}` : tutorial.nodeId}
          </span>
        </div>

        <div className="step-progress">
          {tutorial.steps.map((_, i) => (
            <div
              key={i}
              className={`step-dot${i < stepIdx ? ' done' : i === stepIdx ? ' current' : ''}`}
            />
          ))}
          <span className="step-label">
            {Math.min(stepIdx + 1, tutorial.steps.length)} / {tutorial.steps.length}
          </span>
        </div>

        <span className={`tutorial-mode${editorState.mode === 'insert' ? ' insert' : ''}`}>
          {isReplace ? 'REPLACE' : editorState.mode.toUpperCase()}
        </span>
      </div>

      {/* Editor */}
      <div className="tutorial-editor-area">
        <EditorView
          state={editorState}
          goalText={stage?.goalText}
          goalCursor={stage?.clearConditions?.cursor}
          showGoal={showGoal}
        />
        {displayBuffer && <div className="parser-buffer">{displayBuffer}_</div>}
      </div>

      {/* Command-line buffer (colon / search) */}
      {(colonBuffer || searchBuffer) && (
        <div className="colon-cmd">
          {colonBuffer || searchBuffer}
          <span className="colon-cursor">█</span>
        </div>
      )}

      {/* Hint Overlay */}
      {showHint && stage && stage.hints.length > 0 && (
        <HintOverlay
          stage={stage}
          onClose={() => {
            setShowHint(false)
            advance()
          }}
        />
      )}

      {/* Navigator Bar */}
      <div
        className={`navigator-bar${wrongMessage ? ' wrong' : ''}`}
        style={colonBuffer || searchBuffer ? { paddingBottom: 40 } : undefined}
      >
        <button
          className="skip-btn"
          onClick={() => {
            playTick()
            onComplete(isReview ? 'completed' : 'skipped', editorState)
          }}
          title={isReview ? 'Esc で閉じる' : 'Esc でスキップ'}
        >
          {isReview ? '閉じる ✕' : 'Skip ▸'}
        </button>
        <div className="navi-icon">
          <div className="mini-cube-wrapper">
            <div className="mini-cube">
              <div className="mini-face front" />
              <div className="mini-face back" />
              <div className="mini-face left" />
              <div className="mini-face right" />
              <div className="mini-face top" />
              <div className="mini-face bottom" />
            </div>
          </div>
        </div>
        <div className="navi-content">
          <div className="navi-name">ナビゲーター</div>
          <div className="navi-message">
            {wrongMessage ?? step?.message ?? 'チュートリアル完了！'}
          </div>
          {keyHintText && (
            <div className="navi-key-hint">
              <kbd>{displayLabel(keyHintText)}</kbd>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function mapKey(e: KeyboardEvent): string | null {
  if (e.ctrlKey && e.key === 'r') return 'Ctrl+R'
  if (e.ctrlKey && e.key === 'd') return 'Ctrl+d'
  if (e.ctrlKey && e.key === 'u') return 'Ctrl+u'
  if (e.ctrlKey && e.key === 'v') return 'Ctrl+v'
  if (e.ctrlKey && e.key === 'a') return 'Ctrl+a'
  if (e.ctrlKey && e.key === 'x') return 'Ctrl+x'
  if (e.ctrlKey && e.key === 'e') return 'Ctrl+e'
  if (e.ctrlKey && e.key === 'y') return 'Ctrl+y'
  if (e.ctrlKey && e.key === 'o') return 'Ctrl+o'
  if (e.ctrlKey && e.key === 'i') return 'Ctrl+i'
  if (e.ctrlKey && e.key === 'f') return 'Ctrl+f'
  if (e.ctrlKey && e.key === 'b') return 'Ctrl+b'
  if (e.ctrlKey || e.metaKey) return null
  if (e.key === 'Escape') return 'Esc'
  if (e.key === 'Backspace') return 'Backspace'
  if (e.key === 'Enter') return 'Enter'
  if (e.key.length === 1) return e.key
  return null
}
