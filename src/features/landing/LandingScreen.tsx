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
          最短の手順を見つけ出し、テキストを目標の形に変えろ。
        </div>

        {/* Demo preview */}
        <div className="demo-preview">
          <div className="before">
            color: &quot;<span className="demo-value">#ff0000</span>&quot;;
          </div>
          <div className="arrow">
            ↓ <span className="cmd">ci&quot;</span> → #333333 → Esc
          </div>
          <div className="after">color: &quot;#333333&quot;;</div>
          <div className="demo-note">
            ci&quot; = &quot;&quot; の中身を丸ごと変更。たった1コマンド。
          </div>
        </div>

        {/* Features */}
        <div className="features">
          <div className="feature">
            <div className="feature-icon">♥</div>
            <div className="feature-title">ライフ制パズル</div>
            <div className="feature-desc">
              1コマンド＝1ダメージ。少ない手数でクリアするほど高評価。
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">🃏</div>
            <div className="feature-title">スキルカード</div>
            <div className="feature-desc">動詞と対象が合体する「合成UI」でVimの文法を視覚化。</div>
          </div>
          <div className="feature">
            <div className="feature-icon">🌳</div>
            <div className="feature-title">スキルツリー</div>
            <div className="feature-desc">60+のコマンドを段階的に習得。渇望→報酬の感情設計。</div>
          </div>
        </div>

        {/* CTA */}
        <div className="cta">
          <button className="btn-start" onClick={() => navigate('/tree')}>
            はじめる
          </button>
          <div className="cta-sub">
            アカウント不要・無料・ブラウザだけで遊べます
            <div className="requirements">
              <span className="req-badge">⌨️ キーボード必須</span>
              <span className="req-badge">🖥️ デスクトップ専用</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer">VimQuest — 「指の慣れ」を卒業し、「最短の思考」を手に入れる</div>
    </div>
  )
}
