/**
 * StageTutorial — inline tutorial shown before stage play.
 * Reuses TutorialScreen's step-by-step dialogue pattern.
 */

import { useState, useCallback, useEffect } from 'react'
import type { Tutorial, TutorialStep } from '../../types/tutorial'
import type { Stage } from '../../types/stage'
import type { EditorState } from '../../types/editor'
import type { TutorialStatus } from '../../types/game'
import { createEditorState } from '../../types/editor'
import { executeCommand } from '../../engine/commandExecutor'
import { parseKeys } from '../../engine/commandParser'
import { EditorView } from './EditorView'
import { playTick } from '../../engine/sound'
import '../tutorial/TutorialScreen.css'

interface Props {
    tutorial: Tutorial
    stage: Stage
    onComplete: (status: TutorialStatus) => void
}

export function StageTutorial({ tutorial, stage, onComplete }: Props) {
    const [stepIdx, setStepIdx] = useState(0)
    const [editorState, setEditorState] = useState<EditorState>(() =>
        createEditorState(tutorial.initialSetup.text, tutorial.initialSetup.cursor),
    )
    const [wrongMessage, setWrongMessage] = useState<string | null>(null)

    const step = tutorial.steps[stepIdx] as TutorialStep | undefined

    const handleKey = useCallback(
        (e: KeyboardEvent) => {
            e.preventDefault()

            const key = mapKey(e)
            if (!key) return

            // Skip with Esc — but not if the current step expects Esc
            if (key === 'Esc' && step?.expectedKey !== 'Esc') {
                playTick()
                onComplete('skipped')
                return
            }

            if (!step) return

            playTick()

            // Info step (expectedKey === null) — any key advances
            if (step.expectedKey === null) {
                const nextIdx = stepIdx + 1
                if (nextIdx >= tutorial.steps.length) {
                    onComplete('completed')
                } else {
                    setStepIdx(nextIdx)
                }
                return
            }

            // Check if key matches
            const accepted = step.acceptedKeys
                ? [...step.acceptedKeys, step.expectedKey]
                : [step.expectedKey]

            if (accepted.includes(key)) {
                setWrongMessage(null)
                // Apply key to editor
                if (editorState.mode === 'insert') {
                    // In insert mode, bypass parser and directly execute as text/Esc
                    const next = executeCommand(editorState, { raw: key, valid: true })
                    setEditorState(next)
                } else {
                    const parsed = parseKeys([key])
                    if (parsed) {
                        const next = executeCommand(editorState, parsed.command)
                        setEditorState(next)
                    }
                }

                // Advance if it's the expected key
                if (key === step.expectedKey) {
                    const nextIdx = stepIdx + 1
                    if (nextIdx >= tutorial.steps.length) {
                        onComplete('completed')
                    } else {
                        setStepIdx(nextIdx)
                        const nextStep = tutorial.steps[nextIdx]
                        if (nextStep?.editorSetup) {
                            setEditorState(
                                createEditorState(nextStep.editorSetup.text, nextStep.editorSetup.cursor),
                            )
                        }
                    }
                }
            } else {
                setWrongMessage(step.wrongKeyMessage ?? `${key} じゃない。${step.expectedKey} を押してみろ`)
            }
        },
        [step, stepIdx, editorState, onComplete, tutorial],
    )

    useEffect(() => {
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [handleKey])

    const modeClass = editorState.mode === 'insert' ? ' insert-mode' : ''

    return (
        <div className={`tutorial-screen${modeClass}`}>
            {/* Top Bar */}
            <div className="tutorial-top-bar">
                <div className="tutorial-top-left">
                    <span className="tutorial-badge">TUTORIAL</span>
                    <span className="tutorial-title">
                        {stage.id}: {stage.title}
                    </span>
                </div>

                <div className="step-progress">
                    {tutorial.steps.map((_, i) => (
                        <div
                            key={i}
                            className={`step-dot${i < stepIdx ? ' done' : i === stepIdx ? ' current' : ''}`}
                        />
                    ))}
                    <span className="step-label">
                        {Math.min(stepIdx + 1, tutorial.steps.length)} / {tutorial.steps.length}
                    </span>
                </div>

                <span className={`tutorial-mode${editorState.mode === 'insert' ? ' insert' : ''}`}>
                    {editorState.mode.toUpperCase()}
                </span>
            </div>

            {/* Editor */}
            <div className="tutorial-editor-area">
                <EditorView state={editorState} />
            </div>

            {/* Navigator Bar */}
            <div className={`navigator-bar${wrongMessage ? ' wrong' : ''}`}>
                <button
                    className="skip-btn"
                    onClick={() => {
                        playTick()
                        onComplete('skipped')
                    }}
                    title="Esc でスキップ"
                >
                    Skip ▸
                </button>
                <div className="navi-icon">🗡</div>
                <div className="navi-content">
                    <div className="navi-name">ナビゲーター</div>
                    <div className="navi-message">
                        {wrongMessage ?? step?.message ?? 'チュートリアル完了！'}
                    </div>
                    {step?.expectedKey && (
                        <div className="navi-key-hint">
                            <kbd>{step.expectedKey}</kbd>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function mapKey(e: KeyboardEvent): string | null {
    if (e.ctrlKey && e.key === 'r') return 'Ctrl+R'
    if (e.ctrlKey || e.metaKey) return null
    if (e.key === 'Escape') return 'Esc'
    if (e.key === 'Backspace') return 'Backspace'
    if (e.key === 'Enter') return 'Enter'
    if (e.key.length === 1) return e.key
    return null
}
