/**
 * EditorView — renders the code editor with line numbers and cursor.
 * Pure display component, no keyboard handling.
 */

import { useState, useEffect, useRef } from 'react'
import type { EditorState, CursorPosition } from '../../types/editor'
import type { Language } from '../../types/stage'
import {
  tokenizeLine,
  isHighlighterReady,
  waitForHighlighter,
  type TokenInfo,
} from '../../engine/highlighter'
import './EditorView.css'

interface EditorViewProps {
  state: EditorState
  goalText?: string
  goalCursor?: CursorPosition
  goalViewportTop?: number
  goalRegisters?: Record<string, string>
  showGoal?: boolean
  language?: Language
}

const VIEWPORT_HEIGHT = 16

export function EditorView({
  state,
  goalText,
  goalCursor,
  goalViewportTop,
  goalRegisters,
  showGoal,
  language,
}: EditorViewProps) {
  const [hlReady, setHlReady] = useState(isHighlighterReady())
  const goalTextRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hlReady) {
      waitForHighlighter().then(() => setHlReady(true))
    }
  }, [hlReady])

  // Auto-scroll goal preview to center cursor line
  useEffect(() => {
    const el = goalTextRef.current
    if (!el || showGoal) return
    const cursorLine = el.querySelector('.goal-cursor-line')
    if (cursorLine) {
      cursorLine.scrollIntoView({ block: 'center', behavior: 'instant' })
    }
  }, [goalText, goalCursor, goalViewportTop, showGoal])

  const lang = language ?? 'plaintext'
  const currentLines = state.text.split('\n')
  const goalLines = goalText?.split('\n')

  // In vision mode, show goal text with diff highlights
  const displayLines = showGoal && goalLines ? goalLines : currentLines

  // Viewport: only show lines within the viewport range (for long texts)
  // In vision mode with goalViewportTop, apply goal viewport; otherwise disable viewport in vision
  const useViewport = showGoal
    ? goalViewportTop !== undefined && displayLines.length > VIEWPORT_HEIGHT
    : displayLines.length > VIEWPORT_HEIGHT
  const vpTop = useViewport
    ? showGoal && goalViewportTop !== undefined
      ? goalViewportTop
      : state.viewportTop
    : 0
  const vpEnd = useViewport
    ? Math.min(vpTop + VIEWPORT_HEIGHT, displayLines.length)
    : displayLines.length
  const visibleLines = displayLines.slice(vpTop, vpEnd)

  // Compute visual selection range
  const visualRange =
    !showGoal && state.mode === 'visual' && state.visualStart ? getVisualRange(state) : null

  return (
    <div className={`editor${showGoal ? ' vision-active' : ''}`}>
      <div className="editor-header">
        <span className="editor-dot red" />
        <span className="editor-dot yellow" />
        <span className="editor-dot green" />
        <span className="editor-filename">
          {showGoal
            ? goalCursor
              ? goalViewportTop !== undefined
                ? 'GOAL — カーソル位置＋画面位置あり'
                : 'GOAL — カーソル位置あり'
              : 'GOAL (Space)'
            : 'buffer'}
        </span>
      </div>
      <div className="editor-content">
        {useViewport && vpTop > 0 && (
          <div className="viewport-indicator top">↑ {vpTop} lines above</div>
        )}
        {visibleLines.map((line, i) => {
          const lineIdx = vpTop + i
          const isCurrentLine = !showGoal && lineIdx === state.cursor.line
          const isGoalCursorLine = showGoal && goalCursor && lineIdx === goalCursor.line
          const currentLine = currentLines[lineIdx]
          const goalLine = goalLines?.[lineIdx]
          const isDiffLine = showGoal && currentLine !== goalLine
          const lineVisual = visualRange ? getLineVisual(visualRange, lineIdx, line.length) : null

          return (
            <div
              key={lineIdx}
              className={`editor-line${isCurrentLine || isGoalCursorLine ? ' active-line' : ''}${isDiffLine ? ' diff-line' : ''}${lineVisual ? ' visual-line' : ''}`}
            >
              <span className="line-number">{lineIdx + 1}</span>
              <span className="line-content">
                {showGoal && goalLines
                  ? isGoalCursorLine
                    ? renderGoalLineWithCursor(line, goalCursor!.col)
                    : renderDiffLine(line, currentLine)
                  : renderLineWithCursor(
                      line,
                      lineIdx,
                      state,
                      hlReady ? tokenizeLine(line, lang) : null,
                      lineVisual,
                    )}
              </span>
            </div>
          )
        })}
        {useViewport && vpEnd < displayLines.length && (
          <div className="viewport-indicator bottom">
            ↓ {displayLines.length - vpEnd} lines below
          </div>
        )}
      </div>
      {goalText !== undefined && !showGoal && (
        <div className="editor-goal">
          <div className="goal-label">
            {goalCursor
              ? goalViewportTop !== undefined
                ? 'GOAL カーソル位置＋画面位置'
                : 'GOAL カーソル位置'
              : goalRegisters
                ? 'GOAL レジスタ条件あり'
                : 'GOAL'}
            <span className="goal-hint"> (Space長押しで重ね合わせ)</span>
          </div>
          <div className="goal-text" ref={goalTextRef}>
            {(() => {
              const allGoalLines = goalText.split('\n')
              const useGoalVp =
                goalViewportTop !== undefined && allGoalLines.length > VIEWPORT_HEIGHT
              const gVpTop = useGoalVp ? goalViewportTop! : 0
              const gVpEnd = useGoalVp
                ? Math.min(gVpTop + VIEWPORT_HEIGHT, allGoalLines.length)
                : allGoalLines.length
              const goalSlice = allGoalLines.slice(gVpTop, gVpEnd)
              return (
                <>
                  {useGoalVp && gVpTop > 0 && (
                    <div className="viewport-indicator top">↑ {gVpTop} lines above</div>
                  )}
                  {goalSlice.map((line, i) => {
                    const lineIdx = gVpTop + i
                    const isDiff = currentLines[lineIdx] !== line
                    const isGoalCursor = goalCursor && goalCursor.line === lineIdx
                    return (
                      <div
                        key={lineIdx}
                        className={`goal-line${isDiff ? ' goal-diff' : ''}${isGoalCursor ? ' goal-cursor-line' : ''}`}
                      >
                        {isGoalCursor
                          ? renderGoalLineWithCursor(line, goalCursor!.col)
                          : line || '\u00A0'}
                      </div>
                    )
                  })}
                  {useGoalVp && gVpEnd < allGoalLines.length && (
                    <div className="viewport-indicator bottom">
                      ↓ {allGoalLines.length - gVpEnd} lines below
                    </div>
                  )}
                </>
              )
            })()}
          </div>
          {goalRegisters && (
            <div className="goal-registers">
              <span className="goal-reg-label">レジスタ条件:</span>
              {Object.entries(goalRegisters).map(([key, val]) => (
                <span key={key} className={`goal-reg${state.registers[key] === val ? ' met' : ''}`}>
                  "{key} = {val}
                </span>
              ))}
            </div>
          )}
          {Object.keys(state.registers).length > 0 && (
            <div className="goal-registers">
              <span className="goal-reg-label">現レジスタ値:</span>
              {Object.entries(state.registers).map(([key, val]) => (
                <span
                  key={key}
                  className={`goal-reg current${goalRegisters?.[key] === val ? ' met' : ''}`}
                >
                  "{key} = {val}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      {goalRegisters && showGoal && (
        <div className="goal-registers goal-registers-float">
          <span className="goal-reg-label">レジスタ条件:</span>
          {Object.entries(goalRegisters).map(([key, val]) => (
            <span key={key} className={`goal-reg${state.registers[key] === val ? ' met' : ''}`}>
              "{key} = {val}
            </span>
          ))}
        </div>
      )}
      {goalText === undefined && !showGoal && Object.keys(state.registers).length > 0 && (
        <div className="goal-registers goal-registers-standalone">
          <span className="goal-reg-label">現レジスタ値:</span>
          {Object.entries(state.registers).map(([key, val]) => (
            <span key={key} className="goal-reg current">
              "{key} = {val}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function renderDiffLine(goalLine: string, currentLine: string | undefined): React.ReactNode[] {
  if (currentLine === undefined || currentLine === goalLine) {
    return [<span key="text">{goalLine || '\u00A0'}</span>]
  }

  // Character-level diff: highlight characters that differ
  const result: React.ReactNode[] = []
  let i = 0

  while (i < goalLine.length) {
    const isDiff = i >= currentLine.length || goalLine[i] !== currentLine[i]
    if (isDiff) {
      // Collect consecutive diff characters
      let j = i
      while (j < goalLine.length && (j >= currentLine.length || goalLine[j] !== currentLine[j])) {
        j++
      }
      result.push(
        <span key={`d${i}`} className="diff-char">
          {goalLine.slice(i, j)}
        </span>,
      )
      i = j
    } else {
      // Collect consecutive same characters
      let j = i
      while (j < goalLine.length && j < currentLine.length && goalLine[j] === currentLine[j]) {
        j++
      }
      result.push(<span key={`s${i}`}>{goalLine.slice(i, j)}</span>)
      i = j
    }
  }

  if (result.length === 0) {
    result.push(<span key="empty">{'\u00A0'}</span>)
  }

  return result
}

function renderLineWithCursor(
  line: string,
  lineIdx: number,
  state: EditorState,
  tokens: TokenInfo[] | null,
  visual: { startCol: number; endCol: number } | null,
): React.ReactNode[] {
  const isCursorLine = lineIdx === state.cursor.line

  // Non-cursor line with visual selection: wrap selected range
  if (!isCursorLine && visual) {
    return renderVisualLine(line, visual)
  }

  // Non-cursor line: render with syntax highlighting if available
  if (!isCursorLine) {
    if (tokens && tokens.length > 0) {
      return tokens.map((t, i) => (
        <span key={i} style={t.color ? { color: t.color } : undefined}>
          {t.text}
        </span>
      ))
    }
    return [<span key="text">{line || '\u00A0'}</span>]
  }

  // Cursor line: overlay cursor on top of highlighted tokens
  const col = state.cursor.col
  const cursorClass = state.mode === 'insert' ? 'cursor-line' : 'cursor-block'

  // Visual mode cursor line: render with selection + cursor
  if (visual) {
    return renderVisualLineWithCursor(line, col, cursorClass, state.mode === 'insert', visual)
  }

  if (tokens && tokens.length > 0) {
    return renderTokensWithCursor(tokens, col, cursorClass, state.mode === 'insert')
  }

  // Fallback: no highlighting
  const before = line.slice(0, col)
  const cursorChar = line[col] ?? '\u00A0'
  const after = line.slice(col + 1)

  if (state.mode === 'insert') {
    return [
      <span key="before">{before}</span>,
      <span key="cursor" className={cursorClass} />,
      <span key="rest">{line.slice(col) || '\u00A0'}</span>,
    ]
  }

  return [
    <span key="before">{before}</span>,
    <span key="cursor" className={cursorClass}>
      {cursorChar}
    </span>,
    after ? <span key="after">{after}</span> : null,
  ].filter(Boolean) as React.ReactNode[]
}

function renderTokensWithCursor(
  tokens: TokenInfo[],
  cursorCol: number,
  cursorClass: string,
  isInsert: boolean,
): React.ReactNode[] {
  const result: React.ReactNode[] = []
  let pos = 0

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const tokenStart = pos
    const tokenEnd = pos + token.text.length

    if (cursorCol < tokenStart || cursorCol >= tokenEnd) {
      // Cursor not in this token
      result.push(
        <span key={i} style={token.color ? { color: token.color } : undefined}>
          {token.text}
        </span>,
      )
    } else {
      // Cursor is within this token — split it
      const offsetInToken = cursorCol - tokenStart
      const before = token.text.slice(0, offsetInToken)
      const cursorChar = token.text[offsetInToken] ?? '\u00A0'
      const after = token.text.slice(offsetInToken + 1)
      const style = token.color ? { color: token.color } : undefined

      if (before) {
        result.push(
          <span key={`${i}b`} style={style}>
            {before}
          </span>,
        )
      }

      if (isInsert) {
        result.push(<span key={`${i}c`} className={cursorClass} />)
        const rest = token.text.slice(offsetInToken)
        if (rest) {
          result.push(
            <span key={`${i}r`} style={style}>
              {rest}
            </span>,
          )
        }
      } else {
        result.push(
          <span key={`${i}c`} className={cursorClass}>
            {cursorChar}
          </span>,
        )
        if (after) {
          result.push(
            <span key={`${i}a`} style={style}>
              {after}
            </span>,
          )
        }
      }
    }
    pos = tokenEnd
  }

  // Cursor at end of line (past all tokens)
  if (cursorCol >= pos) {
    if (isInsert) {
      result.push(<span key="end-cursor" className={cursorClass} />)
      if (result.length === 1) {
        result.push(<span key="nbsp">{'\u00A0'}</span>)
      }
    } else {
      result.push(
        <span key="end-cursor" className={cursorClass}>
          {'\u00A0'}
        </span>,
      )
    }
  }

  if (result.length === 0) {
    result.push(<span key="empty">{'\u00A0'}</span>)
  }

  return result
}

function renderGoalLineWithCursor(line: string, col: number): React.ReactNode[] {
  const before = line.slice(0, col)
  const cursorChar = line[col] ?? '\u00A0'
  const after = line.slice(col + 1)

  return [
    <span key="before">{before}</span>,
    <span key="cursor" className="goal-cursor">
      {cursorChar}
    </span>,
    after ? <span key="after">{after}</span> : null,
  ].filter(Boolean) as React.ReactNode[]
}

// ─── Visual selection helpers ───────────────────────────────────────

interface VisualRange {
  startLine: number
  endLine: number
  startCol: number
  endCol: number
  type: 'char' | 'line' | 'block'
}

function getVisualRange(state: EditorState): VisualRange | null {
  if (!state.visualStart || !state.visualType) return null

  const a = state.visualStart
  const b = state.cursor

  // Normalize: ensure start is before end
  let startLine: number, endLine: number, startCol: number, endCol: number

  if (a.line < b.line || (a.line === b.line && a.col <= b.col)) {
    startLine = a.line
    endLine = b.line
    startCol = a.col
    endCol = b.col
  } else {
    startLine = b.line
    endLine = a.line
    startCol = b.col
    endCol = a.col
  }

  return { startLine, endLine, startCol, endCol, type: state.visualType }
}

function getLineVisual(
  range: VisualRange,
  lineIdx: number,
  lineLen: number,
): { startCol: number; endCol: number } | null {
  if (lineIdx < range.startLine || lineIdx > range.endLine) return null

  if (range.type === 'line') {
    return { startCol: 0, endCol: Math.max(0, lineLen - 1) }
  }

  if (range.type === 'block') {
    return { startCol: range.startCol, endCol: range.endCol }
  }

  // Character visual
  if (range.startLine === range.endLine) {
    return { startCol: range.startCol, endCol: range.endCol }
  }
  if (lineIdx === range.startLine) {
    return { startCol: range.startCol, endCol: Math.max(0, lineLen - 1) }
  }
  if (lineIdx === range.endLine) {
    return { startCol: 0, endCol: range.endCol }
  }
  // Middle lines: entire line selected
  return { startCol: 0, endCol: Math.max(0, lineLen - 1) }
}

function renderVisualLine(
  line: string,
  visual: { startCol: number; endCol: number },
): React.ReactNode[] {
  if (!line)
    return [
      <span key="empty" className="visual-selection">
        {'\u00A0'}
      </span>,
    ]

  const before = line.slice(0, visual.startCol)
  const selected = line.slice(visual.startCol, visual.endCol + 1)
  const after = line.slice(visual.endCol + 1)

  const result: React.ReactNode[] = []
  if (before) result.push(<span key="b">{before}</span>)
  result.push(
    <span key="s" className="visual-selection">
      {selected || '\u00A0'}
    </span>,
  )
  if (after) result.push(<span key="a">{after}</span>)
  return result
}

function renderVisualLineWithCursor(
  line: string,
  cursorCol: number,
  cursorClass: string,
  isInsert: boolean,
  visual: { startCol: number; endCol: number },
): React.ReactNode[] {
  if (!line) {
    return [
      <span key="cursor" className={`${cursorClass} visual-selection`}>
        {isInsert ? '' : '\u00A0'}
      </span>,
    ]
  }

  // Build character spans, marking selected and cursor
  const result: React.ReactNode[] = []
  let i = 0

  while (i < line.length) {
    const isCursor = i === cursorCol
    const isSelected = i >= visual.startCol && i <= visual.endCol
    const cls = [isSelected ? 'visual-selection' : '', isCursor && !isInsert ? cursorClass : '']
      .filter(Boolean)
      .join(' ')

    if (isCursor && isInsert) {
      // Insert cursor: render bar before character
      result.push(<span key={`ic${i}`} className="cursor-line" />)
      // Collect remaining selected/non-selected chars
    }

    if (cls) {
      result.push(
        <span key={`c${i}`} className={cls}>
          {line[i]}
        </span>,
      )
    } else {
      // Collect consecutive non-special characters
      let j = i + 1
      while (j < line.length && j !== cursorCol && !(j >= visual.startCol && j <= visual.endCol)) {
        j++
      }
      result.push(<span key={`t${i}`}>{line.slice(i, j)}</span>)
      i = j
      continue
    }
    i++
  }

  // Cursor past end of line
  if (cursorCol >= line.length) {
    const isSelected = cursorCol >= visual.startCol && cursorCol <= visual.endCol
    if (isInsert) {
      result.push(<span key="ec" className="cursor-line" />)
    } else {
      const cls = [isSelected ? 'visual-selection' : '', cursorClass].filter(Boolean).join(' ')
      result.push(
        <span key="ec" className={cls}>
          {'\u00A0'}
        </span>,
      )
    }
  }

  if (result.length === 0) {
    result.push(<span key="empty">{'\u00A0'}</span>)
  }

  return result
}
