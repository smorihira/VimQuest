/**
 * Motion executors — cursor movement commands.
 * All functions are pure: EditorState → CursorPosition (or EditorState for executeMotion).
 */

import type { EditorState, CursorPosition } from '../../types/editor'
import type { Command } from '../../types/command'
import { lines, clampCursor, lineLen, lineCount, isWordChar, isSpace } from './helpers'

/** Move cursor left (h) */
function moveLeft(state: EditorState, count: number): CursorPosition {
  return { line: state.cursor.line, col: Math.max(0, state.cursor.col - count) }
}

/** Move cursor down (j) */
function moveDown(state: EditorState, count: number): CursorPosition {
  const maxLine = lineCount(state.text) - 1
  const newLine = Math.min(state.cursor.line + count, maxLine)
  return clampCursor(state.text, { line: newLine, col: state.cursor.col }, state.mode)
}

/** Move cursor up (k) */
function moveUp(state: EditorState, count: number): CursorPosition {
  const newLine = Math.max(0, state.cursor.line - count)
  return clampCursor(state.text, { line: newLine, col: state.cursor.col }, state.mode)
}

/** Move cursor right (l) */
function moveRight(state: EditorState, count: number): CursorPosition {
  const maxCol = Math.max(0, lineLen(state.text, state.cursor.line) - 1)
  return { line: state.cursor.line, col: Math.min(state.cursor.col + count, maxCol) }
}

/** Move to next word start (w) */
function moveWordForward(state: EditorState, count: number): CursorPosition {
  const ls = lines(state.text)
  let { line, col } = state.cursor

  for (let i = 0; i < count; i++) {
    const lineText = ls[line]
    if (col >= lineText.length) {
      if (line < ls.length - 1) {
        line++
        col = 0
        while (col < ls[line].length && isSpace(ls[line][col])) col++
      }
      continue
    }

    const startChar = lineText[col]
    if (isWordChar(startChar)) {
      while (col < lineText.length && isWordChar(lineText[col])) col++
    } else if (!isSpace(startChar)) {
      while (col < lineText.length && !isWordChar(lineText[col]) && !isSpace(lineText[col])) col++
    }
    while (col < lineText.length && isSpace(lineText[col])) col++

    if (col >= lineText.length && line < ls.length - 1) {
      line++
      col = 0
      while (col < ls[line].length && isSpace(ls[line][col])) col++
    }
  }

  return clampCursor(state.text, { line, col }, state.mode)
}

/** Move to previous word start (b) */
function moveWordBackward(state: EditorState, count: number): CursorPosition {
  const ls = lines(state.text)
  let { line, col } = state.cursor

  for (let i = 0; i < count; i++) {
    if (col === 0) {
      if (line > 0) {
        line--
        col = Math.max(0, ls[line].length - 1)
      }
      continue
    }

    col--
    const lineText = ls[line]
    while (col > 0 && isSpace(lineText[col])) col--

    if (isWordChar(lineText[col])) {
      while (col > 0 && isWordChar(lineText[col - 1])) col--
    } else if (!isSpace(lineText[col])) {
      while (col > 0 && !isWordChar(lineText[col - 1]) && !isSpace(lineText[col - 1])) col--
    }
  }

  return { line, col }
}

/** Move to end of word (e) */
function moveWordEnd(state: EditorState, count: number): CursorPosition {
  const ls = lines(state.text)
  let { line, col } = state.cursor

  for (let i = 0; i < count; i++) {
    col++
    const lineText = ls[line]

    if (col >= lineText.length) {
      if (line < ls.length - 1) {
        line++
        col = 0
      } else {
        col = Math.max(0, lineText.length - 1)
        continue
      }
    }

    while (col < ls[line].length && isSpace(ls[line][col])) {
      col++
      if (col >= ls[line].length && line < ls.length - 1) {
        line++
        col = 0
      }
    }

    const curLine = ls[line]
    if (col < curLine.length && isWordChar(curLine[col])) {
      while (col < curLine.length - 1 && isWordChar(curLine[col + 1])) col++
    } else if (col < curLine.length && !isSpace(curLine[col])) {
      while (
        col < curLine.length - 1 &&
        !isWordChar(curLine[col + 1]) &&
        !isSpace(curLine[col + 1])
      )
        col++
    }
  }

  return clampCursor(state.text, { line, col }, state.mode)
}

