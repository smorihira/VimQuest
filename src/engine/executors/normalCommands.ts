/**
 * Normal mode commands — delete, replace, toggle case, undo/redo,
 * paste, substitute, join, search, scroll, indent, visual enter.
 */

import type { EditorState } from '../../types/editor'
import type { Command } from '../../types/command'
import {
  lines,
  join,
  clampCursor,
  lineCount,
  isWordChar,
  isSpace,
  pushUndo,
  offsetToPos,
} from './helpers'

// ─── Delete / Modify ───────────────────────────────────────────────

/** Execute x (delete character under cursor) */
export function executeDeleteChar(state: EditorState, cmd: Command): EditorState {
  const count = cmd.count ?? 1
  const ls = lines(state.text)
  const line = ls[state.cursor.line]
  if (line.length === 0) return state

  const start = state.cursor.col
  const end = Math.min(start + count, line.length)
  const deleted = line.slice(start, end)
  const newLine = line.slice(0, start) + line.slice(end)
  const newLines = [...ls]
  newLines[state.cursor.line] = newLine
  const newText = join(newLines)

  const newCursor = clampCursor(newText, state.cursor, 'normal')
  const result = pushUndo(state, newText, newCursor, 'normal', 1)
  return { ...result, registers: { ...result.registers, '': deleted } }
}

/** Execute u (undo) — FREE, no damage */
export function executeUndo(state: EditorState): EditorState {
  if (state.undoStack.length === 0) return state

  const op = state.undoStack[state.undoStack.length - 1]
  return {
    ...state,
    text: op.oldText,
    cursor: clampCursor(op.oldText, op.oldCursor, op.oldMode),
    mode: op.oldMode,
    undoStack: state.undoStack.slice(0, -1),
    redoStack: [...state.redoStack, op],
  }
}

/** Execute Ctrl+R (redo) — FREE, no damage */
export function executeRedo(state: EditorState): EditorState {
  if (state.redoStack.length === 0) return state

  const op = state.redoStack[state.redoStack.length - 1]
  return {
    ...state,
    text: op.newText,
    cursor: clampCursor(op.newText, op.newCursor, op.newMode),
    mode: op.newMode,
    undoStack: [...state.undoStack, op],
    redoStack: state.redoStack.slice(0, -1),
  }
}

/** Replace character under cursor (r + char) */
export function executeReplace(state: EditorState, char: string): EditorState {
  const ls = lines(state.text)
  const line = ls[state.cursor.line]
  if (line.length === 0 || state.cursor.col >= line.length) return state

  const newLine = line.slice(0, state.cursor.col) + char + line.slice(state.cursor.col + 1)
  const newLines = [...ls]
  newLines[state.cursor.line] = newLine
  const newText = join(newLines)
  return pushUndo(state, newText, state.cursor, 'normal', 1)
}

/** Toggle case of character under cursor (~) and advance */
export function executeToggleCase(state: EditorState): EditorState {
  const ls = lines(state.text)
  const line = ls[state.cursor.line]
  if (line.length === 0 || state.cursor.col >= line.length) return state

  const ch = line[state.cursor.col]
  const toggled = ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()
  const newLine = line.slice(0, state.cursor.col) + toggled + line.slice(state.cursor.col + 1)
  const newLines = [...ls]
  newLines[state.cursor.line] = newLine
  const newText = join(newLines)

  const newCol = Math.min(state.cursor.col + 1, Math.max(0, newLine.length - 1))
  return pushUndo(state, newText, { line: state.cursor.line, col: newCol }, 'normal', 1)
}

/** Execute dd — delete current line */
export function executeDeleteLine(state: EditorState, count: number): EditorState {
  const ls = lines(state.text)
  const from = state.cursor.line
  const to = Math.min(from + count, ls.length)
  const deleted = ls.slice(from, to).join('\n') + '\n'
  const newLines = [...ls.slice(0, from), ...ls.slice(to)]
  if (newLines.length === 0) newLines.push('')
  const newText = join(newLines)
  const newLine = Math.min(from, newLines.length - 1)
  let col = 0
  while (col < newLines[newLine].length && isSpace(newLines[newLine][col])) col++
  const newCursor = {
    line: newLine,
    col: Math.min(col, Math.max(0, newLines[newLine].length - 1)),
  }
  const result = pushUndo(state, newText, newCursor, 'normal', 1)
  return { ...result, registers: { ...result.registers, '': deleted } }
}

