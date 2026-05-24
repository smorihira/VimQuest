/**
 * ResultGuide — step-by-step spotlight overlay explaining the result screen.
 * Auto-shown on first N01-1 clear; re-viewable via "?" button.
 */

import { useState, useEffect, useCallback } from 'react'
import { playTick } from '../../engine/sound'

interface GuideStep {
  target: string | null // CSS selector, or null for centered overlay
  title: string
  message: string
}

const STEPS: GuideStep[] = [
  {
    target: '[data-guide="stars"]',
    title: '☆ 評価',
    message: 'ダメージが少ないほど☆が多い。\n☆3でパーフェクト！',
  },
  {
    target: '[data-guide="stats"]',
    title: 'ステータス',
    message: 'DAMAGE = コマンド入力数。\nBEST は過去の最少ダメージだ。',
  },
  {
    target: null,
    title: '想定解について',
    message: '☆基準は開発者の想定解に基づく。\n最短手数とは異なる場合もあるぞ。',
  },
]

const PAD = 12

interface Props {
  onComplete: () => void
}

export function ResultGuide({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]

  // Measure target during render — elements already in DOM from parent
  const rect = current.target
    ? (document.querySelector(current.target)?.getBoundingClientRect() ?? null)
    : null

  const advance = useCallback(() => {
    playTick()
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      onComplete()
    }
  }, [step, onComplete])

  // Capture-phase keyboard handler — blocks ResultScreen's handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === 'Enter' ||
        e.code === 'Space' ||
        e.key === 'l' ||
        e.key === 'ArrowRight' ||
        e.key === 'Escape'
      ) {
        e.preventDefault()
        e.stopPropagation()
        advance()
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [advance])

  const hasSpotlight = !!rect

  return (
    <div className={`guide-overlay${!hasSpotlight ? ' guide-overlay-dark' : ''}`} onClick={advance}>
      {rect && (
        <div
          className="guide-spotlight"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
          }}
        />
      )}
      <div
        className={`guide-tooltip${!hasSpotlight ? ' guide-tooltip-center' : ''}`}
        style={
          rect
            ? {
                top: rect.bottom + PAD + 16,
                left: rect.left + rect.width / 2,
                transform: 'translateX(-50%)',
              }
            : undefined
        }
      >
        <div className="guide-title">{current.title}</div>
        <div className="guide-message">{current.message}</div>
        <div className="guide-footer">
          <span className="guide-step">
            {step + 1} / {STEPS.length}
          </span>
          <span className="guide-next">▶ クリックで次へ</span>
        </div>
      </div>
    </div>
  )
}