/** Move to next WORD start (W) — whitespace-delimited */
function moveWORDForward(state: EditorState, count: number): CursorPosition {
  const ls = lines(state.text)
  let { line, col } = state.cursor

  for (let i = 0; i < count; i++) {
    const lineText = ls[line]
    while (col < lineText.length && !isSpace(lineText[col])) col++
    while (col < lineText.length && isSpace(lineText[col])) col++

    if (col >= lineText.length && line < ls.length - 1) {
      line++
      col = 0
      while (col < ls[line].length && isSpace(ls[line][col])) col++
    }
  }

  return clampCursor(state.text, { line, col }, state.mode)
}

/** Move to previous WORD start (B) — whitespace-delimited */
function moveWORDBackward(state: EditorState, count: number): CursorPosition {
  const ls = lines(state.text)
  let { line, col } = state.cursor

  for (let i = 0; i < count; i++) {
    if (col === 0) {
      if (line > 0) {
        line--
        col = Math.max(0, ls[line].length - 1)
      }
      continue
    }

    col--
    const lineText = ls[line]
    while (col > 0 && isSpace(lineText[col])) col--
    while (col > 0 && !isSpace(lineText[col - 1])) col--
  }

  return { line, col }
}

/** Move to end of WORD (E) — whitespace-delimited */
function moveWORDEnd(state: EditorState, count: number): CursorPosition {
  const ls = lines(state.text)
  let { line, col } = state.cursor

  for (let i = 0; i < count; i++) {
    col++
    if (col >= ls[line].length) {
      if (line < ls.length - 1) {
        line++
        col = 0
      } else {
        col = Math.max(0, ls[line].length - 1)
        continue
      }
    }

    while (col < ls[line].length && isSpace(ls[line][col])) {
      col++
      if (col >= ls[line].length && line < ls.length - 1) {
        line++
        col = 0
      }
    }

    while (col < ls[line].length - 1 && !isSpace(ls[line][col + 1])) col++
  }

  return clampCursor(state.text, { line, col }, state.mode)
}

/** Find character forward on current line (f) */
function findCharForward(state: EditorState, char: string, count: number): CursorPosition | null {
  const ls = lines(state.text)
  const line = ls[state.cursor.line]
  let found = 0
  for (let col = state.cursor.col + 1; col < line.length; col++) {
    if (line[col] === char) {
      found++
      if (found === count) return { line: state.cursor.line, col }
    }
  }
  return null
}

/** Find character backward on current line (F) */
function findCharBackward(state: EditorState, char: string, count: number): CursorPosition | null {
  const ls = lines(state.text)
  const line = ls[state.cursor.line]
  let found = 0
  for (let col = state.cursor.col - 1; col >= 0; col--) {
    if (line[col] === char) {
      found++
      if (found === count) return { line: state.cursor.line, col }
    }
  }
  return null
}

/** Find character forward, stop one before (t) */
function tilCharForward(state: EditorState, char: string, count: number): CursorPosition | null {
  const pos = findCharForward(state, char, count)
  if (!pos) return null
  return { line: pos.line, col: Math.max(state.cursor.col + 1, pos.col - 1) }
}

/** Find character backward, stop one after (T) */
function tilCharBackward(state: EditorState, char: string, count: number): CursorPosition | null {
  const pos = findCharBackward(state, char, count)
  if (!pos) return null
  return { line: pos.line, col: Math.min(state.cursor.col - 1, pos.col + 1) }
}

/** Move to start of line (0) */
function moveLineStart(state: EditorState): CursorPosition {
  return { line: state.cursor.line, col: 0 }
}

/** Move to end of line ($) */
function moveLineEnd(state: EditorState): CursorPosition {
  const len = lineLen(state.text, state.cursor.line)
  return { line: state.cursor.line, col: Math.max(0, len - 1) }
}

/** Move to first non-blank character (^) */
export function moveFirstNonBlank(state: EditorState): CursorPosition {
  const ls = lines(state.text)
  const line = ls[state.cursor.line]
  let col = 0
  while (col < line.length && isSpace(line[col])) col++
  return { line: state.cursor.line, col: Math.min(col, Math.max(0, line.length - 1)) }
}

