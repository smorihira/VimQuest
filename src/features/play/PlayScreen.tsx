/**
 * PlayScreen — main game play screen.
 * Manages keyboard input, displays editor + HUD + hand cards.
 */

import { useEffect, useCallback, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { getStage } from '../../data/stages'
import { usePlayEngine } from './usePlayEngine'
import { EditorView } from './EditorView'
import { NavigatorCube } from './NavigatorCube'
import { HintOverlay } from './HintOverlay'
import { playTick, playError, playClear, playGameOver, playType } from '../../engine/sound'
import { isMuted, setMuted } from '../../engine/sound'
import './PlayScreen.css'

export function PlayScreen() {
    const { stageId } = useParams<{ stageId: string }>()
    const navigate = useNavigate()
    const stage = stageId ? getStage(stageId) : undefined

    if (!stage) {
        return <div className="play-error">Stage not found: {stageId}</div>
    }

    return <PlayScreenInner stage={stage} navigate={navigate} />
}

function PlayScreenInner({
    stage,
    navigate,
}: {
    stage: NonNullable<ReturnType<typeof getStage>>
    navigate: ReturnType<typeof useNavigate>
}) {
    const play = usePlayEngine(stage)
    const [spaceHeld, setSpaceHeld] = useState(false)
    const [muted, setMutedState] = useState(isMuted())
    const [showHint, setShowHint] = useState(false)
    const [focused, setFocused] = useState(true)
    const [colonBuffer, setColonBuffer] = useState('')

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
                    state: { damage: play.damage, usedHint: play.usedHint, spells: play.spells },
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
            if (e.code === 'Space' && play.editorState.mode !== 'insert') {
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

            // :q! easter egg — track colon-command buffer in normal mode
            // Skip when parser is in search input mode (parserBuffer starts with '/')
            if (play.editorState.mode === 'normal' && !play.parserBuffer.startsWith('/')) {
                if (key === ':') {
                    setColonBuffer(':')
                    return
                }
                if (colonBuffer === ':' && key === 'q') {
                    setColonBuffer(':q')
                    return
                }
                if (colonBuffer === ':q' && key === '!') {
                    setColonBuffer(':q!')
                    return
                }
                if (colonBuffer === ':q!' && e.key === 'Enter') {
                    setColonBuffer('')
                    playTick()
                    navigate('/tree', { state: { nodeId: stage.nodeId } })
                    return
                }
                if (colonBuffer === ':' && key === 'r') {
                    setColonBuffer(':r')
                    return
                }
                if (colonBuffer === ':r' && e.key === 'Enter') {
                    setColonBuffer('')
                    playTick()
                    play.reset()
                    return
                }
                if (colonBuffer) {
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
        [play, navigate, colonBuffer, stage.nodeId],
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

    const lifeColor =
        play.lifePercent > 50
            ? 'var(--success)'
            : play.lifePercent > 25
                ? 'var(--star-gold)'
                : 'var(--danger)'

    const starThresholds = stage.stars

    return (
        <div className={`play-screen ${modeClass}`}>
            {/* Top Bar */}
            <div className="play-top-bar">
                <div className="play-left">
                    <button
                        className="quit-btn"
                        onClick={() => navigate('/tree', { state: { nodeId: stage.nodeId } })}
                        title="ツリーに戻る (Esc)"
                    >
                        :q!
                    </button>
                    <button
                        className="quit-btn"
                        onClick={() => {
                            playTick()
                            play.reset()
                        }}
                        title="リトライ (:r)"
                    >
                        :r
                    </button>
                    <button className="mute-btn" onClick={toggleMute} title={muted ? '音声ON' : '音声OFF'}>
                        {muted ? '🔇' : '🔊'}
                    </button>
                    <div className="life-gauge">
                        <span className="life-icon">♥</span>
                        <div className="life-bar-container">
                            <div
                                className="life-bar"
                                style={{
                                    width: `${play.lifePercent}%`,
                                    background: lifeColor,
                                }}
                            />
                        </div>
                        <span className="life-text" style={{ color: lifeColor }}>
                            {stage.life - play.damage}/{stage.life}
                        </span>
                    </div>
                </div>

                <div className="play-center">
                    <div className="stage-title">
                        <span className="stage-num">{stage.id}</span> {stage.title}
                    </div>
                    <span className="mode-indicator">{play.editorState.mode.toUpperCase()}</span>
                </div>

                <div className="play-right">
                    <div className="star-display">
                        {[0, 1, 2].map((i) => (
                            <span key={i} className={`star${i < play.projectedStars ? ' earned' : ''}`}>
                                ★
                            </span>
                        ))}
                    </div>
                    <div className="damage-counter">
                        DMG {play.damage}
                        <span className="damage-thresholds">({starThresholds.join('/')})</span>
                    </div>
                </div>
            </div>

            {/* Editor */}
            <div className="play-editor-area">
                <EditorView
                    state={play.editorState}
                    goalText={stage.goalText}
                    goalCursor={stage.clearConditions?.cursor}
                    showGoal={spaceHeld}
                    language={stage.language}
                />
            </div>

            {/* Hand Cards */}
            <div className="play-card-panel">
                <div className="card-label">{play.editorState.mode === 'insert' ? 'INSERT' : 'HAND'}</div>
                {play.editorState.mode === 'insert' ? (
                    <div className="insert-info">
                        <span className="insert-chars">入力中…</span>
                        <span className="insert-esc">Esc で確定</span>
                    </div>
                ) : (
                    <div className="card-row">
                        {(play.editorState.mode === 'visual' && stage.visualCommands
                            ? [...stage.availableCommands, ...stage.visualCommands]
                            : stage.availableCommands
                        ).map((cmd) => {
                            const pendingOp = getPendingOperator(play.parserBuffer)
                            const isOperator = ['d', 'c', 'y', '>', '<'].includes(cmd)
                            const isTarget = !isOperator && !['u', 'Esc', '.'].includes(cmd)
                            const isPending = pendingOp === cmd
                            const isDisabled = pendingOp && isOperator && cmd !== pendingOp
                            const isMerged =
                                play.lastExecutedRaw.length > 1 &&
                                play.lastExecutedRaw.startsWith(cmd) &&
                                isOperator

                            let cardState = ''
                            if (isPending) cardState = ' card-pending'
                            else if (pendingOp && isTarget) cardState = ' card-target'
                            else if (isDisabled) cardState = ' card-disabled'
                            if (isMerged) cardState += ' card-merged'

                            return (
                                <div key={cmd} className={`card ${getCardClass(cmd)}${cardState}`}>
                                    {isMerged ? play.lastExecutedRaw : cmd}
                                </div>
                            )
                        })}
                    </div>
                )}
                {play.parserBuffer && <div className="parser-buffer">{play.parserBuffer}_</div>}
            </div>

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
                    play.useHint()
                    setShowHint(true)
                }}
            />

            {/* Hint Overlay */}
            {showHint && stage.hints.length > 0 && (
                <HintOverlay stage={stage} onClose={() => setShowHint(false)} />
            )}

            {/* :q! command line indicator */}
            {colonBuffer && (
                <div className="colon-cmd">
                    {colonBuffer}
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

// ─── Key mapping ────────────────────────────────────────────────────

function mapKeyEvent(e: KeyboardEvent): string | null {
    // Ctrl combos
    if (e.ctrlKey && e.key === 'r') return 'Ctrl+R'
    if (e.ctrlKey && e.key === 'd') return 'Ctrl+d'
    if (e.ctrlKey && e.key === 'u') return 'Ctrl+u'
    if (e.ctrlKey && e.key === 'v') {
        e.preventDefault()
        return 'Ctrl+v'
    }

    // Ignore other Ctrl/Meta combos
    if (e.ctrlKey || e.metaKey) return null

    // Special keys
    if (e.key === 'Escape') return 'Esc'
    if (e.key === 'Backspace') return 'Backspace'
    if (e.key === 'Enter') return 'Enter'
    if (e.key === 'ArrowLeft') return 'ArrowLeft'
    if (e.key === 'ArrowDown') return 'ArrowDown'
    if (e.key === 'ArrowUp') return 'ArrowUp'
    if (e.key === 'ArrowRight') return 'ArrowRight'

    // Single character
    if (e.key.length === 1) return e.key

    return null
}

// ─── Card styling ───────────────────────────────────────────────────

function getPendingOperator(buffer: string): string | null {
    if (!buffer) return null
    // Strip leading count
    const stripped = buffer.replace(/^\d+/, '')
    if (['d', 'c', 'y', '>', '<'].includes(stripped)) return stripped
    return null
}

function getCardClass(cmd: string): string {
    if (['d', 'c', 'y'].includes(cmd[0]) && cmd.length >= 2) return 'verb'
    if (['d', 'c', 'y', '>', '<'].includes(cmd)) return 'verb'
    if (['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', '^', 'G', 'gg'].includes(cmd)) return 'motion'
    if (cmd.startsWith('i') && cmd.length >= 2) return 'object'
    if (cmd.startsWith('a') && cmd.length >= 2) return 'object'
    return ''
}
