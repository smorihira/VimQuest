/**
 * ResultScreen — shown after clearing a stage.
 * Displays stars, damage stats, and navigation buttons.
 */

import { useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router'
import { useAtom } from 'jotai'
import { getStage, getStagesByNode } from '../../data/stages'
import { calculateStars, applyHintPenalty } from '../../engine/damageCalculator'
import { gameProgressAtom } from '../../store/atoms'
import { SKILL_NODES } from '../../data/skillTree'
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
    const [progress, setProgress] = useAtom(gameProgressAtom)
    const saved = useRef(false)
    const stage = stageId ? getStage(stageId) : undefined

    const state = (location.state as LocationState) ?? { damage: 0, usedHint: false }
    const rawStars = stage ? calculateStars(state.damage, stage.stars) : (0 as StarRating)
    const stars = stage ? applyHintPenalty(rawStars, state.usedHint) : (0 as StarRating)

    // Save progress once
    useEffect(() => {
        if (!stage || saved.current) return
        saved.current = true

        setProgress((prev) => {
            const existing = prev.stageResults[stage.id]
            const bestStars = existing
                ? (Math.max(existing.bestStars, stars) as StarRating)
                : (stars as StarRating)
            const bestDamage = existing
                ? Math.min(existing.bestDamage, state.damage)
                : state.damage

            const nextResults = {
                ...prev.stageResults,
                [stage.id]: {
                    stageId: stage.id,
                    bestStars,
                    bestDamage,
                    usedHint: existing ? existing.usedHint && state.usedHint : state.usedHint,
                },
            }

            // Check if all stages in this node are now cleared → unlock dependents
            const allNodeStages = getStagesByNode(stage.nodeId)
            const allCleared = allNodeStages.every((s) => nextResults[s.id]?.bestStars >= 1)

            let nextUnlocked = prev.unlockedNodes
            if (allCleared) {
                const dependents = SKILL_NODES
                    .filter((n) => n.prerequisites.includes(stage.nodeId))
                    .filter((n) => n.prerequisites.every((pre) => {
                        const preStages = getStagesByNode(pre)
                        return preStages.every((s) => nextResults[s.id]?.bestStars >= 1)
                    }))
                    .map((n) => n.id)

                const newNodes = dependents.filter((id) => !prev.unlockedNodes.includes(id))
                if (newNodes.length > 0) {
                    nextUnlocked = [...prev.unlockedNodes, ...newNodes]
                }
            }

            return {
                ...prev,
                stageResults: nextResults,
                unlockedNodes: nextUnlocked,
            }
        })
    })

    if (!stage) {
        return (
            <div className="result-error">
                Stage not found: {stageId}
            </div>
        )
    }

    // Find next stage in the same node
    const nodeStages = getStagesByNode(stage.nodeId)
    const currentIdx = nodeStages.findIndex((s) => s.id === stage.id)
    const nextStage = currentIdx < nodeStages.length - 1 ? nodeStages[currentIdx + 1] : null

    // When this is the last stage in the node, find newly unlocked next node
    const getNextNodeId = (): string | null => {
        if (nextStage) return null // Still stages left in this node
        // Find dependent nodes that are unlocked but have no stage results yet (= newly unlocked)
        const dependents = SKILL_NODES
            .filter((n) => n.prerequisites.includes(stage.nodeId))
            .filter((n) => progress.unlockedNodes.includes(n.id))
            .filter((n) => {
                // "New" = no stages played yet
                const nStages = getStagesByNode(n.id)
                return !nStages.some((s) => progress.stageResults[s.id])
            })
        return dependents.length > 0 ? dependents[0].id : null
    }
    const nextNodeId = getNextNodeId()

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
                    {!nextStage && nextNodeId && (
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate(`/weapon/${nextNodeId}`)}
                        >
                            次のノードへ →
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
