/**
 * TutorialScreen — guided step-by-step tutorial for a node.
 * Shows navigator messages and waits for correct key input.
 */

import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useSetAtom } from 'jotai'
import { getTutorial } from '../../data/tutorials'
import { getStagesByNode } from '../../data/stages'
import { gameProgressAtom } from '../../store/atoms'
import { createEditorState } from '../../types/editor'
import { executeCommand } from '../../engine/commandExecutor'
import { parseKeys } from '../../engine/commandParser'
import type { EditorState } from '../../types/editor'
import type { TutorialStep } from '../../types/tutorial'
import { EditorView } from '../play/EditorView'
import { playTick } from '../../engine/sound'
import './TutorialScreen.css'

export function TutorialScreen() {
  const { nodeId } = useParams<{ nodeId: string }>()
  const navigate = useNavigate()
  const tutorial = nodeId ? getTutorial(nodeId) : undefined
  const setProgress = useSetAtom(gameProgressAtom)

  if (!tutorial) {
    return <div className="tutorial-error">Tutorial not found: {nodeId}</div>
  }

  return <TutorialInner tutorial={tutorial} navigate={navigate} setProgress={setProgress} />
}

function TutorialInner({
  tutorial,
  navigate,
  setProgress,
}: {
  tutorial: NonNullable<ReturnType<typeof getTutorial>>
  navigate: ReturnType<typeof useNavigate>
  setProgress: ReturnType<typeof useSetAtom<typeof gameProgressAtom>>
}) {
  const [stepIdx, setStepIdx] = useState(0)
  const [editorState, setEditorState] = useState<EditorState>(() =>
    createEditorState(tutorial.initialSetup.text, tutorial.initialSetup.cursor),
  )
  const [wrongMessage, setWrongMessage] = useState<string | null>(null)

  const step = tutorial.steps[stepIdx] as TutorialStep | undefined
  const isComplete = stepIdx >= tutorial.steps.length

  const complete = useCallback(
    (status: 'completed' | 'skipped') => {
      setProgress((prev) => ({
        ...prev,
        tutorialStatus: {
          ...prev.tutorialStatus,
          [tutorial.nodeId]: status,
        },
      }))

      const stages = getStagesByNode(tutorial.nodeId)
      if (stages.length > 0) {
        navigate(`/play/${stages[0].id}`)
      } else {
        navigate('/tree')
      }
    },
    [tutorial.nodeId, navigate, setProgress],
  )

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (isComplete) return
      e.preventDefault()

      const key = mapKey(e)
      if (!key) return

      // Skip with Esc
      if (key === 'Esc') {
        playTick()
        complete('skipped')
        return
      }

      if (!step) return

      playTick()

      // Info step (expectedKey === null) — any key advances to next step
      if (step.expectedKey === null) {
        const nextIdx = stepIdx + 1
        if (nextIdx >= tutorial.steps.length) {
          complete('completed')
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
        // Apply key to editor via parser → executor
        const parsed = parseKeys([key])
        if (parsed) {
          const next = executeCommand(editorState, parsed.command)
          setEditorState(next)
        }

        // Advance if it's the expected key
        if (key === step.expectedKey) {
          const nextIdx = stepIdx + 1
          if (nextIdx >= tutorial.steps.length) {
            complete('completed')
          } else {
            setStepIdx(nextIdx)
            // Apply editor setup if next step has one
            const nextStep = tutorial.steps[nextIdx]
            if (nextStep?.editorSetup) {
              setEditorState(
                createEditorState(nextStep.editorSetup.text, nextStep.editorSetup.cursor),
              )
            }
          }
        }
      } else {
        // Wrong key
        setWrongMessage(step.wrongKeyMessage ?? `${key} じゃない。${step.expectedKey} を押してみろ`)
      }
    },
    [step, stepIdx, editorState, isComplete, complete, tutorial],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  return (
    <div className="tutorial-screen">
      {/* Top Bar */}
      <div className="tutorial-top-bar">
        <div className="tutorial-top-left">
          <span className="tutorial-badge">TUTORIAL</span>
          <span className="tutorial-title">{tutorial.nodeId}</span>
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

        <span className="tutorial-mode">NORMAL</span>
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
            complete('skipped')
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