/** Execute D — delete from cursor to end of line */
export function executeDeleteToEnd(state: EditorState): EditorState {
  const ls = lines(state.text)
  const line = ls[state.cursor.line]
  const deleted = line.slice(state.cursor.col)
  const newLine = line.slice(0, state.cursor.col)
  const newLines = [...ls]
  newLines[state.cursor.line] = newLine
  const newText = join(newLines)
  const newCol = Math.max(0, state.cursor.col - 1)
  const result = pushUndo(state, newText, { line: state.cursor.line, col: newCol }, 'normal', 1)
  return { ...result, registers: { ...result.registers, '': deleted } }
}

/** Execute C — change from cursor to end of line */
export function executeChangeToEnd(state: EditorState): EditorState {
  const ls = lines(state.text)
  const line = ls[state.cursor.line]
  const deleted = line.slice(state.cursor.col)
  const newLine = line.slice(0, state.cursor.col)
  const newLines = [...ls]
  newLines[state.cursor.line] = newLine
  const newText = join(newLines)
  return {
    ...state,
    text: newText,
    cursor: state.cursor,
    mode: 'insert',
    registers: { ...state.registers, '': deleted },
  }
}

/** Execute J — join current line with next line */
export function executeJoinLines(state: EditorState): EditorState {
  const ls = lines(state.text)
  if (state.cursor.line >= ls.length - 1) return state
  const curLine = ls[state.cursor.line]
  const nextLine = ls[state.cursor.line + 1]
  const trimmedNext = nextLine.trimStart()
  const joinCol = curLine.length
  const joined = curLine + (trimmedNext.length > 0 ? ' ' + trimmedNext : '')
  const newLines = [...ls]
  newLines.splice(state.cursor.line, 2, joined)
  const newText = join(newLines)
  return pushUndo(state, newText, { line: state.cursor.line, col: joinCol }, 'normal', 1)
}

/** Execute p — paste after cursor */
export function executePaste(state: EditorState, register: string): EditorState {
  const content = state.registers[register] ?? ''
  if (!content) return state

  const ls = lines(state.text)

  if (content.endsWith('\n')) {
    const pasteLines = content.slice(0, -1)
    const newLines = [...ls]
    newLines.splice(state.cursor.line + 1, 0, pasteLines)
    const newText = join(newLines)
    const newCursor = { line: state.cursor.line + 1, col: 0 }
    return pushUndo(state, newText, newCursor, 'normal', 1)
  }

  const line = ls[state.cursor.line]
  const insertCol = Math.min(state.cursor.col + 1, line.length)
  const newLine = line.slice(0, insertCol) + content + line.slice(insertCol)
  const newLines = [...ls]
  newLines[state.cursor.line] = newLine
  const newText = join(newLines)
  const newCursor = { line: state.cursor.line, col: insertCol + content.length - 1 }
  return pushUndo(state, newText, newCursor, 'normal', 1)
}

/** Execute P — paste before cursor */
export function executePasteBefore(state: EditorState, register: string): EditorState {
  const content = state.registers[register] ?? ''
  if (!content) return state

  const ls = lines(state.text)

  if (content.endsWith('\n')) {
    const pasteLines = content.slice(0, -1)
    const newLines = [...ls]
    newLines.splice(state.cursor.line, 0, pasteLines)
    const newText = join(newLines)
    const newCursor = { line: state.cursor.line, col: 0 }
    return pushUndo(state, newText, newCursor, 'normal', 1)
  }

  const line = ls[state.cursor.line]
  const newLine = line.slice(0, state.cursor.col) + content + line.slice(state.cursor.col)
  const newLines = [...ls]
  newLines[state.cursor.line] = newLine
  const newText = join(newLines)
  const newCursor = { line: state.cursor.line, col: state.cursor.col + content.length - 1 }
  return pushUndo(state, newText, newCursor, 'normal', 1)
}

