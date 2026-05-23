/**
 * WeaponGetScreen — shown when player unlocks a new node.
 * Displays the new commands with a celebration effect.
 */

import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { getSkillNode } from '../../data/skillTree'
import { hasTutorial } from '../../data/tutorials'
import { getStagesByNode } from '../../data/stages'
import './WeaponGetScreen.css'

export function WeaponGetScreen() {
  const { nodeId } = useParams<{ nodeId: string }>()
  const navigate = useNavigate()
  const node = nodeId ? getSkillNode(nodeId) : undefined

  const isTutorialNode = node ? hasTutorial(node.id) : false
  const stages = node ? getStagesByNode(node.id) : []
  const firstStage = stages[0]

  const handleProceed = () => {
    if (!node) return
    if (isTutorialNode) {
      navigate(`/tutorial/${node.id}`)
    } else if (firstStage) {
      navigate(`/play/${firstStage.id}`)
    } else {
      navigate('/tree', { state: { nodeId: node?.id } })
    }
  }

  // Keyboard navigation — Enter/Space to proceed
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault()
        handleProceed()
      }
      if (e.key === 'Escape') {
        navigate('/tree', { state: { nodeId: node?.id } })
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  if (!node) {
    return <div className="weapon-error">Node not found: {nodeId}</div>
  }

  return (
    <div className="weapon-screen">
      {/* Particles */}
      <div className="particles" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${10 + ((i * 7) % 80)}%`,
              animationDelay: `${(i * 0.3) % 2}s`,
            }}
          />
        ))}
      </div>

      <div className="weapon-container">
        <div className="weapon-label">★ N E W&nbsp;&nbsp;W E A P O N ★</div>

        <div className="weapon-card">
          <div className="weapon-cmd">{node.commands.slice(0, 3).join(' ')}</div>
          <div className="weapon-name">{node.name}</div>
        </div>

        <div className="weapon-explain">
          {node.commands.map((cmd) => (
            <div key={cmd} className="explain-cmd">
              <kbd>{cmd}</kbd>
            </div>
          ))}
        </div>

        {isTutorialNode ? (
          <div className="tutorial-section">
            <div className="tutorial-preview-msg">ステップごとに使い方を練習しましょう</div>
            <button className="tutorial-btn" onClick={handleProceed}>
              練習してみる →
            </button>
          </div>
        ) : (
          <button className="weapon-proceed-btn" onClick={handleProceed}>
            {firstStage ? 'ステージへ →' : 'ツリーに戻る'}
          </button>
        )}
      </div>
    </div>
  )
}
