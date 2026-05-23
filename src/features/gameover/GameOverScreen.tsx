/**
 * GameOverScreen — shown when player runs out of life.
 * Displays operation log with waste highlighting, damage summary, and hint.
 */

import { useParams, useNavigate, useLocation } from 'react-router'
import { getStage } from '../../data/stages'
import type { SpellEntry } from '../play/usePlayEngine'
import './GameOverScreen.css'

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
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/tree')}
                    >
                        ツリーに戻る
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/play/${stage.id}`)}
                    >
                        リトライ
                    </button>
                </div>
            </div>
        </div>
    )
}