/** Execute s — substitute character (delete char + enter insert) */
export function executeSubstitute(state: EditorState): EditorState {
  const ls = lines(state.text)
  const line = ls[state.cursor.line]
  if (line.length === 0) return { ...state, mode: 'insert' }
  const deleted = line[state.cursor.col]
  const newLine = line.slice(0, state.cursor.col) + line.slice(state.cursor.col + 1)
  const newLines = [...ls]
  newLines[state.cursor.line] = newLine
  const newText = join(newLines)
  return {
    ...state,
    text: newText,
    cursor: state.cursor,
    mode: 'insert',
    registers: { ...state.registers, '': deleted },
  }
}

/** Execute S — substitute entire line (delete line content + enter insert) */
export function executeSubstituteLine(state: EditorState): EditorState {
  const ls = lines(state.text)
  const line = ls[state.cursor.line]
  const indent = line.match(/^(\s*)/)?.[1] ?? ''
  const newLines = [...ls]
  newLines[state.cursor.line] = indent
  const newText = join(newLines)
  return {
    ...state,
    text: newText,
    cursor: { line: state.cursor.line, col: indent.length },
    mode: 'insert',
    registers: { ...state.registers, '': line },
  }
}

// ─── Indent / Dedent ───────────────────────────────────────────────

/** Execute >> — indent line */
export function executeIndent(state: EditorState, count: number): EditorState {
  const ls = lines(state.text)
  const newLines = [...ls]
  for (let i = 0; i < count && state.cursor.line + i < ls.length; i++) {
    newLines[state.cursor.line + i] = '  ' + newLines[state.cursor.line + i]
  }
  const newText = join(newLines)
  const line = newLines[state.cursor.line]
  let col = 0
  while (col < line.length && isSpace(line[col])) col++
  return pushUndo(state, newText, { line: state.cursor.line, col }, 'normal', 1)
}

/** Execute << — dedent line */
export function executeDedent(state: EditorState, count: number): EditorState {
  const ls = lines(state.text)
  const newLines = [...ls]
  for (let i = 0; i < count && state.cursor.line + i < ls.length; i++) {
    const line = newLines[state.cursor.line + i]
    if (line.startsWith('  ')) newLines[state.cursor.line + i] = line.slice(2)
    else if (line.startsWith(' ')) newLines[state.cursor.line + i] = line.slice(1)
    else if (line.startsWith('\t')) newLines[state.cursor.line + i] = line.slice(1)
  }
  const newText = join(newLines)
  const line = newLines[state.cursor.line]
  let col = 0
  while (col < line.length && isSpace(line[col])) col++
  return pushUndo(state, newText, { line: state.cursor.line, col }, 'normal', 1)
}

// ─── Search ────────────────────────────────────────────────────────

/** Execute search (/ + pattern) */
export function executeSearch(state: EditorState, pattern: string): EditorState {
  if (!pattern) return state
  const flat = state.text
  const ls = lines(flat)

  let curOffset = 0
  for (let i = 0; i < state.cursor.line; i++) curOffset += ls[i].length + 1
  curOffset += state.cursor.col

  try {
    const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    const after = flat.slice(curOffset + 1)
    const match = regex.exec(after)
    if (match) {
      const pos = offsetToPos(flat, curOffset + 1 + match.index)
      return {
        ...state,
        cursor: pos,
        lastSearchPattern: pattern,
        lastSearchDirection: 'forward',
      }
    }
    const before = flat.slice(0, curOffset + 1)
    const wrapMatch = regex.exec(before)
    if (wrapMatch) {
      const pos = offsetToPos(flat, wrapMatch.index)
      return {
        ...state,
        cursor: pos,
        lastSearchPattern: pattern,
        lastSearchDirection: 'forward',
      }
    }
  } catch {
    // Invalid regex
  }
  return { ...state, lastSearchPattern: pattern, lastSearchDirection: 'forward' }
}

