/**
 * ResultScreen — shown after clearing a stage.
 * Displays stars, damage stats, and navigation buttons.
 */

import { useParams, useNavigate, useLocation } from 'react-router'
import { getStage } from '../../data/stages'
import { getStagesByNode } from '../../data/stages'
import { calculateStars, applyHintPenalty } from '../../engine/damageCalculator'
import type { StarRating } from '../../types/stage'
import './ResultScreen.css'

interface LocationState {
    damage: number
    usedHint: boolean
}

export function ResultScreen() {
    const { stageId } = useParams<{ stageId: string }>()
    const navigate = useNavigate()
    const location = useLocation()
    const stage = stageId ? getStage(stageId) : undefined

    if (!stage) {
        return (
            <div className="result-error">
                Stage not found: {stageId}
            </div>
        )
    }

    const state = (location.state as LocationState) ?? { damage: 0, usedHint: false }
    const rawStars = calculateStars(state.damage, stage.stars)
    const stars = applyHintPenalty(rawStars, state.usedHint)

    // Find next stage in the same node
    const nodeStages = getStagesByNode(stage.nodeId)
    const currentIdx = nodeStages.findIndex((s) => s.id === stage.id)
    const nextStage = currentIdx < nodeStages.length - 1 ? nodeStages[currentIdx + 1] : null

    return (
        <div className="result-screen">
            <div className="result-container">
                <div className="clear-label">S T A G E&nbsp;&nbsp;C L E A R</div>
                <div className="result-stage-name">
                    {stage.id} — {stage.title}
                </div>

                {/* Stars */}
                <div className="stars-container">
                    <div className="stars">
                        {[0, 1, 2].map((i) => (
                            <span
                                key={i}
                                className={`star-result${i < stars ? ' earned' : ''}`}
                                style={{ animationDelay: `${i * 0.2}s` }}
                            >
                                {i < stars ? '★' : '☆'}
                            </span>
                        ))}
                    </div>
                    {state.usedHint && (
                        <div className="hint-notice">
                            <span className="hint-label">ヒント使用</span>: ☆1確定
                        </div>
                    )}
                    <div className="star-label">
                        {stars === 3
                            ? 'パーフェクト！'
                            : stars === 2
                                ? 'よくできました！'
                                : stars === 1
                                    ? 'クリア！'
                                    : ''}
                    </div>
                </div>

                {/* Stats */}
                <div className="stats">
                    <div className="stat">
                        <div className="stat-value">{state.damage}</div>
                        <div className="stat-label">DAMAGE</div>
                    </div>
                    <div className="stat">
                        <div className="stat-value">
                            {stage.life - state.damage}/{stage.life}
                        </div>
                        <div className="stat-label">LIFE</div>
                    </div>
                    <div className="stat">
                        <div className="stat-value">
                            ☆{stars === 3 ? '3' : stars === 2 ? '2' : '1'} / ☆3
                        </div>
                        <div className="stat-label">RATING</div>
                    </div>
                </div>

                {/* Actions */}
                <div className="actions">
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate(`/play/${stage.id}`)}
                    >
                        もう一度
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/tree')}
                    >
                        ツリーへ
                    </button>
                    {nextStage && (
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate(`/play/${nextStage.id}`)}
                        >
                            次のステージへ →
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
