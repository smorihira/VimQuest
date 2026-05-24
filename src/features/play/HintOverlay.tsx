/**
 * HintOverlay — auto-plays the hint solution as an overlay demo.
 * Shows commands being applied one by one from initial state.
 */

import { useState, useEffect, useMemo, useRef } from 'react'
import type { Stage } from '../../types/stage'
import type { EditorState } from '../../types/editor'
import { createEditorState } from '../../types/editor'
import { applyHintCommand } from '../../engine/commandReplayer'
import { BASE_COMMANDS } from '../../data/constants'
import { EditorView } from './EditorView'
import './HintOverlay.css'

interface HintOverlayProps {
  stage: Stage
  onClose: () => void
}

export function HintOverlay({ stage, onClose }: HintOverlayProps) {
  const hint = stage.hints[0]
  const commands = useMemo(() => hint?.commands ?? [], [hint])
  const [step, setStep] = useState(-1)
  const [editorState, setEditorState] = useState<EditorState>(() =>
    createEditorState(stage.initialText, stage.initialCursor),
  )
  const [currentCmd, setCurrentCmd] = useState('')
  const editorRef = useRef<HTMLDivElement>(null)

  const showBase = stage.nodeId !== 'N01' || stage.id === 'N01-C'
  const baseCommands = showBase ? (BASE_COMMANDS as unknown as readonly string[]) : undefined

  // Auto-advance steps
  useEffect(() => {
    if (step >= commands.length) return

    const timer = setTimeout(
      () => {
        const nextStep = step + 1
        if (nextStep < commands.length) {
          const cmd = commands[nextStep]
          setCurrentCmd(cmd)
          setEditorState((prev) =>
            applyHintCommand(
              prev,
              cmd,
              stage.availableCommands,
              baseCommands,
              stage.visualCommands,
            ),
          )
        }
        setStep(nextStep)
      },
      step === -1 ? 500 : 800,
    )

    return () => clearTimeout(timer)
  }, [step, commands, stage.availableCommands, baseCommands, stage.visualCommands])

  // Auto-scroll to keep active line centered in hint editor
  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    const activeLine = el.querySelector('.active-line')
    if (activeLine) {
      activeLine.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [editorState])

  // Capture ALL keys during hint overlay — only Esc closes
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey, true)
    return () => window.removeEventListener('keydown', handleKey, true)
  }, [onClose])

  const isComplete = step >= commands.length

  return (
    <div className="hint-overlay" onClick={onClose}>
      <div className="hint-panel" onClick={(e) => e.stopPropagation()}>
        <div className="hint-header">
          <span className="hint-badge">HINT DEMO</span>
          <span className="hint-progress">
            {Math.min(step + 1, commands.length)} / {commands.length}
          </span>
          <button className="hint-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="hint-editor" ref={editorRef}>
          <EditorView
            state={editorState}
            language={stage.language}
            goalRegisters={stage.clearConditions?.registers}
          />
        </div>

        <div className="hint-commands">
          {commands.map((cmd, i) => (
            <span
              key={i}
              className={`hint-cmd${i <= step ? ' done' : ''}${i === step ? ' current' : ''}`}
            >
              {cmd}
            </span>
          ))}
        </div>

        {currentCmd && !isComplete && <div className="hint-current-label">→ {currentCmd}</div>}

        {isComplete && <div className="hint-complete">☆3 達成！（{commands.length}ダメージ）</div>}
      </div>
    </div>
  )
}
