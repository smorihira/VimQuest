/**
 * LandingScreen — title screen with logo, features, and start button.
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import './LandingScreen.css'

export function LandingScreen() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault()
        navigate('/tree')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [navigate])

  return (
    <div className="landing-screen">
      {/* Background code */}
      <div className="bg-code" aria-hidden="true">
        {'hjkl wbe 0$ ft ;, dw dd d$ ciw ci" da( viw yiw p\n'.repeat(20)}
      </div>

      <div className="landing">
        {/* Logo */}
        <div className="logo">
          <span className="logo-main">
            <span className="logo-vim">Vim</span>
            <span className="logo-quest">Quest</span>
          </span>
          <span className="logo-cursor" />
        </div>

        {/* Tagline */}
        <div className="tagline">
          <em>ライフを管理</em>しながら解く、<em>Vim戦略パズル</em>。
          <br />
          最短の手順を見つけ出し、テキストを目標の形に変えよう。
        </div>

        {/* Demo preview */}
        <div className="demo-preview">
          <div className="demo-lines">
            <div className="demo-lines-inner">
              <div className="demo-line dim">console.log(name);</div>
              <div className="demo-line">const name = &apos;Vim&apos;;</div>
            </div>
          </div>
          <div className="arrow">
            ↓ <span className="cmd">ddp</span>
          </div>
          <div className="demo-lines">
            <div className="demo-lines-inner">
              <div className="demo-line">const name = &apos;Vim&apos;;</div>
              <div className="demo-line success">console.log(name);</div>
            </div>
          </div>
          <div className="demo-note">dd = 行を切り取り、p = 下に貼り付け。2キーで行入れ替え。</div>
        </div>

        {/* Features */}
        <div className="features">
          <div className="feature">
            <div className="feature-icon">♥</div>
            <div className="feature-title">ライフ制パズル</div>
            <div className="feature-desc">1コマンド＝1ダメージ。少ないダメージで★3を目指せ。</div>
          </div>
          <div className="feature">
            <div className="feature-icon">🃏</div>
            <div className="feature-title">スキルカード</div>
            <div className="feature-desc">
              コマンドを見やすくスキルカード化。手札のカードで最適解を探せ。
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">🌳</div>
            <div className="feature-title">スキルツリー</div>
            <div className="feature-desc">
              60+のコマンドを体系的に配置。基本移動から合成技まで段階的にステップアップ。
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="cta">
          <button className="btn-start" onClick={() => navigate('/tree')}>
            はじめる
          </button>
          <div className="cta-sub">
            <span>アカウント不要・無料・ブラウザだけで遊べます</span>
            <div className="requirements">
              <span className="req-badge">⌨️ キーボード必須</span>
              <span className="req-badge">🖥️ デスクトップ専用</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer">VimQuest — hjkl連打を卒業し、最短の一手が浮かぶ頭をつくる</div>
    </div>
  )
}