/** Execute n — repeat search in same direction */
export function executeSearchNext(state: EditorState): EditorState {
  if (!state.lastSearchPattern) return state
  if (state.lastSearchDirection === 'backward') {
    return executeSearchBackward(state, state.lastSearchPattern)
  }
  return executeSearch(state, state.lastSearchPattern)
}

/** Execute N — repeat search in opposite direction */
export function executeSearchPrev(state: EditorState): EditorState {
  if (!state.lastSearchPattern) return state
  if (state.lastSearchDirection === 'backward') {
    return executeSearch(state, state.lastSearchPattern)
  }
  const pattern = state.lastSearchPattern
  const flat = state.text
  const ls = lines(flat)

  let curOffset = 0
  for (let i = 0; i < state.cursor.line; i++) curOffset += ls[i].length + 1
  curOffset += state.cursor.col

  try {
    const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    let lastMatch: number | null = null
    let m: RegExpExecArray | null
    while ((m = regex.exec(flat)) !== null) {
      if (m.index < curOffset) lastMatch = m.index
      else break
    }
    if (lastMatch !== null) {
      return { ...state, cursor: offsetToPos(flat, lastMatch) }
    }
    regex.lastIndex = 0
    let wrapMatch: number | null = null
    while ((m = regex.exec(flat)) !== null) {
      wrapMatch = m.index
    }
    if (wrapMatch !== null) {
      return { ...state, cursor: offsetToPos(flat, wrapMatch) }
    }
  } catch {
    // Invalid pattern
  }
  return state
}

/** Execute * — search for word under cursor forward */
export function executeSearchWordForward(state: EditorState): EditorState {
  const ls = lines(state.text)
  const line = ls[state.cursor.line]
  const col = state.cursor.col

  if (!isWordChar(line[col])) return state
  let start = col
  let end = col
  while (start > 0 && isWordChar(line[start - 1])) start--
  while (end < line.length - 1 && isWordChar(line[end + 1])) end++
  const word = line.slice(start, end + 1)

  return executeSearch(state, word)
}

/** Execute # — search for word under cursor backward */
export function executeSearchWordBackward(state: EditorState): EditorState {
  const ls = lines(state.text)
  const line = ls[state.cursor.line]
  const col = state.cursor.col

  if (!isWordChar(line[col])) return state
  let start = col
  let end = col
  while (start > 0 && isWordChar(line[start - 1])) start--
  while (end < line.length - 1 && isWordChar(line[end + 1])) end++
  const word = line.slice(start, end + 1)

  return executeSearchBackward(state, word)
}

/** Execute backward search (used by # and ?) */
export function executeSearchBackward(state: EditorState, pattern: string): EditorState {
  if (!pattern) return state
  const flat = state.text
  const ls = lines(flat)

  let curOffset = 0
  for (let i = 0; i < state.cursor.line; i++) curOffset += ls[i].length + 1
  curOffset += state.cursor.col

  try {
    const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    // Find last match before cursor
    let lastMatch: number | null = null
    let m: RegExpExecArray | null
    while ((m = regex.exec(flat)) !== null) {
      if (m.index < curOffset) lastMatch = m.index
      else break
    }
    if (lastMatch !== null) {
      return {
        ...state,
        cursor: offsetToPos(flat, lastMatch),
        lastSearchPattern: pattern,
        lastSearchDirection: 'backward',
      }
    }
    // Wrap around: find last match in entire text
    regex.lastIndex = 0
    let wrapMatch: number | null = null
    while ((m = regex.exec(flat)) !== null) {
      wrapMatch = m.index
    }
    if (wrapMatch !== null) {
      return {
        ...state,
        cursor: offsetToPos(flat, wrapMatch),
        lastSearchPattern: pattern,
        lastSearchDirection: 'backward',
      }
    }
  } catch {
    // Invalid pattern
  }
  return { ...state, lastSearchPattern: pattern, lastSearchDirection: 'backward' }
}

