/**
 * SkillTreeScreen — displays the skill tree with node status.
 * Uses a grid layout (enhanced to Dagre/SVG later).
 */

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAtomValue } from 'jotai'
import { gameProgressAtom } from '../../store/atoms'
import { SKILL_NODES } from '../../data/skillTree'
import { getStagesByNode } from '../../data/stages'
import { hasTutorial } from '../../data/tutorials'
import type { SkillNodeDef } from '../../types/game'
import type { GameProgress } from '../../types/game'
import type { Stage } from '../../types/stage'
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
    const [selectedNode, setSelectedNode] = useState<SkillNodeDef | null>(null)

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

        // If no stages played yet (first visit), show WeaponGet screen
        const stages = getStagesByNode(node.id)
        const hasPlayed = stages.some((s) => progress.stageResults[s.id])
        if (!hasPlayed) {
            navigate(`/weapon/${node.id}`)
            return
        }

        // If tutorial exists and not completed, go to tutorial
        if (hasTutorial(node.id) && !progress.tutorialStatus[node.id]) {
            navigate(`/tutorial/${node.id}`)
            return
        }

        // Show stage selector
        setSelectedNode(node)
    }

    const handleStageClick = (stage: Stage) => {
        setSelectedNode(null)
        navigate(`/play/${stage.id}`)
    }

    const typeLabel = (type: string) => {
        switch (type) {
            case 'teach': return 'T'
            case 'practice': return 'P'
            case 'challenge': return 'C'
            default: return '?'
        }
    }

    return (
        <div className="tree-screen">
            {/* Header */}
            <div className="tree-header">
                <div className="tree-title" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
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
                    const { earned } = getNodeStars(node, progress)
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

            {/* Stage selector overlay */}
            {selectedNode && (
                <div className="stage-overlay" onClick={() => setSelectedNode(null)}>
                    <div className="stage-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="stage-panel-header">
                            <span className="stage-panel-id">{selectedNode.id}</span>
                            <span className="stage-panel-name">{selectedNode.name}</span>
                            <button className="stage-panel-close" onClick={() => setSelectedNode(null)}>✕</button>
                        </div>
                        <div className="stage-panel-list">
                            {getStagesByNode(selectedNode.id).map((stage) => {
                                const result = progress.stageResults[stage.id]
                                const stars = result?.bestStars ?? 0
                                return (
                                    <div
                                        key={stage.id}
                                        className={`stage-item${stars > 0 ? ' cleared' : ''}`}
                                        onClick={() => handleStageClick(stage)}
                                    >
                                        <span className="stage-type">{typeLabel(stage.type)}</span>
                                        <span className="stage-name">{stage.title}</span>
                                        <span className="stage-stars">
                                            {[0, 1, 2].map((i) => (
                                                <span key={i} className={i < stars ? 'star-on' : 'star-off'}>★</span>
                                            ))}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
