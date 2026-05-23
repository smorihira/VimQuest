/**
 * SkillTreeScreen — displays the skill tree with node status.
 * Uses a grid layout (enhanced to Dagre/SVG later).
 */

import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useAtomValue } from 'jotai'
import { gameProgressAtom } from '../../store/atoms'
import { SKILL_NODES } from '../../data/skillTree'
import { getStagesByNode } from '../../data/stages'
import { hasTutorial } from '../../data/tutorials'
import type { SkillNodeDef } from '../../types/game'
import type { GameProgress } from '../../types/game'
import type { StarRating } from '../../types/stage'
import './SkillTreeScreen.css'

type NodeStatus = 'locked' | 'available' | 'cleared'

function getNodeStatus(node: SkillNodeDef, progress: GameProgress): NodeStatus {
    const unlocked = progress.unlockedNodes.includes(node.id)
    if (!unlocked) return 'locked'

    // Check if all stages in this node are cleared
    const stages = getStagesByNode(node.id)
    if (stages.length === 0) return 'available'

    const allCleared = stages.every((s) => {
        const result = progress.stageResults[s.id]
        return result && result.bestStars > 0
    })

    return allCleared ? 'cleared' : 'available'
}

function getNodeStars(node: SkillNodeDef, progress: GameProgress): { earned: number; total: number } {
    const stages = getStagesByNode(node.id)
    const total = stages.length * 3
    const earned = stages.reduce((sum, s) => {
        const result = progress.stageResults[s.id]
        return sum + (result?.bestStars ?? 0)
    }, 0)
    return { earned, total }
}

export function SkillTreeScreen() {
    const navigate = useNavigate()
    const progress = useAtomValue(gameProgressAtom)

    const stats = useMemo(() => {
        let totalStages = 0
        let clearedStages = 0
        let totalStars = 0
        let earnedStars = 0

        for (const node of SKILL_NODES) {
            const stages = getStagesByNode(node.id)
            totalStages += stages.length
            for (const s of stages) {
                const r = progress.stageResults[s.id]
                if (r && r.bestStars > 0) clearedStages++
                earnedStars += r?.bestStars ?? 0
            }
            totalStars += stages.length * 3
        }
        return { totalStages, clearedStages, totalStars, earnedStars }
    }, [progress])

    const handleNodeClick = (node: SkillNodeDef) => {
        const status = getNodeStatus(node, progress)
        if (status === 'locked') return

        // If tutorial exists and not completed, go to tutorial
        if (hasTutorial(node.id) && !progress.tutorialStatus[node.id]) {
            navigate(`/tutorial/${node.id}`)
            return
        }

        // Go to first uncompleted stage, or first stage
        const stages = getStagesByNode(node.id)
        const firstUncompleted = stages.find((s) => {
            const r = progress.stageResults[s.id]
            return !r || r.bestStars === 0
        })
        const target = firstUncompleted ?? stages[0]
        if (target) {
            navigate(`/play/${target.id}`)
        }
    }

    return (
        <div className="tree-screen">
            {/* Header */}
            <div className="tree-header">
                <div className="tree-title">
                    <span className="tree-vim">Vim</span>
                    <span className="tree-quest">Quest</span>
                    <span className="tree-subtitle">SKILL TREE</span>
                </div>
                <div className="tree-stats">
                    <span className="tree-stat">
                        Cleared: {stats.clearedStages}/{stats.totalStages}
                    </span>
                    <span className="tree-stat">
                        ⭐ {stats.earnedStars}/{stats.totalStars}
                    </span>
                </div>
            </div>

            {/* Tree grid */}
            <div className="tree-grid">
                {SKILL_NODES.map((node) => {
                    const status = getNodeStatus(node, progress)
                    const { earned, total } = getNodeStars(node, progress)
                    const stages = getStagesByNode(node.id)

                    return (
                        <div
                            key={node.id}
                            className={`tree-node ${status}`}
                            onClick={() => handleNodeClick(node)}
                            role="button"
                            tabIndex={status === 'locked' ? -1 : 0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleNodeClick(node)
                            }}
                        >
                            <div className="node-id">{node.id}</div>
                            <div className="node-name">{node.name}</div>
                            <div className="node-commands">
                                {node.commands.slice(0, 4).join(' ')}
                                {node.commands.length > 4 && ' …'}
                            </div>
                            {stages.length > 0 && (
                                <div className="node-stars">
                                    {[0, 1, 2].map((i) => {
                                        // Show average stars across stages
                                        const avgStars = stages.length > 0 ? earned / stages.length : 0
                                        return (
                                            <span
                                                key={i}
                                                className={`node-star${i < Math.round(avgStars) ? ' earned' : ''}`}
                                            >
                                                ★
                                            </span>
                                        )
                                    })}
                                </div>
                            )}
                            {status === 'locked' && <div className="node-lock">🔒</div>}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