// ─── Scroll / Viewport ─────────────────────────────────────────────

const VIEWPORT_HEIGHT = 16

/** Clamp viewport top to valid range */
export function clampViewport(viewportTop: number, totalLines: number): number {
  const max = Math.max(0, totalLines - 1)
  return Math.min(Math.max(0, viewportTop), max)
}

/** Auto-scroll viewport to keep cursor visible */
export function ensureCursorVisible(state: EditorState): EditorState {
  const { cursor, viewportTop } = state
  if (cursor.line < viewportTop) {
    return { ...state, viewportTop: cursor.line }
  }
  if (cursor.line >= viewportTop + VIEWPORT_HEIGHT) {
    return { ...state, viewportTop: cursor.line - VIEWPORT_HEIGHT + 1 }
  }
  return state
}

/** Execute Ctrl+d — half page down */
export function executeHalfPageDown(state: EditorState): EditorState {
  const totalLines = lineCount(state.text)
  const halfPage = Math.max(1, Math.floor(VIEWPORT_HEIGHT / 2))
  const target = Math.min(state.cursor.line + halfPage, totalLines - 1)
  const newViewport = clampViewport(state.viewportTop + halfPage, totalLines)
  return { ...state, cursor: { line: target, col: 0 }, viewportTop: newViewport }
}

/** Execute Ctrl+u — half page up */
export function executeHalfPageUp(state: EditorState): EditorState {
  const totalLines = lineCount(state.text)
  const halfPage = Math.max(1, Math.floor(VIEWPORT_HEIGHT / 2))
  const target = Math.max(state.cursor.line - halfPage, 0)
  const newViewport = clampViewport(state.viewportTop - halfPage, totalLines)
  return { ...state, cursor: { line: target, col: 0 }, viewportTop: newViewport }
}

/** Execute zz — scroll viewport to center cursor */
export function executeViewportZZ(state: EditorState): EditorState {
  const totalLines = lineCount(state.text)
  const newTop = clampViewport(state.cursor.line - Math.floor(VIEWPORT_HEIGHT / 2), totalLines)
  return { ...state, viewportTop: newTop }
}

/** Execute zt — scroll viewport to put cursor at top */
export function executeViewportZT(state: EditorState): EditorState {
  const totalLines = lineCount(state.text)
  const newTop = clampViewport(state.cursor.line, totalLines)
  return { ...state, viewportTop: newTop }
}

/** Execute zb — scroll viewport to put cursor at bottom */
export function executeViewportZB(state: EditorState): EditorState {
  const totalLines = lineCount(state.text)
  const newTop = clampViewport(state.cursor.line - VIEWPORT_HEIGHT + 1, totalLines)
  return { ...state, viewportTop: newTop }
}

// ─── Visual Mode ───────────────────────────────────────────────────

/** Execute v — enter visual char mode */
export function executeVisualChar(state: EditorState): EditorState {
  return { ...state, mode: 'visual', visualStart: { ...state.cursor }, visualType: 'char' }
}

/** Execute V — enter visual line mode */
export function executeVisualLine(state: EditorState): EditorState {
  const ls = lines(state.text)
  const lineContent = ls[state.cursor.line]
  return {
    ...state,
    mode: 'visual',
    visualStart: { line: state.cursor.line, col: 0 },
    cursor: { line: state.cursor.line, col: Math.max(0, lineContent.length - 1) },
    visualType: 'line',
  }
}

// ─── Scroll 1 line ─────────────────────────────────────────────────

/** Execute Ctrl+e — scroll viewport down 1 line */
export function executeScrollDown1(state: EditorState): EditorState {
  const totalLines = lineCount(state.text)
  const newTop = clampViewport(state.viewportTop + 1, totalLines)
  let cursor = state.cursor
  // If cursor is above viewport, push it down
  if (cursor.line < newTop) {
    const ls = lines(state.text)
    let col = 0
    while (col < ls[newTop].length && isSpace(ls[newTop][col])) col++
    cursor = { line: newTop, col: Math.min(col, Math.max(0, ls[newTop].length - 1)) }
  }
  return { ...state, viewportTop: newTop, cursor }
}