/** Move to last line or specific line (G) */
function moveToLine(state: EditorState, count: number | undefined): CursorPosition {
  const maxLine = lineCount(state.text) - 1
  const targetLine = count !== undefined ? Math.min(count - 1, maxLine) : maxLine
  const ls = lines(state.text)
  const line = ls[Math.max(0, targetLine)]
  let col = 0
  while (col < line.length && isSpace(line[col])) col++
  return { line: Math.max(0, targetLine), col: Math.min(col, Math.max(0, line.length - 1)) }
}

/** Move to first line (gg) */
function moveToFirstLine(state: EditorState, count: number | undefined): CursorPosition {
  const maxLine = lineCount(state.text) - 1
  const targetLine = count !== undefined ? Math.min(count - 1, maxLine) : 0
  const ls = lines(state.text)
  const line = ls[Math.max(0, targetLine)]
  let col = 0
  while (col < line.length && isSpace(line[col])) col++
  return { line: Math.max(0, targetLine), col: Math.min(col, Math.max(0, line.length - 1)) }
}

/** Match bracket: find matching (, ), {, }, [, ] (%) */
function matchBracket(state: EditorState): CursorPosition | null {
  const PAIRS: Record<string, string> = {
    '(': ')',
    ')': '(',
    '{': '}',
    '}': '{',
    '[': ']',
    ']': '[',
  }
  const OPEN = new Set(['(', '{', '['])

  const ls = lines(state.text)
  const line = ls[state.cursor.line]

  let startCol = state.cursor.col
  while (startCol < line.length && !PAIRS[line[startCol]]) startCol++
  if (startCol >= line.length) return null

  const startChar = line[startCol]
  const matchChar = PAIRS[startChar]
  const forward = OPEN.has(startChar)
  const direction = forward ? 1 : -1

  let offset = 0
  for (let i = 0; i < state.cursor.line; i++) offset += ls[i].length + 1
  offset += startCol

  const flat = ls.join('\n')
  let depth = 1

  for (let i = offset + direction; i >= 0 && i < flat.length; i += direction) {
    if (flat[i] === startChar) depth++
    else if (flat[i] === matchChar) depth--
    if (depth === 0) {
      let ln = 0,
        col = 0
      for (let j = 0; j < i; j++) {
        if (flat[j] === '\n') {
          ln++
          col = 0
        } else col++
      }
      return { line: ln, col }
    }
  }

  return null
}

// ─── Paragraph motions ─────────────────────────────────────────────

/** Move to previous paragraph boundary ({ — blank line or start of file) */
function moveParagraphUp(state: EditorState, count: number): CursorPosition {
  const ls = lines(state.text)
  let line = state.cursor.line

  for (let i = 0; i < count; i++) {
    // Skip current blank lines
    while (line > 0 && ls[line].trim() === '') line--
    // Find next blank line above
    while (line > 0 && ls[line].trim() !== '') line--
  }

  return { line, col: 0 }
}

/** Move to next paragraph boundary (} — blank line or end of file) */
function moveParagraphDown(state: EditorState, count: number): CursorPosition {
  const ls = lines(state.text)
  let line = state.cursor.line
  const maxLine = ls.length - 1

  for (let i = 0; i < count; i++) {
    // Skip current blank lines
    while (line < maxLine && ls[line].trim() === '') line++
    // Find next blank line below
    while (line < maxLine && ls[line].trim() !== '') line++
  }

  return { line, col: 0 }
}

// ─── Viewport cursor motions ───────────────────────────────────────

const VIEWPORT_HEIGHT = 16

/** Move to top of viewport (H) */
function moveToViewportTop(state: EditorState): CursorPosition {
  const ls = lines(state.text)
  const targetLine = Math.min(state.viewportTop, ls.length - 1)
  const line = ls[targetLine]
  let col = 0
  while (col < line.length && isSpace(line[col])) col++
  return { line: targetLine, col: Math.min(col, Math.max(0, line.length - 1)) }
}

