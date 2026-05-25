/**
 * PlayScreen — main game play screen.
 * Manages keyboard input, displays editor + HUD + hand cards.
 * If the stage has a tutorial, shows it before entering play phase.
 */

import { useEffect, useCallback, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router'
import { useAtomValue, useSetAtom } from 'jotai'
import { getStage } from '../../data/stages'
import { getTutorial } from '../../data/tutorials'
import { BASE_COMMANDS } from '../../data/constants'
import { gameProgressAtom } from '../../store/atoms'
import type { EditorState } from '../../types/editor'
import { usePlayEngine } from './usePlayEngine'
import { EditorView } from './EditorView'
import { NavigatorCube } from './NavigatorCube'
import { HintOverlay } from './HintOverlay'
import { StageTutorial } from './StageTutorial'
import { TopBar } from './components/TopBar'
import { CardPanel } from './components/CardPanel'
import { mapKeyEvent } from './commandMetadata'
import {
  playTick,
  playError,
  playClear,
  playGameOver,
  playType,
  playHint,
} from '../../engine/sound'
import { isMuted, setMuted } from '../../engine/sound'
import './PlayScreen.css'

export function PlayScreen() {
  const { stageId } = useParams<{ stageId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const stage = stageId ? getStage(stageId) : undefined
  const progress = useAtomValue(gameProgressAtom)
  const setProgress = useSetAtom(gameProgressAtom)
  const [tutorialResult, setTutorialResult] = useState<{
    done: boolean
    editorState?: EditorState
  }>({ done: false })

  // Check if navigated from TutorialScreen review
  const locationState = location.state as {
    practiceMode?: boolean
    reviewEditorState?: EditorState
  } | null
  const practiceFromReview = locationState?.practiceMode ?? false
  const reviewEditorState = locationState?.reviewEditorState

  if (!stage) {
    return <div className="play-error">Stage not found: {stageId}</div>
  }

  const tutorial = getTutorial(stage.id, stage.nodeId)
  const alreadyDone = progress.tutorialStatus[stage.id] != null

  // Practice play after review tutorial (from TutorialScreen) — must check before showTutorial
  if (practiceFromReview) {
    return (
      <PlayScreenInner
        stage={stage}
        navigate={navigate}
        hasStageTutorial={!!tutorial}
        initialEditorState={reviewEditorState}
        practiceMode
      />
    )
  }

  const showTutorial = tutorial && !alreadyDone && !tutorialResult.done

  if (showTutorial) {
    return (
      <StageTutorial
        tutorial={tutorial}
        stage={stage}
        onComplete={(status, editorState) => {
          setTutorialResult({ done: true, editorState })
          setProgress((prev) => ({
            ...prev,
            tutorialStatus: {
              ...prev.tutorialStatus,
              [stage.id]: status,
            },
          }))
        }}
      />
    )
  }

  return (
    <PlayScreenInner
      stage={stage}
      navigate={navigate}
      hasStageTutorial={!!tutorial}
      initialEditorState={tutorialResult.editorState}
    />
  )
}

function PlayScreenInner({
  stage,
  navigate,
  hasStageTutorial,
  initialEditorState,
  practiceMode,
}: {
  stage: NonNullable<ReturnType<typeof getStage>>
  navigate: ReturnType<typeof useNavigate>
  hasStageTutorial: boolean
  initialEditorState?: EditorState
  practiceMode?: boolean
}) {
  const showBase = stage.nodeId !== 'N01' || stage.id === 'N01-C'
  const play = usePlayEngine(stage, showBase ? BASE_COMMANDS : undefined, initialEditorState)
  const fromTutorial = !!initialEditorState
  const [spaceHeld, setSpaceHeld] = useState(false)
  const [muted, setMutedState] = useState(isMuted())
  const [showHint, setShowHint] = useState(false)
  const [focused, setFocused] = useState(true)
  const [colonBuffer, setColonBuffer] = useState('')

  // Base row: only N01-C auto-expands, all others default closed
  const [baseExpanded, setBaseExpanded] = useState(stage.id === 'N01-C')

  // Focus loss detection
  useEffect(() => {
    const onBlur = () => setFocused(false)
    const onFocus = () => setFocused(true)
    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  const toggleMute = useCallback(() => {
    const next = !muted
    setMutedState(next)
    setMuted(next)
  }, [muted])

  // Navigate on clear/dead
  useEffect(() => {
    if (play.status === 'clear') {
      playClear()
      const timer = setTimeout(() => {
        navigate(`/result/${stage.id}`, {
          state: {
            damage: play.damage,
            usedHint: play.usedHint,
            spells: play.spells,
            fromTutorial,
            practiceMode: practiceMode || undefined,
          },
        })
      }, 600)
      return () => clearTimeout(timer)
    }
    if (play.status === 'dead') {
      playGameOver()
      const timer = setTimeout(() => {
        navigate(`/gameover/${stage.id}`, {
          state: { damage: play.damage, spells: play.spells },
        })
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [play.status, stage.id, play.damage, play.usedHint, play.spells, navigate])

  // Sound effects for commands
  useEffect(() => {
    if (play.lastInvalid) playError()
  }, [play.lastInvalid, play.commandSeq])

  useEffect(() => {
    if (play.lastExecutedRaw && !play.lastInvalid) {
      if (play.editorState.mode === 'insert') {
        playType()
      } else {
        playTick()
      }
    }
  }, [play.lastExecutedRaw, play.lastInvalid, play.editorState.mode, play.commandSeq])

  // Keyboard handler
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (play.status !== 'playing') return

      // Space vision: hold Space in normal/visual mode to see goal
      // Skip when parser is accumulating (operator-pending, search, etc.)
      if (e.code === 'Space' && play.editorState.mode !== 'insert' && !play.parserBuffer) {
        e.preventDefault()
        setSpaceHeld(true)
        return
      }

      // Ignore bare modifier keys (Shift, Alt, etc.) — do NOT preventDefault
      if (e.key === 'Shift' || e.key === 'Alt' || e.key === 'Control' || e.key === 'Meta') {
        return
      }

      e.preventDefault()

      // Map key events to our key strings
      const key = mapKeyEvent(e)
      if (!key) return

      // :q! / :e! / :h — colon-command buffer in normal mode
      // Skip when parser is accumulating (operator-pending, search, etc.)
      if (play.editorState.mode === 'normal' && !play.parserBuffer) {
        if (key === ':') {
          setColonBuffer(':')
          return
        }
        if (colonBuffer) {
          if (e.key === 'Escape') {
            setColonBuffer('')
            return
          }
          if (e.key === 'Enter') {
            const cmd = colonBuffer
            setColonBuffer('')
            if (cmd === ':q!') {
              playTick()
              navigate('/tree', { state: { nodeId: stage.nodeId } })
            } else if (cmd === ':e!') {
              playTick()
              play.reset()
            } else if (cmd === ':h') {
              if (stage.hints.length > 0) {
                playHint()
                play.useHint()
                setShowHint(true)
              }
            }
            return
          }
          if (e.key === 'Backspace') {
            const next = colonBuffer.slice(0, -1)
            setColonBuffer(next || '')
            if (!next) return
            return
          }
          const validPrefixes = [':q', ':q!', ':e', ':e!', ':h']
          const next = colonBuffer + key
          if (validPrefixes.includes(next)) {
            setColonBuffer(next)
            return
          }
          setColonBuffer('')
          // Don't swallow the key — fall through to handleKey
        }
      }

      // ? key toggles base row
      if (key === '?' && play.editorState.mode === 'normal' && showBase) {
        setBaseExpanded((v) => !v)
        playTick()
        return
      }

      // Esc in normal mode with no pending parser input → exit stage
      if (key === 'Esc' && play.editorState.mode === 'normal' && !play.parserBuffer) {
        playTick()
        navigate('/tree', { state: { nodeId: stage.nodeId } })
        return
      }

      play.handleKey(key)
    },
    [play, navigate, colonBuffer, stage.nodeId, stage.hints.length, showBase],
  )

  const onKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      setSpaceHeld(false)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [onKeyDown, onKeyUp])

  const modeClass =
    play.editorState.mode === 'insert'
      ? 'insert-mode'
      : play.editorState.mode === 'visual'
        ? 'visual-mode'
        : ''

  // Search mode uses colon-style bottom bar (same as :q!, :e!, :h)
  const isSearchMode = play.parserBuffer.startsWith('/')
  const searchBuffer = isSearchMode ? play.parserBuffer : ''
  const cardParserBuffer = isSearchMode ? '' : play.parserBuffer

  return (
    <div className={`play-screen ${modeClass}`}>
      {/* Top Bar */}
      <TopBar
        stage={stage}
        damage={play.damage}
        lifePercent={play.lifePercent}
        projectedStars={play.projectedStars}
        mode={play.editorState.mode}
        muted={muted}
        toggleMute={toggleMute}
        onQuit={() => navigate('/tree', { state: { nodeId: stage.nodeId } })}
        onRetry={play.reset}
        onHint={() => {
          play.useHint()
          setShowHint(true)
        }}
        onTutorial={hasStageTutorial ? () => navigate(`/tutorial/${stage.id}?review=1`) : undefined}
      />

      {/* Editor */}
      <div className="play-editor-area">
        <EditorView
          state={play.editorState}
          goalText={stage.goalText}
          goalCursor={stage.clearConditions?.cursor}
          goalViewportTop={stage.clearConditions?.viewportTop}
          goalRegisters={stage.clearConditions?.registers}
          showGoal={spaceHeld}
          language={stage.language}
        />
      </div>

      {/* Hand Cards */}
      <CardPanel
        mode={play.editorState.mode}
        availableCommands={stage.availableCommands}
        visualCommands={stage.visualCommands}
        parserBuffer={cardParserBuffer}
        showBase={showBase}
        baseExpanded={baseExpanded}
        setBaseExpanded={setBaseExpanded}
      />

      {/* Status overlays */}
      {play.status === 'clear' && (
        <div className="play-overlay clear-overlay">
          <div className="overlay-text">CLEAR!</div>
        </div>
      )}
      {play.status === 'dead' && (
        <div className="play-overlay dead-overlay">
          <div className="overlay-text">GAME OVER</div>
        </div>
      )}
      {play.lastInvalid && <div className="invalid-flash" />}

      {/* Navigator Cube */}
      <NavigatorCube
        lifePercent={play.lifePercent}
        lastInvalid={play.lastInvalid}
        lastExecutedRaw={play.lastExecutedRaw}
        onClick={() => {
          playHint()
          play.useHint()
          setShowHint(true)
        }}
      />

      {/* Hint Overlay */}
      {showHint && stage.hints.length > 0 && (
        <HintOverlay stage={stage} onClose={() => setShowHint(false)} />
      )}

      {/* Command line: colon or search */}
      {(colonBuffer || searchBuffer) && (
        <div className="colon-cmd">
          {colonBuffer || searchBuffer}
          <span className="colon-cursor">█</span>
        </div>
      )}

      {/* Focus Loss Overlay */}
      {!focused && play.status === 'playing' && (
        <div className="focus-overlay" onClick={() => window.focus()}>
          <div className="focus-overlay-text">クリックして再開</div>
        </div>
      )}
    </div>
  )
}
