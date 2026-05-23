/**
 * GameOverScreen — shown when player runs out of life.
 * Displays damage summary and retry/tree navigation.
 */

import { useParams, useNavigate } from 'react-router'
import { getStage } from '../../data/stages'
import './GameOverScreen.css'

export function GameOverScreen() {
    const { stageId } = useParams<{ stageId: string }>()
    const navigate = useNavigate()
    const stage = stageId ? getStage(stageId) : undefined

    if (!stage) {
        return (
            <div className="gameover-error">
                Stage not found: {stageId}
            </div>
        )
    }

    return (
        <div className="gameover-screen">
            <div className="gameover-container">
                <div className="gameover-icon">♥</div>
                <div className="gameover-label">L I F E&nbsp;&nbsp;O V E R</div>
                <div className="gameover-stage">
                    {stage.id} — {stage.title}
                </div>

                {/* Suggestion from hints */}
                {stage.hints.length > 0 && (
                    <div className="suggestion">
                        <div className="suggestion-label">💡 HINT</div>
                        <div className="suggestion-text">
                            最適解:{' '}
                            <span className="suggestion-commands">
                                {stage.hints[0].commands.join(' → ')}
                            </span>
                            <br />
                            （{stage.hints[0].commands.length}コマンド ={' '}
                            {stage.hints[0].commands.length}ダメージ）
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="gameover-stats">
                    <div className="stat">
                        <div className="stat-value">{stage.life}</div>
                        <div className="stat-label">LIFE</div>
                    </div>
                    <div className="stat">
                        <div className="stat-value">{stage.stars[0]}</div>
                        <div className="stat-label">☆3 目標</div>
                    </div>
                </div>

                {/* Actions */}
                <div className="actions">
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/tree')}
                    >
                        ツリーに戻る
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/play/${stage.id}`)}
                    >
                        リトライ
                    </button>
                </div>
            </div>
        </div>
    )
}
