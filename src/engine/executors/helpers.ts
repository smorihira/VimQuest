/**
 * Shared helpers used across all executor modules.
 * Pure utilities — no side effects, no React dependency.
 */

import type { EditorState, CursorPosition, Operation, VimMode } from '../../types/editor'

/** Split text into lines */
export function lines(text: string): string[] {
  return text.split('\n')
}

/** Join lines into text */
export function join(ls: string[]): string {
  return ls.join('\n')
}

/** Clamp cursor to valid position within text */
export function clampCursor(text: string, cursor: CursorPosition, mode: VimMode): CursorPosition {
  const ls = lines(text)
  const line = Math.max(0, Math.min(cursor.line, ls.length - 1))
  const lineLength = ls[line].length
  const maxCol = mode === 'insert' ? lineLength : Math.max(0, lineLength - 1)
  const col = Math.max(0, Math.min(cursor.col, maxCol))
  return { line, col }
}

/** Get line length (0-indexed) */
export function lineLen(text: string, lineIdx: number): number {
  return lines(text)[lineIdx]?.length ?? 0
}

/** Total number of lines */
export function lineCount(text: string): number {
  return lines(text).length
}

/** Check if character is a word character (alphanumeric + underscore) */
export function isWordChar(ch: string): boolean {
  return /\w/.test(ch)
}

/** Check if character is whitespace */
export function isSpace(ch: string): boolean {
  return /\s/.test(ch)
}

/** Push an operation to the undo stack */
export function pushUndo(
  state: EditorState,
  newText: string,
  newCursor: CursorPosition,
  newMode: VimMode,
  damage: number,
): EditorState {
  const op: Operation = {
    oldText: state.text,
    newText,
    oldCursor: state.cursor,
    newCursor,
    oldMode: state.mode,
    newMode,
    damage,
    damageAtEntry: 0, // stamped by usePlayEngine with actual cumulative damage
  }
  return {
    ...state,
    text: newText,
    cursor: clampCursor(newText, newCursor, newMode),
    mode: newMode,
    undoStack: [...state.undoStack, op],
    redoStack: [],
  }
}

/** Delete a range of text between two cursor positions */
export function deleteRange(
  text: string,
  from: CursorPosition,
  to: CursorPosition,
  inclusive: boolean,
): { text: string; cursor: CursorPosition; deleted: string } {
  const ls = lines(text)

  let fromOffset = 0
  for (let i = 0; i < from.line; i++) fromOffset += ls[i].length + 1
  fromOffset += from.col

  let toOffset = 0
  for (let i = 0; i < to.line; i++) toOffset += ls[i].length + 1
  toOffset += to.col

  if (fromOffset > toOffset) {
    ;[fromOffset, toOffset] = [toOffset, fromOffset]
  }

  if (inclusive) toOffset++

  const deleted = text.slice(fromOffset, toOffset)
  const newText = text.slice(0, fromOffset) + text.slice(toOffset)

  const newLines = lines(newText)
  let offset = 0
  let cursorLine = 0
  for (let i = 0; i < newLines.length; i++) {
    if (offset + newLines[i].length >= fromOffset) {
      cursorLine = i
      break
    }
    offset += newLines[i].length + 1
  }
  const cursorCol = fromOffset - offset

  return {
    text: newText || '',
    cursor: { line: cursorLine, col: Math.max(0, cursorCol) },
    deleted,
  }
}

/** Convert a flat character offset to a CursorPosition */
export function offsetToPos(text: string, offset: number): CursorPosition {
  const ls = lines(text)
  let remaining = offset
  for (let i = 0; i < ls.length; i++) {
    if (remaining <= ls[i].length) {
      return { line: i, col: remaining }
    }
    remaining -= ls[i].length + 1
  }
  const lastLine = ls.length - 1
  return { line: lastLine, col: ls[lastLine].length }
}
