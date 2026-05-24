/**
 * ResultScreen — shown after clearing a stage.
 * Displays stars, damage stats, and navigation buttons.
 */

import { useEffect, useRef, useCallback, useMemo, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router'
import { useAtom } from 'jotai'
import { getStage, getStagesByNode } from '../../data/stages'
import { calculateStars, applyHintPenalty } from '../../engine/damageCalculator'
import { gameProgressAtom } from '../../store/atoms'
import { SKILL_NODES, getSkillNode } from '../../data/skillTree'
import type { StarRating } from '../../types/stage'
import type { SpellEntry } from '../../types/spell'
import './ResultScreen.css'
import { playTick } from '../../engine/sound'
import { ResultGuide } from './ResultGuide'

const GUIDE_KEY = 'vimquest_result_guide_seen'

interface LocationState {
  damage: number
  usedHint: boolean
  spells?: SpellEntry[]
}

export function ResultScreen() {
  const { stageId } = useParams<{ stageId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [progress, setProgress] = useAtom(gameProgressAtom)
  const saved = useRef(false)
  const stage = stageId ? getStage(stageId) : undefined

  const state = (location.state as LocationState) ?? { damage: 0, usedHint: false, spells: [] }
  const spells = state.spells ?? []
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
      const bestDamage = existing ? Math.min(existing.bestDamage, state.damage) : state.damage

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
        const dependents = SKILL_NODES.filter((n) => n.prerequisites.includes(stage.nodeId))
          .filter((n) =>
            n.prerequisites.every((pre) => {
              const preStages = getStagesByNode(pre)
              return preStages.every((s) => nextResults[s.id]?.bestStars >= 1)
            }),
          )
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

  // Find next stage in the same node
  const nodeStages = stage ? getStagesByNode(stage.nodeId) : []
  const currentIdx = stage ? nodeStages.findIndex((s) => s.id === stage.id) : -1
  const nextStage =
    currentIdx >= 0 && currentIdx < nodeStages.length - 1 ? nodeStages[currentIdx + 1] : null

  // When this is the last stage in the node, find newly unlocked next node
  const nextNodeId = useMemo((): string | null => {
    if (!stage || nextStage) return null
    const dependents = SKILL_NODES.filter((n) => n.prerequisites.includes(stage.nodeId))
      .filter((n) => progress.unlockedNodes.includes(n.id))
      .filter((n) => {
        const nStages = getStagesByNode(n.id)
        return !nStages.some((s) => progress.stageResults[s.id])
      })
    return dependents.length > 0 ? dependents[0].id : null
  }, [stage, nextStage, progress])

  // Build action list for keyboard nav
  const actions = useMemo(() => {
    if (!stage) return []
    const list: { label: string; action: () => void }[] = [
      { label: 'もう一度', action: () => navigate(`/play/${stage.id}`) },
      { label: 'ツリーへ', action: () => navigate('/tree', { state: { nodeId: stage.nodeId } }) },
    ]
    if (nextStage) {
      list.push({ label: '次のステージへ →', action: () => navigate(`/play/${nextStage.id}`) })
    } else if (nextNodeId) {
      list.push({ label: '次のノードへ →', action: () => navigate(`/weapon/${nextNodeId}`) })
    }
    return list
  }, [navigate, stage, nextStage, nextNodeId])

  const [focusIdx, setFocusIdx] = useState(actions.length - 1) // default to last (primary)
  const [prevActionsLen, setPrevActionsLen] = useState(actions.length)
  const [showGuide, setShowGuide] = useState(false)

  // Auto-show guide on first N01-1 clear
  useEffect(() => {
    if (stageId !== 'N01-1' || localStorage.getItem(GUIDE_KEY)) return
    const timer = setTimeout(() => setShowGuide(true), 1200)
    return () => clearTimeout(timer)
  }, [stageId])

  // Always reset focus to the primary (last) action when actions list changes
  if (prevActionsLen !== actions.length) {
    setPrevActionsLen(actions.length)
    setFocusIdx(actions.length - 1)
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!stage) return
      if (e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault()
        playTick()
        actions[focusIdx].action()
      }
      if (e.key === 'Escape') {
        navigate('/tree', { state: { nodeId: stage.nodeId } })
      }
      if (e.key === 'r') {
        playTick()
        navigate(`/play/${stage.id}`)
      }
      if (e.key === 'h' || e.key === 'k' || e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusIdx((i) => Math.max(0, i - 1))
        playTick()
      }
      if (e.key === 'l' || e.key === 'j' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusIdx((i) => Math.min(actions.length - 1, i + 1))
        playTick()
      }
    },
    [navigate, actions, focusIdx, stage],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!stage) {
    return <div className="result-error">Stage not found: {stageId}</div>
  }

  return (
    <div className="result-screen">
      <div className="result-container">
        <div className="clear-label">S T A G E&nbsp;&nbsp;C L E A R</div>
        <div className="result-stage-name">
          {stage.id} — {stage.title}
        </div>

        <button className="guide-help-btn" onClick={() => setShowGuide(true)} title="画面の見方">
          ?
        </button>

        {/* Stars */}
        <div className="stars-container" data-guide="stars">
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

        {/* YOUR SPELL */}
        {spells.length > 0 && (
          <div className="spell-section">
            <div className="spell-label">YOUR SPELL</div>
            <div className="spell-list">
              {spells.map((s, i) => {
                const learningCmds = getSkillNode(stage.nodeId)?.commands ?? []
                const baseCmd = s.command.replace(/…Esc$/, '')
                const isLearning = learningCmds.includes(baseCmd)
                const isDim = s.command.includes('Esc') || s.damage === 0
                const colorClass = isLearning
                  ? 'spell-learning'
                  : isDim
                    ? 'spell-dim'
                    : 'spell-accent'
                return (
                  <div key={i} className={`spell-item ${colorClass}`}>
                    <div className="spell-cmd">{s.command}</div>
                    <div className="spell-dmg">-{s.damage}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="stats" data-guide="stats">
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
            <div className="stat-value best-value">
              {progress.stageResults[stage.id]?.bestDamage ?? state.damage}
            </div>
            <div className="stat-label">BEST</div>
            {progress.stageResults[stage.id] &&
              state.damage <= progress.stageResults[stage.id].bestDamage &&
              state.damage < progress.stageResults[stage.id].bestDamage && (
                <div className="new-best">NEW BEST!</div>
              )}
          </div>
        </div>

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
      {showGuide && (
        <ResultGuide
          onComplete={() => {
            setShowGuide(false)
            localStorage.setItem(GUIDE_KEY, '1')
          }}
        />
      )}
    </div>
  )
}
