/**
 * Insert mode commands — entering/exiting insert mode and text editing.
 */

import type { EditorState, CursorPosition, Operation } from '../../types/editor'
import { lines, join, clampCursor, lineLen, isSpace } from './helpers'

/** Enter insert mode (i) */
export function executeInsertBefore(state: EditorState): EditorState {
  return { ...state, mode: 'insert' as const }
}

/** Enter insert mode after cursor (a) */
export function executeInsertAfter(state: EditorState): EditorState {
  const newCol = Math.min(state.cursor.col + 1, lineLen(state.text, state.cursor.line))
  return { ...state, cursor: { line: state.cursor.line, col: newCol }, mode: 'insert' as const }
}

/** Enter insert mode at first non-blank of line (I) */
export function executeInsertLineStart(state: EditorState): EditorState {
  const ls = lines(state.text)
  const line = ls[state.cursor.line]
  let col = 0
  while (col < line.length && isSpace(line[col])) col++
  return { ...state, cursor: { line: state.cursor.line, col }, mode: 'insert' as const }
}

/** Enter insert mode at end of line (A) */
export function executeInsertLineEnd(state: EditorState): EditorState {
  const len = lineLen(state.text, state.cursor.line)
  return { ...state, cursor: { line: state.cursor.line, col: len }, mode: 'insert' as const }
}

/** Open new line below and enter insert mode (o) */
export function executeOpenBelow(state: EditorState): EditorState {
  const ls = lines(state.text)
  const newLines = [...ls]
  newLines.splice(state.cursor.line + 1, 0, '')
  const newText = join(newLines)
  return {
    ...state,
    text: newText,
    cursor: { line: state.cursor.line + 1, col: 0 },
    mode: 'insert' as const,
  }
}

/** Open new line above and enter insert mode (O) */
export function executeOpenAbove(state: EditorState): EditorState {
  const ls = lines(state.text)
  const newLines = [...ls]
  newLines.splice(state.cursor.line, 0, '')
  const newText = join(newLines)
  return {
    ...state,
    text: newText,
    cursor: { line: state.cursor.line, col: 0 },
    mode: 'insert' as const,
  }
}

/** Exit insert/visual mode (Esc) */
export function executeEscape(state: EditorState): EditorState {
  if (state.mode === 'normal') return state

  if (state.mode === 'visual') {
    return {
      ...state,
      mode: 'normal',
      visualStart: undefined,
      visualType: undefined,
      lastVisualStart: state.visualStart,
      lastVisualEnd: state.cursor,
      lastVisualType: state.visualType,
    }
  }

  const newCol = Math.max(0, state.cursor.col - 1)
  return {
    ...state,
    cursor: clampCursor(state.text, { line: state.cursor.line, col: newCol }, 'normal'),
    mode: 'normal',
    replaceMode: undefined,
    lastInsertPosition: { ...state.cursor },
  }
}

/** Insert text at cursor (during insert mode) */
export function executeInsertText(state: EditorState, text: string): EditorState {
  const actualText = text === 'Enter' ? '\n' : text
  const ls = lines(state.text)
  const line = ls[state.cursor.line]
  const { col } = state.cursor

  if (actualText === '\n') {
    const before = line.slice(0, col)
    const after = line.slice(col)
    const newLines = [...ls]
    newLines.splice(state.cursor.line, 1, before, after)
    const newText = join(newLines)
    const newCursor: CursorPosition = { line: state.cursor.line + 1, col: 0 }
    return { ...state, text: newText, cursor: newCursor }
  }

  // Replace mode: overwrite character instead of inserting
  if (state.replaceMode && col < line.length) {
    const newLine = line.slice(0, col) + actualText + line.slice(col + 1)
    const newLines = [...ls]
    newLines[state.cursor.line] = newLine
    const newText = join(newLines)
    return {
      ...state,
      text: newText,
      cursor: { line: state.cursor.line, col: col + actualText.length },
    }
  }

  const newLine = line.slice(0, col) + actualText + line.slice(col)
  const newLines = [...ls]
  newLines[state.cursor.line] = newLine
  const newText = join(newLines)
  return {
    ...state,
    text: newText,
    cursor: { line: state.cursor.line, col: col + actualText.length },
  }
}

/** Execute Backspace in insert mode */
export function executeBackspace(state: EditorState): EditorState {
  const ls = lines(state.text)
  const { line: lineIdx, col } = state.cursor

  if (col === 0) {
    if (lineIdx === 0) return state
    const prevLine = ls[lineIdx - 1]
    const curLine = ls[lineIdx]
    const newLines = [...ls]
    newLines.splice(lineIdx - 1, 2, prevLine + curLine)
    const newText = join(newLines)
    return { ...state, text: newText, cursor: { line: lineIdx - 1, col: prevLine.length } }
  }

  const line = ls[lineIdx]
  const newLine = line.slice(0, col - 1) + line.slice(col)
  const newLines = [...ls]
  newLines[lineIdx] = newLine
  const newText = join(newLines)
  return { ...state, text: newText, cursor: { line: lineIdx, col: col - 1 } }
}

/**
 * Finalize insert mode: consolidate the insert session into a single undo entry.
 *
 * Damage formula: charCount === 0 → 0 (immediate cancel); charCount >= 1 → ceil(charCount / 5)
 */
export function finalizeInsertSession(
  state: EditorState,
  entryState: EditorState,
  charCount: number,
): EditorState {
  if (charCount === 0 && state.text === entryState.text) {
    return {
      ...state,
      undoStack: entryState.undoStack,
      redoStack: [],
      blockInsertInfo: undefined,
    }
  }

  // Visual block insert: replicate inserted text to all affected lines
  let finalState = state
  if (state.blockInsertInfo) {
    const { startLine, endLine, col } = state.blockInsertInfo
    const insertedText = getInsertedText(entryState.text, state.text, entryState.cursor)
    if (insertedText) {
      const ls = lines(finalState.text)
      for (let i = startLine; i <= endLine; i++) {
        if (i === startLine) continue // Already inserted on the first line
        if (i < ls.length) {
          const line = ls[i]
          const insertAt = Math.min(col, line.length)
          ls[i] = line.slice(0, insertAt) + insertedText + line.slice(insertAt)
        }
      }
      finalState = { ...finalState, text: join(ls) }
    }
  }

  const damage = 1 + Math.max(0, charCount - 5)
  const op: Operation = {
    oldText: entryState.text,
    newText: finalState.text,
    oldCursor: entryState.cursor,
    newCursor: finalState.cursor,
    oldMode: 'normal',
    newMode: 'normal',
    damage,
    damageAtEntry: 0,
  }

  return {
    ...finalState,
    undoStack: [...entryState.undoStack, op],
    redoStack: [],
    lastInsertText: getInsertedText(entryState.text, state.text, entryState.cursor),
    blockInsertInfo: undefined,
  }
}

/** Extract the text that was inserted during an insert session */
function getInsertedText(
  entryText: string,
  finalText: string,
  entryCursor: CursorPosition,
): string {
  const entryLines = lines(entryText)
  let entryOffset = 0
  for (let i = 0; i < entryCursor.line; i++) entryOffset += entryLines[i].length + 1
  entryOffset += entryCursor.col

  const before = entryText.slice(0, entryOffset)
  const after = entryText.slice(entryOffset)

  if (finalText.startsWith(before) && finalText.endsWith(after)) {
    return finalText.slice(before.length, finalText.length - after.length)
  }

  return ''
}
