/**
 * GameOverScreen — shown when player runs out of life.
 * Displays operation log with waste highlighting, damage summary, and hint.
 */

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router'
import { getStage } from '../../data/stages'
import type { SpellEntry } from '../play/usePlayEngine'
import './GameOverScreen.css'
import { playTick } from '../../engine/sound'

interface LocationState {
    damage?: number
    spells?: SpellEntry[]
}

interface CollapsedEntry {
    command: string
    damage: number
    count: number
}

function collapseSpells(spells: SpellEntry[]): CollapsedEntry[] {
    const result: CollapsedEntry[] = []
    for (const s of spells) {
        const last = result[result.length - 1]
        if (last && last.command === s.command) {
            last.count++
            last.damage += s.damage
        } else {
            result.push({ command: s.command, damage: s.damage, count: 1 })
        }
    }
    return result
}

export function GameOverScreen() {
    const { stageId } = useParams<{ stageId: string }>()
    const navigate = useNavigate()
    const location = useLocation()
    const stage = stageId ? getStage(stageId) : undefined

    const state = (location.state as LocationState) ?? {}
    const spells = state.spells ?? []
    const totalDamage = state.damage ?? 0

    if (!stage) {
        return (
            <div className="gameover-error">
                Stage not found: {stageId}
            </div>
        )
    }

    const collapsed = collapseSpells(spells)
    const overAmount = totalDamage - stage.life
    const optimalDamage = stage.stars[0]

    const actions = useMemo(() => [
        { label: 'ツリーへ', action: () => navigate('/tree', { state: { nodeId: stage.nodeId } }) },
        { label: 'リトライ', action: () => navigate(`/play/${stage.id}`) },
    ], [navigate, stage.id, stage.nodeId])

    const [focusIdx, setFocusIdx] = useState(1) // default to リトライ

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.code === 'Space') {
                e.preventDefault()
                playTick()
                actions[focusIdx].action()
            }
            if (e.key === 'r') {
                e.preventDefault()
                playTick()
                navigate(`/play/${stage.id}`)
            }
            if (e.key === 'Escape') {
                navigate('/tree', { state: { nodeId: stage.nodeId } })
            }
            if (e.key === 'h' || e.key === 'k' || e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault()
                setFocusIdx(i => Math.max(0, i - 1))
                playTick()
            }
            if (e.key === 'l' || e.key === 'j' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault()
                setFocusIdx(i => Math.min(actions.length - 1, i + 1))
                playTick()
            }
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [navigate, stage.id, stage.nodeId, actions, focusIdx])

    return (
        <div className="gameover-screen">
            <div className="gameover-container">
                <div className="gameover-icon">♥</div>
                <div className="gameover-label">L I F E&nbsp;&nbsp;O V E R</div>
                <div className="gameover-stage">
                    {stage.id} — {stage.title}
                </div>

                {/* Operation Log */}
                {collapsed.length > 0 && (
                    <div className="oplog-section">
                        <div className="oplog-label">OPERATION LOG</div>
                        <div className="oplog-list">
                            {collapsed.map((entry, i) => {
                                const isWaste = entry.damage > optimalDamage * 0.5 && entry.count > 3
                                return (
                                    <div key={i} className={`oplog-entry${isWaste ? ' waste' : ''}`}>
                                        <span className="oplog-cmd">
                                            {entry.command}
                                            {entry.count > 1 && <span className="oplog-count"> ×{entry.count}</span>}
                                        </span>
                                        <span className="oplog-dmg">-{entry.damage}</span>
                                        {isWaste && (
                                            <span className="oplog-waste-tag">{entry.damage}浪費</span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        <div className="oplog-summary">
                            合計ダメージ: {totalDamage} / ライフ: {stage.life} → <span className="oplog-over">{overAmount}オーバー</span>
                        </div>
                    </div>
                )}

                {/* Hint */}
                {stage.hints.length > 0 && (
                    <div className="suggestion">
                        <div className="suggestion-label">💡 HINT</div>
                        <div className="suggestion-text">
                            最適解:{' '}
                            <span className="suggestion-commands">
                                {stage.hints[0].commands.join(' → ')}
                            </span>
                            <br />
                            （{stage.hints[0].commands.length}コマンド ={' '}
                            {stage.hints[0].commands.length}ダメージ）
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="actions">
                    {actions.map((act, i) => (
                        <button
                            key={act.label}
                            className={`btn ${i === actions.length - 1 ? 'btn-primary' : 'btn-secondary'}${i === focusIdx ? ' focused' : ''}`}
                            onClick={act.action}
                        >
                            {act.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
