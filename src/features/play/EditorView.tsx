/**
 * EditorView — renders the code editor with line numbers and cursor.
 * Pure display component, no keyboard handling.
 */

import { useState, useEffect } from 'react'
import type { EditorState, CursorPosition } from '../../types/editor'
import type { Language } from '../../types/stage'
import { tokenizeLine, isHighlighterReady, waitForHighlighter, type TokenInfo } from '../../engine/highlighter'
import './EditorView.css'

interface EditorViewProps {
    state: EditorState
    goalText?: string
    goalCursor?: CursorPosition
    showGoal?: boolean
    language?: Language
}

export function EditorView({ state, goalText, goalCursor, showGoal, language }: EditorViewProps) {
    const [hlReady, setHlReady] = useState(isHighlighterReady())

    useEffect(() => {
        if (!hlReady) {
            waitForHighlighter().then(() => setHlReady(true))
        }
    }, [hlReady])

    const lang = language ?? 'plaintext'
    const currentLines = state.text.split('\n')
    const goalLines = goalText?.split('\n')

    // In vision mode, show goal text with diff highlights
    const displayLines = showGoal && goalLines ? goalLines : currentLines

    return (
        <div className={`editor${showGoal ? ' vision-active' : ''}`}>
            <div className="editor-header">
                <span className="editor-dot red" />
                <span className="editor-dot yellow" />
                <span className="editor-dot green" />
                <span className="editor-filename">
                    {showGoal ? 'GOAL VISION (Space)' : 'buffer'}
                </span>
            </div>
            <div className="editor-content">
                {displayLines.map((line, lineIdx) => {
                    const isCurrentLine = !showGoal && lineIdx === state.cursor.line
                    const currentLine = currentLines[lineIdx]
                    const goalLine = goalLines?.[lineIdx]
                    const isDiffLine = showGoal && currentLine !== goalLine

                    return (
                        <div
                            key={lineIdx}
                            className={`editor-line${isCurrentLine ? ' active-line' : ''}${isDiffLine ? ' diff-line' : ''}`}
                        >
                            <span className="line-number">{lineIdx + 1}</span>
                            <span className="line-content">
                                {showGoal && goalLines
                                    ? renderDiffLine(line, currentLine)
                                    : renderLineWithCursor(line, lineIdx, state, hlReady ? tokenizeLine(line, lang) : null)}
                            </span>
                        </div>
                    )
                })}
            </div>
            {goalText !== undefined && !showGoal && (
                <div className="editor-goal">
                    <div className="goal-label">
                        {goalCursor ? 'GOAL カーソル位置' : 'GOAL'}
                    </div>
                    <div className="goal-text">
                        {goalText.split('\n').map((line, i) => (
                            <div key={i} className="goal-line">
                                {goalCursor && goalCursor.line === i
                                    ? renderGoalLineWithCursor(line, goalCursor.col)
                                    : (line || '\u00A0')}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function renderDiffLine(
    goalLine: string,
    currentLine: string | undefined,
): React.ReactNode[] {
    if (currentLine === undefined || currentLine === goalLine) {
        return [<span key="text">{goalLine || '\u00A0'}</span>]
    }

    // Character-level diff: highlight characters that differ
    const result: React.ReactNode[] = []
    const maxLen = Math.max(goalLine.length, currentLine.length)
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
                <span key={`d${i}`} className="diff-char">{goalLine.slice(i, j)}</span>
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
): React.ReactNode[] {
    const isCursorLine = lineIdx === state.cursor.line

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
        <span key="cursor" className={cursorClass}>{cursorChar}</span>,
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
                </span>
            )
        } else {
            // Cursor is within this token — split it
            const offsetInToken = cursorCol - tokenStart
            const before = token.text.slice(0, offsetInToken)
            const cursorChar = token.text[offsetInToken] ?? '\u00A0'
            const after = token.text.slice(offsetInToken + 1)
            const style = token.color ? { color: token.color } : undefined

            if (before) {
                result.push(<span key={`${i}b`} style={style}>{before}</span>)
            }

            if (isInsert) {
                result.push(<span key={`${i}c`} className={cursorClass} />)
                const rest = token.text.slice(offsetInToken)
                if (rest) {
                    result.push(<span key={`${i}r`} style={style}>{rest}</span>)
                }
            } else {
                result.push(
                    <span key={`${i}c`} className={cursorClass}>{cursorChar}</span>
                )
                if (after) {
                    result.push(<span key={`${i}a`} style={style}>{after}</span>)
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
                <span key="end-cursor" className={cursorClass}>{'\u00A0'}</span>
            )
        }
    }

    if (result.length === 0) {
        result.push(<span key="empty">{'\u00A0'}</span>)
    }

    return result
}

function renderGoalLineWithCursor(
    line: string,
    col: number,
): React.ReactNode[] {
    const before = line.slice(0, col)
    const cursorChar = line[col] ?? '\u00A0'
    const after = line.slice(col + 1)

    return [
        <span key="before">{before}</span>,
        <span key="cursor" className="goal-cursor">{cursorChar}</span>,
        after ? <span key="after">{after}</span> : null,
    ].filter(Boolean) as React.ReactNode[]
}