/** Execute Ctrl+y — scroll viewport up 1 line */
export function executeScrollUp1(state: EditorState): EditorState {
  const totalLines = lineCount(state.text)
  const newTop = clampViewport(state.viewportTop - 1, totalLines)
  let cursor = state.cursor
  // If cursor is below viewport, push it up
  const bottomLine = newTop + VIEWPORT_HEIGHT - 1
  if (cursor.line > bottomLine) {
    const ls = lines(state.text)
    const targetLine = Math.min(bottomLine, ls.length - 1)
    let col = 0
    while (col < ls[targetLine].length && isSpace(ls[targetLine][col])) col++
    cursor = { line: targetLine, col: Math.min(col, Math.max(0, ls[targetLine].length - 1)) }
  }
  return { ...state, viewportTop: newTop, cursor }
}

// ─── Number increment/decrement ────────────────────────────────────

/** Execute Ctrl+a — increment number under/after cursor */
export function executeIncrement(state: EditorState): EditorState {
  return adjustNumber(state, 1)
}

/** Execute Ctrl+x — decrement number under/after cursor */
export function executeDecrement(state: EditorState): EditorState {
  return adjustNumber(state, -1)
}

function adjustNumber(state: EditorState, delta: number): EditorState {
  const ls = lines(state.text)
  const line = ls[state.cursor.line]

  // Find number at or after cursor position
  const regex = /-?\d+/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(line)) !== null) {
    const matchEnd = match.index + match[0].length - 1
    if (matchEnd >= state.cursor.col) {
      const num = parseInt(match[0], 10) + delta
      const numStr = String(num)
      const newLine =
        line.slice(0, match.index) + numStr + line.slice(match.index + match[0].length)
      const newLines = [...ls]
      newLines[state.cursor.line] = newLine
      const newText = join(newLines)
      const newCol = match.index + numStr.length - 1
      return pushUndo(state, newText, { line: state.cursor.line, col: newCol }, 'normal', 1)
    }
  }
  return state
}

// ─── Jump list ─────────────────────────────────────────────────────

/** Record current position to jump list before a jump */
export function pushJumpList(state: EditorState): EditorState {
  const jumpList = [...(state.jumpList ?? [])]
  const jumpIndex = state.jumpIndex ?? jumpList.length
  // Truncate forward history
  jumpList.splice(jumpIndex)
  jumpList.push({ ...state.cursor })
  // Limit size to 100 entries
  if (jumpList.length > 100) jumpList.shift()
  return { ...state, jumpList, jumpIndex: jumpList.length }
}

/** Execute Ctrl+o — jump back */
export function executeJumpBack(state: EditorState): EditorState {
  const jumpList = [...(state.jumpList ?? [])]
  if (jumpList.length === 0) return state
  const currentIdx = state.jumpIndex ?? jumpList.length
  // If we're at the end, save current position first so Ctrl+i can return here
  if (currentIdx === jumpList.length) {
    jumpList.push({ ...state.cursor })
  }
  const idx = currentIdx - 1
  if (idx < 0) return state
  const target = jumpList[idx]
  return { ...state, jumpList, cursor: clampCursor(state.text, target, state.mode), jumpIndex: idx }
}

/** Execute Ctrl+i — jump forward */
export function executeJumpForward(state: EditorState): EditorState {
  const jumpList = state.jumpList ?? []
  const currentIdx = state.jumpIndex ?? jumpList.length
  const idx = currentIdx + 1
  if (idx >= jumpList.length) return state
  const target = jumpList[idx]
  return { ...state, cursor: clampCursor(state.text, target, state.mode), jumpIndex: idx }
}

// ─── Replace mode ──────────────────────────────────────────────────

/** Execute R — enter replace mode */
export function executeReplaceMode(state: EditorState): EditorState {
  return { ...state, mode: 'insert', replaceMode: true }
}
