/**
 * EditorView — renders the code editor with line numbers and cursor.
 * Pure display component, no keyboard handling.
 */

import type { EditorState, CursorPosition } from '../../types/editor'
import './EditorView.css'

interface EditorViewProps {
    state: EditorState
    goalText?: string
    goalCursor?: CursorPosition
}

export function EditorView({ state, goalText, goalCursor }: EditorViewProps) {
    const lines = state.text.split('\n')

    return (
        <div className="editor">
            <div className="editor-header">
                <span className="editor-dot red" />
                <span className="editor-dot yellow" />
                <span className="editor-dot green" />
                <span className="editor-filename">buffer</span>
            </div>
            <div className="editor-content">
                {lines.map((line, lineIdx) => (
                    <div
                        key={lineIdx}
                        className={`editor-line${lineIdx === state.cursor.line ? ' active-line' : ''}`}
                    >
                        <span className="line-number">{lineIdx + 1}</span>
                        <span className="line-content">
                            {renderLineWithCursor(line, lineIdx, state)}
                        </span>
                    </div>
                ))}
            </div>
            {goalText !== undefined && (
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

function renderLineWithCursor(
    line: string,
    lineIdx: number,
    state: EditorState,
): React.ReactNode[] {
    const isCursorLine = lineIdx === state.cursor.line
    if (!isCursorLine) {
        return [<span key="text">{line || '\u00A0'}</span>]
    }

    const col = state.cursor.col
    const before = line.slice(0, col)
    const cursorChar = line[col] ?? '\u00A0'
    const after = line.slice(col + 1)

    const cursorClass = state.mode === 'insert' ? 'cursor-line' : 'cursor-block'

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
