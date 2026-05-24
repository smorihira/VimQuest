/**
 * TopBar — play screen top bar with stage info, life gauge, and controls.
 */

import type { Stage } from '../../../types/stage'
import { playTick, playHint } from '../../../engine/sound'

interface TopBarProps {
  stage: Stage
  damage: number
  lifePercent: number
  projectedStars: number
  mode: string
  muted: boolean
  toggleMute: () => void
  onQuit: () => void
  onRetry: () => void
  onHint: () => void
  onTutorial?: () => void
}

export function TopBar({
  stage,
  damage,
  lifePercent,
  projectedStars,
  mode,
  muted,
  toggleMute,
  onQuit,
  onRetry,
  onHint,
  onTutorial,
}: TopBarProps) {
  const lifeColor =
    lifePercent > 50 ? 'var(--success)' : lifePercent > 25 ? 'var(--star-gold)' : 'var(--danger)'

  return (
    <div className="play-top-bar">
      <div className="play-left">
        <button className="quit-btn" onClick={onQuit} title="ツリーに戻る (Esc)">
          :q!
        </button>
        <button
          className="quit-btn"
          onClick={() => {
            playTick()
            onRetry()
          }}
          title="リトライ (:e!)"
        >
          :e!
        </button>
        {stage.hints.length > 0 && (
          <button
            className="quit-btn"
            onClick={() => {
              playHint()
              onHint()
            }}
            title="ヒント表示 (:h)"
          >
            :h
          </button>
        )}
        {onTutorial && (
          <button
            className="quit-btn"
            onClick={() => {
              playTick()
              onTutorial()
            }}
            title="チュートリアルを見る"
          >
            📖
          </button>
        )}
        <button className="mute-btn" onClick={toggleMute} title={muted ? '音声ON' : '音声OFF'}>
          {muted ? '🔇' : '🔊'}
        </button>
        <div className="life-gauge">
          <span className="life-icon">♥</span>
          <div className="life-bar-container">
            <div
              className="life-bar"
              style={{
                width: `${lifePercent}%`,
                background: lifeColor,
              }}
            />
          </div>
          <span className="life-text" style={{ color: lifeColor }}>
            {stage.life - damage}/{stage.life}
          </span>
        </div>
      </div>

      <div className="play-center">
        <div className="stage-title">
          <span className="stage-num">{stage.id}</span> {stage.title}
        </div>
        <span className="mode-indicator">{mode.toUpperCase()}</span>
      </div>

      <div className="play-right">
        <div className="star-display">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`star${i < projectedStars ? ' earned' : ''}`}>
              ★
            </span>
          ))}
        </div>
        <div className="damage-counter">
          DMG {damage}
          <span className="damage-thresholds">({stage.stars.join('/')})</span>
        </div>
      </div>
    </div>
  )
}
