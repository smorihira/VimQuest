/**
 * PlayScreen — main game play screen.
 * Manages keyboard input, displays editor + HUD + hand cards.
 */

import { useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { getStage } from '../../data/stages'
import { usePlayEngine } from './usePlayEngine'
import { EditorView } from './EditorView'
import './PlayScreen.css'

export function PlayScreen() {
    const { stageId } = useParams<{ stageId: string }>()
    const navigate = useNavigate()
    const stage = stageId ? getStage(stageId) : undefined

    if (!stage) {
        return (
            <div className="play-error">
                Stage not found: {stageId}
            </div>
        )
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

    // Navigate on clear/dead
    useEffect(() => {
        if (play.status === 'clear') {
            const timer = setTimeout(() => {
                navigate(`/result/${stage.id}`, {
                    state: { damage: play.damage, usedHint: play.usedHint },
                })
            }, 600)
            return () => clearTimeout(timer)
        }
        if (play.status === 'dead') {
            const timer = setTimeout(() => {
                navigate(`/gameover/${stage.id}`)
            }, 600)
            return () => clearTimeout(timer)
        }
    }, [play.status, stage.id, play.damage, play.usedHint, navigate])

    // Keyboard handler
    const onKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (play.status !== 'playing') return

            e.preventDefault()

            // Map key events to our key strings
            const key = mapKeyEvent(e)
            if (!key) return

            // Esc in normal mode with no pending parser input → exit stage
            if (key === 'Esc' && play.editorState.mode === 'normal' && !play.parserBuffer) {
                navigate('/tree')
                return
            }

            play.handleKey(key)
        },
        [play, navigate],
    )

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [onKeyDown])

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
                        onClick={() => navigate('/tree')}
                        title="ツリーに戻る (Esc)"
                    >
                        ◀ :q!
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
                        <span className="stage-num">{stage.id}</span>{' '}
                        {stage.title}
                    </div>
                    <span className="mode-indicator">
                        {play.editorState.mode.toUpperCase()}
                    </span>
                </div>

                <div className="play-right">
                    <div className="star-display">
                        {[0, 1, 2].map((i) => (
                            <span
                                key={i}
                                className={`star${i < play.projectedStars ? ' earned' : ''}`}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                    <div className="damage-counter">
                        DMG {play.damage}
                        <span className="damage-thresholds">
                            ({starThresholds.join('/')})
                        </span>
                    </div>
                </div>
            </div>

            {/* Editor */}
            <div className="play-editor-area">
                <EditorView
                    state={play.editorState}
                    goalText={stage.goalText}
                    goalCursor={stage.clearConditions?.cursor}
                />
            </div>

            {/* Hand Cards */}
            <div className="play-card-panel">
                <div className="card-label">HAND</div>
                <div className="card-row">
                    {stage.availableCommands.map((cmd) => (
                        <div key={cmd} className={`card ${getCardClass(cmd)}`}>
                            {cmd}
                        </div>
                    ))}
                </div>
                {play.parserBuffer && (
                    <div className="parser-buffer">
                        {play.parserBuffer}_
                    </div>
                )}
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
            {play.lastInvalid && (
                <div className="invalid-flash" />
            )}
        </div>
    )
}

// ─── Key mapping ────────────────────────────────────────────────────

function mapKeyEvent(e: KeyboardEvent): string | null {
    // Ctrl combos
    if (e.ctrlKey && e.key === 'r') return 'Ctrl+R'

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

function getCardClass(cmd: string): string {
    if (['d', 'c', 'y'].includes(cmd[0]) && cmd.length >= 2) return 'verb'
    if (['d', 'c', 'y', '>', '<'].includes(cmd)) return 'verb'
    if (['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', '^', 'G', 'gg'].includes(cmd)) return 'motion'
    if (cmd.startsWith('i') && cmd.length >= 2) return 'object'
    if (cmd.startsWith('a') && cmd.length >= 2) return 'object'
    return ''
}
