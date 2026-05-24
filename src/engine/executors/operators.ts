/**
 * Operator commands — d/c/y + motion, d/c/y + text object, case change (gu/gU).
 */

import type { EditorState, VimMode } from '../../types/editor'
import type { Command, TextObject } from '../../types/command'
import {
  lines,
  join,
  clampCursor,
  pushUndo,
  deleteRange,
  offsetToPos,
  isWordChar,
  isSpace,
} from './helpers'
import { resolveMotion, isMotionInclusive } from './motions'

/** Indent lines (used by > operator) */
function executeIndentLines(state: EditorState, count: number): EditorState {
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

/** Dedent lines (used by < operator) */
function executeDedentLines(state: EditorState, count: number): EditorState {
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

/** Execute operator + motion (e.g., dw, de, db, cw, yw) */
export function executeOperatorMotion(state: EditorState, cmd: Command): EditorState {
  const count = cmd.count ?? 1
  const motion = cmd.motion!
  const operator = cmd.operator!

  const target = resolveMotion(state, motion, count, cmd.char, cmd.count)
  if (!target) return state

  // Store last f/F/t/T for ; and , repeat
  if ((motion === 'f' || motion === 'F' || motion === 't' || motion === 'T') && cmd.char) {
    state = {
      ...state,
      lastFindMotion: { motion: motion as 'f' | 'F' | 't' | 'T', char: cmd.char },
    }
  }

  if (operator === 'd') {
    const inclusive = isMotionInclusive(motion)
    const {
      text: newText,
      cursor: newCursor,
      deleted,
    } = deleteRange(state.text, state.cursor, target, inclusive)

    const result = pushUndo(state, newText, newCursor, 'normal', 1)
    return { ...result, registers: { ...result.registers, '': deleted } }
  }

  if (operator === 'c') {
    const inclusive = isMotionInclusive(motion)
    const {
      text: newText,
      cursor: newCursor,
      deleted,
    } = deleteRange(state.text, state.cursor, target, inclusive)
    return {
      ...state,
      text: newText,
      cursor: newCursor,
      mode: 'insert',
      registers: { ...state.registers, '': deleted },
    }
  }

  if (operator === 'y') {
    const inclusive = isMotionInclusive(motion)
    const ls = lines(state.text)
    let fromOffset = 0
    for (let i = 0; i < state.cursor.line; i++) fromOffset += ls[i].length + 1
    fromOffset += state.cursor.col
    let toOffset = 0
    for (let i = 0; i < target.line; i++) toOffset += ls[i].length + 1
    toOffset += target.col
    if (fromOffset > toOffset) [fromOffset, toOffset] = [toOffset, fromOffset]
    if (inclusive) toOffset++
    const yanked = state.text.slice(fromOffset, toOffset)
    return { ...state, registers: { ...state.registers, '': yanked } }
  }

  if (operator === 'gu' || operator === 'gU') {
    return executeCaseChange(state, cmd, operator === 'gU')
  }

  if (operator === '>') {
    return executeIndentLines(state, cmd.count ?? 1)
  }

  if (operator === '<') {
    return executeDedentLines(state, cmd.count ?? 1)
  }

  return state
}

/** Resolve a text object to a range [from, to] (inclusive on both ends) */
export function resolveTextObject(
  state: EditorState,
  textObj: TextObject,
): { from: number; to: number } | null {
  const flat = state.text
  const ls = lines(flat)

  let curOffset = 0
  for (let i = 0; i < state.cursor.line; i++) curOffset += ls[i].length + 1
  curOffset += state.cursor.col

  switch (textObj) {
    case 'iw': {
      if (curOffset >= flat.length) return null
      const ch = flat[curOffset]
      const isW = isWordChar(ch)
      const isSp = isSpace(ch)
      const predicate = isW
        ? isWordChar
        : isSp
          ? isSpace
          : (c: string) => !isWordChar(c) && !isSpace(c)
      let from = curOffset
      let to = curOffset
      while (from > 0 && predicate(flat[from - 1])) from--
      while (to < flat.length - 1 && predicate(flat[to + 1])) to++
      return { from, to }
    }
    case 'aw': {
      const inner = resolveTextObject(state, 'iw')
      if (!inner) return null
      let { from, to } = inner
      if (to + 1 < flat.length && isSpace(flat[to + 1])) {
        while (to + 1 < flat.length && isSpace(flat[to + 1]) && flat[to + 1] !== '\n') to++
      } else if (from > 0 && isSpace(flat[from - 1])) {
        while (from > 0 && isSpace(flat[from - 1]) && flat[from - 1] !== '\n') from--
      }
      return { from, to }
    }
    case 'i"':
    case "i'":
    case 'i(':
    case 'i)':
    case 'i{':
    case 'i}':
    case 'i[':
    case 'i]':
    case 'i<':
    case 'i>': {
      const delim = textObj[1]
      return findInsideDelimiters(flat, curOffset, delim)
    }
    case 'a"':
    case "a'":
    case 'a(':
    case 'a)':
    case 'a{':
    case 'a}':
    case 'a[':
    case 'a]':
    case 'a<':
    case 'a>': {
      const delim = textObj[1]
      const inner = findInsideDelimiters(flat, curOffset, delim)
      if (!inner) return null
      return { from: inner.from - 1, to: inner.to + 1 }
    }
    default:
      return null
  }
}

/** Find inside delimiter pair */
function findInsideDelimiters(
  flat: string,
  curOffset: number,
  delim: string,
): { from: number; to: number } | null {
  const PAIRS: Record<string, [string, string]> = {
    '(': ['(', ')'],
    ')': ['(', ')'],
    '{': ['{', '}'],
    '}': ['{', '}'],
    '[': ['[', ']'],
    ']': ['[', ']'],
    '<': ['<', '>'],
    '>': ['<', '>'],
  }

  if (delim === '"' || delim === "'") {
    let start = -1
    let end = -1

    for (let i = curOffset; i >= 0; i--) {
      if (flat[i] === delim) {
        start = i
        break
      }
    }

    if (start === -1) {
      let lineStart = curOffset
      while (lineStart > 0 && flat[lineStart - 1] !== '\n') lineStart--
      let lineEnd = curOffset
      while (lineEnd < flat.length && flat[lineEnd] !== '\n') lineEnd++

      for (let i = curOffset + 1; i < lineEnd; i++) {
        if (flat[i] === delim) {
          start = i
          for (let j = i + 1; j < lineEnd; j++) {
            if (flat[j] === delim) {
              end = j
              break
            }
          }
          break
        }
      }
      if (start === -1 || end === -1 || start >= end) return null
      if (start + 1 > end - 1) return { from: start + 1, to: start }
      return { from: start + 1, to: end - 1 }
    }

    if (start === curOffset) {
      for (let i = start + 1; i < flat.length; i++) {
        if (flat[i] === delim) {
          end = i
          break
        }
      }
      if (end === -1) {
        for (let i = start - 1; i >= 0; i--) {
          if (flat[i] === delim) {
            start = i
            end = curOffset
            break
          }
        }
      }
    } else {
      for (let i = start + 1; i < flat.length; i++) {
        if (flat[i] === delim) {
          end = i
          break
        }
      }
    }

    if (start === -1 || end === -1 || start >= end) return null
    if (start + 1 > end - 1) return { from: start + 1, to: start }
    return { from: start + 1, to: end - 1 }
  }

  const pair = PAIRS[delim]
  if (!pair) return null
  const [open, close] = pair

  let depth = 0
  let start = -1
  for (let i = curOffset; i >= 0; i--) {
    if (flat[i] === close && i !== curOffset) depth++
    if (flat[i] === open) {
      if (depth === 0) {
        start = i
        break
      }
      depth--
    }
  }
  if (start === -1) return null

  depth = 0
  let end = -1
  for (let i = start + 1; i < flat.length; i++) {
    if (flat[i] === open) depth++
    if (flat[i] === close) {
      if (depth === 0) {
        end = i
        break
      }
      depth--
    }
  }
  if (end === -1) return null

  if (start + 1 > end - 1) return { from: start + 1, to: start }
  return { from: start + 1, to: end - 1 }
}

/** Execute case change via gu/gU + text object or motion */
export function executeCaseChange(state: EditorState, cmd: Command, toUpper: boolean): EditorState {
  let from: number, to: number

  if (cmd.textObject) {
    const range = resolveTextObject(state, cmd.textObject)
    if (!range) return state
    from = range.from
    to = range.to
  } else if (cmd.motion) {
    const count = cmd.count ?? 1
    const target = resolveMotion(state, cmd.motion, count, cmd.char, cmd.count)
    if (!target) return state
    const ls = lines(state.text)
    let fromOffset = 0
    for (let i = 0; i < state.cursor.line; i++) fromOffset += ls[i].length + 1
    fromOffset += state.cursor.col
    let toOffset = 0
    for (let i = 0; i < target.line; i++) toOffset += ls[i].length + 1
    toOffset += target.col
    from = Math.min(fromOffset, toOffset)
    to = Math.max(fromOffset, toOffset)
  } else {
    return state
  }

  const flat = state.text
  const before = flat.slice(0, from)
  const middle = flat.slice(from, to + 1)
  const after = flat.slice(to + 1)
  const changed = toUpper ? middle.toUpperCase() : middle.toLowerCase()
  const newText = before + changed + after
  return pushUndo(state, newText, state.cursor, 'normal', 1)
}

/** Execute operator + text object (diw, ci", etc.) */
export function executeOperatorTextObject(state: EditorState, cmd: Command): EditorState {
  const operator = cmd.operator!
  const textObj = cmd.textObject!
  const range = resolveTextObject(state, textObj)
  if (!range) return state

  const flat = state.text
  const { from, to } = range

  if (from > to) {
    if (operator === 'c') {
      return { ...state, mode: 'insert' }
    }
    return state
  }

  const deleted = flat.slice(from, to + 1)
  const newText = flat.slice(0, from) + flat.slice(to + 1)
  const newCursor = offsetToPos(newText, Math.min(from, newText.length - 1))

  if (operator === 'd') {
    const result = pushUndo(state, newText, clampCursor(newText, newCursor, 'normal'), 'normal', 1)
    return { ...result, registers: { ...result.registers, '': deleted } }
  }

  if (operator === 'c') {
    const cCursor = offsetToPos(newText, Math.min(from, newText.length))
    return {
      ...state,
      text: newText,
      cursor: clampCursor(newText, cCursor, 'insert'),
      mode: 'insert' as VimMode,
      registers: { ...state.registers, '': deleted },
    }
  }

  if (operator === 'y') {
    const reg = cmd.register ?? ''
    return { ...state, registers: { ...state.registers, [reg]: deleted } }
  }

  if (operator === 'gu' || operator === 'gU') {
    return executeCaseChange(state, cmd, operator === 'gU')
  }

  return state
}
