/**
 * PlayScreen — main game play screen.
 * Manages keyboard input, displays editor + HUD + hand cards.
 * If the stage has a tutorial, redirects to TutorialScreen.
 */

import { useEffect, useCallback, useState } from 'react'
import { useParams, useNavigate, useLocation, Navigate } from 'react-router'
import { useAtomValue } from 'jotai'
import { getStage } from '../../data/stages'
import { getTutorial } from '../../data/stages'
import { getBaseForStage } from '../../data/constants'
import { gameProgressAtom } from '../../store/atoms'
import type { EditorState } from '../../types/editor'
import type { PlayMode } from '../../types/game'
import { usePlayEngine } from './usePlayEngine'
import { EditorView } from './EditorView'
import { NavigatorCube } from './NavigatorCube'
import { HintOverlay } from './HintOverlay'
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

  if (!stage) {
    return <div className="play-error">Stage not found: {stageId}</div>
  }

  const tutorial = getTutorial(stage.id)
  const alreadyDone = progress.tutorialStatus[stage.id] != null

  // Redirect to TutorialScreen if tutorial exists and not done
  if (tutorial && !alreadyDone) {
    return <Navigate to={`/tutorial/${stage.id}`} replace />
  }

  // Read play mode from location state (set by TutorialScreen after completion)
  const locationState = location.state as {
    playMode?: PlayMode
    editorState?: EditorState
  } | null

  return (
    <PlayScreenInner
      stage={stage}
      navigate={navigate}
      hasStageTutorial={!!tutorial}
      playMode={locationState?.playMode ?? 'normal'}
      initialEditorState={locationState?.editorState}
    />
  )
}

function PlayScreenInner({
  stage,
  navigate,
  hasStageTutorial,
  playMode,
  initialEditorState,
}: {
  stage: NonNullable<ReturnType<typeof getStage>>
  navigate: ReturnType<typeof useNavigate>
  hasStageTutorial: boolean
  playMode: PlayMode
  initialEditorState?: EditorState
}) {
  const baseCommands = getBaseForStage(stage)
  const play = usePlayEngine(stage, baseCommands, initialEditorState)
  const [spaceHeld, setSpaceHeld] = useState(false)
  const [muted, setMutedState] = useState(isMuted())
  const [showHint, setShowHint] = useState(false)
  const [focused, setFocused] = useState(true)
  const [colonBuffer, setColonBuffer] = useState('')

  // Base row: auto-expand when there are no hand cards (all commands in BASE)
  const [baseExpanded, setBaseExpanded] = useState(stage.availableCommands.length === 0)

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
            playMode,
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

      // :q! / :e! / :h / :s — colon-command buffer in normal mode
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
            } else if (cmd.startsWith(':s/') || cmd.startsWith(':%s/')) {
              playTick()
              play.feedColonCommand(cmd)
            }
            return
          }
          if (e.key === 'Backspace') {
            const next = colonBuffer.slice(0, -1)
            setColonBuffer(next || '')
            if (!next) return
            return
          }
          const next = colonBuffer + key
          // Free-form input mode for :s and :%s (only when :s card is available)
          const hasSubstitute = stage.availableCommands.includes(':s')
          if (
            hasSubstitute &&
            (next === ':s' ||
              next === ':%' ||
              next === ':%s' ||
              next.startsWith(':s/') ||
              next.startsWith(':%s/'))
          ) {
            setColonBuffer(next)
            return
          }
          const validPrefixes = [':q', ':q!', ':e', ':e!', ':h']
          if (validPrefixes.includes(next)) {
            setColonBuffer(next)
            return
          }
          setColonBuffer('')
          // Don't swallow the key — fall through to handleKey
        }
      }

      // Esc in normal mode with no pending parser input → exit stage
      if (key === 'Esc' && play.editorState.mode === 'normal' && !play.parserBuffer) {
        playTick()
        navigate('/tree', { state: { nodeId: stage.nodeId } })
        return
      }

      play.handleKey(key)
    },
    [play, navigate, colonBuffer, stage.nodeId, stage.hints.length, baseCommands],
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

  const isReplace = play.editorState.mode === 'insert' && play.editorState.replaceMode === true
  const modeClass = isReplace
    ? 'replace-mode'
    : play.editorState.mode === 'insert'
      ? 'insert-mode'
      : play.editorState.mode === 'visual'
        ? 'visual-mode'
        : ''

  // Search mode uses colon-style bottom bar (same as :q!, :e!, :h)
  const isSearchMode = play.parserBuffer.startsWith('/') || play.parserBuffer.startsWith('?')
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
        mode={isReplace ? 'replace' : play.editorState.mode}
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
        showBase={!!baseCommands}
        baseCommands={baseCommands}
        baseExpanded={baseExpanded}
        setBaseExpanded={setBaseExpanded}
        nodeId={stage.nodeId}
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
