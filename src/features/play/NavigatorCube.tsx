/**
 * NavigatorCube — floating geometric cube in the bottom-right corner.
 * Provides emotional feedback on play quality.
 */

import { useMemo } from 'react'
import './NavigatorCube.css'

interface NavigatorCubeProps {
  lifePercent: number
  lastInvalid: boolean
  lastExecutedRaw: string
  onClick?: () => void
}

export function NavigatorCube({
  lifePercent,
  lastInvalid,
  lastExecutedRaw,
  onClick,
}: NavigatorCubeProps) {
  const cubeState = useMemo(() => {
    if (lastInvalid) return 'dim'
    if (lastExecutedRaw) return 'glow'
    return 'idle'
  }, [lastInvalid, lastExecutedRaw])

  const speedClass = lifePercent > 50 ? '' : lifePercent > 25 ? 'slow' : 'very-slow'
  const brightnessClass = lifePercent > 25 ? '' : 'dark'

  return (
    <div
      className={`navigator-cube ${cubeState} ${speedClass} ${brightnessClass}`}
      onClick={onClick}
      title="ヒントを表示"
    >
      <div className="cube-wrapper">
        <div className="cube">
          <div className="face front" />
          <div className="face back" />
          <div className="face left" />
          <div className="face right" />
          <div className="face top" />
          <div className="face bottom" />
        </div>
      </div>
    </div>
  )
}
