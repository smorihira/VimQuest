import { useState, useEffect, type ReactNode } from 'react'
import './DeviceGate.css'

function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export function DeviceGate({ children }: { children: ReactNode }) {
  const [blocked, setBlocked] = useState(false)
  const [reason, setReason] = useState<'mobile' | 'narrow' | null>(null)

  useEffect(() => {
    function check() {
      const w = window.innerWidth
      if (isTouchDevice() || w < 768) {
        setBlocked(true)
        setReason('mobile')
      } else if (w < 1024) {
        setBlocked(true)
        setReason('narrow')
      } else {
        setBlocked(false)
        setReason(null)
      }
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (blocked) {
    return (
      <div className="device-gate">
        <div className="device-gate-icon">⌨️</div>
        <h1 className="device-gate-title">Vim Quest</h1>
        {reason === 'mobile' ? (
          <p className="device-gate-msg">
            PCでアクセスしてください。
            <br />
            Vim Quest はキーボード操作が必要です。
          </p>
        ) : (
          <p className="device-gate-msg">
            ブラウザの幅を広げてください。
            <br />
            1024px 以上の画面幅が必要です。
          </p>
        )}
      </div>
    )
  }

  return <>{children}</>
}