/** Move to middle of viewport (M) */
function moveToViewportMiddle(state: EditorState): CursorPosition {
  const ls = lines(state.text)
  const targetLine = Math.min(state.viewportTop + Math.floor(VIEWPORT_HEIGHT / 2), ls.length - 1)
  const line = ls[targetLine]
  let col = 0
  while (col < line.length && isSpace(line[col])) col++
  return { line: targetLine, col: Math.min(col, Math.max(0, line.length - 1)) }
}

/** Move to bottom of viewport (L) */
function moveToViewportBottom(state: EditorState): CursorPosition {
  const ls = lines(state.text)
  const targetLine = Math.min(state.viewportTop + VIEWPORT_HEIGHT - 1, ls.length - 1)
  const line = ls[targetLine]
  let col = 0
  while (col < line.length && isSpace(line[col])) col++
  return { line: targetLine, col: Math.min(col, Math.max(0, line.length - 1)) }
}

/** Resolve a motion to a target cursor position */
export function resolveMotion(
  state: EditorState,
  motion: string,
  count: number,
  char?: string,
  rawCount?: number,
): CursorPosition | null {
  switch (motion) {
    case 'h':
      return moveLeft(state, count)
    case 'j':
      return moveDown(state, count)
    case 'k':
      return moveUp(state, count)
    case 'l':
      return moveRight(state, count)
    case 'w':
      return moveWordForward(state, count)
    case 'b':
      return moveWordBackward(state, count)
    case 'e':
      return moveWordEnd(state, count)
    case 'W':
      return moveWORDForward(state, count)
    case 'B':
      return moveWORDBackward(state, count)
    case 'E':
      return moveWORDEnd(state, count)
    case 'f':
      return char ? findCharForward(state, char, count) : null
    case 'F':
      return char ? findCharBackward(state, char, count) : null
    case 't':
      return char ? tilCharForward(state, char, count) : null
    case 'T':
      return char ? tilCharBackward(state, char, count) : null
    case '0':
      return moveLineStart(state)
    case '$':
      return moveLineEnd(state)
    case '^':
      return moveFirstNonBlank(state)
    case 'G':
      return moveToLine(state, rawCount)
    case 'gg':
      return moveToFirstLine(state, rawCount)
    case '%':
      return matchBracket(state)
    case 'gj':
      return moveDown(state, count)
    case 'gk':
      return moveUp(state, count)
    case '{':
      return moveParagraphUp(state, count)
    case '}':
      return moveParagraphDown(state, count)
    case 'H':
      return moveToViewportTop(state)
    case 'M':
      return moveToViewportMiddle(state)
    case 'L':
      return moveToViewportBottom(state)
    case ';': {
      if (!state.lastFindMotion) return null
      return resolveMotion(state, state.lastFindMotion.motion, count, state.lastFindMotion.char)
    }
    case ',': {
      if (!state.lastFindMotion) return null
      const reverse: Record<string, string> = { f: 'F', F: 'f', t: 'T', T: 't' }
      return resolveMotion(
        state,
        reverse[state.lastFindMotion.motion],
        count,
        state.lastFindMotion.char,
      )
    }
    default:
      return null
  }
}

/**
 * Determine if a motion's delete is inclusive.
 * e.g. 'e' includes char at target, 'w' does not.
 */
export function isMotionInclusive(motion: string): boolean {
  switch (motion) {
    case 'e':
    case 'E':
    case 'f':
    case 'F':
    case '$':
    case '%':
    case 't':
    case 'T':
      return true
    default:
      return false
  }
}

/** Execute a motion-only command — no undo entry (motions aren't undoable) */
export function executeMotion(state: EditorState, cmd: Command): EditorState {
  const count = cmd.count ?? 1
  const motion = cmd.motion!
  const target = resolveMotion(state, motion, count, cmd.char, cmd.count)
  if (!target) return state

  let newState = { ...state, cursor: clampCursor(state.text, target, state.mode) }
  if ((motion === 'f' || motion === 'F' || motion === 't' || motion === 'T') && cmd.char) {
    newState = {
      ...newState,
      lastFindMotion: { motion: motion as 'f' | 'F' | 't' | 'T', char: cmd.char },
    }
  }
  return newState
}
