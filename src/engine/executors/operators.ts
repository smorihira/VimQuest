/**
 * Operator commands — d/c/y + motion, d/c/y + text object, case change (gu/gU),
 * indent/dedent (>/<).
 *
 * All operators share `applyOperator(state, operator, range)`:
 *   1. Resolve target range (doubled → line, motion → cursor-to-target, textobj → delimiters)
 *   2. Apply the operator to that range
 */

import type { EditorState } from '../../types/editor'
import type { Command, TextObject } from '../../types/command'
import { lines, join, clampCursor, pushUndo, offsetToPos, isWordChar, isSpace } from './helpers'
import { resolveMotion, isMotionInclusive } from './motions'

// ─── Operator Range ────────────────────────────────────────────────

export interface OperatorRange {
  from: number // start character offset (inclusive)
  to: number // end character offset (inclusive)
  linewise: boolean
}

function posToOffset(text: string, pos: { line: number; col: number }): number {
  const ls = lines(text)
  let offset = 0
  for (let i = 0; i < pos.line; i++) offset += ls[i].length + 1
  offset += pos.col
  return offset
}

/** Resolve the range for a doubled operator (current line) */
export function resolveLineRange(state: EditorState): OperatorRange {
  const ls = lines(state.text)
  const line = state.cursor.line
  let from = 0
  for (let i = 0; i < line; i++) from += ls[i].length + 1
  return { from, to: from + ls[line].length - 1, linewise: true }
}

// ─── Case change helper ───────────────────────────────────────────

function applyCaseChangeRange(
  state: EditorState,
  from: number,
  to: number,
  operator: string,
): EditorState {
  if (from > to) return state
  const flat = state.text
  const before = flat.slice(0, from)
  const middle = flat.slice(from, to + 1)
  const after = flat.slice(to + 1)
  const changed =
    operator === 'gU'
      ? middle.toUpperCase()
      : operator === 'gu'
        ? middle.toLowerCase()
        : middle
            .split('')
            .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
            .join('')
  const newText = before + changed + after
  return pushUndo(state, newText, state.cursor, 'normal', 1)
}

// ─── Unified operator application ─────────────────────────────────

/** Apply an operator to a resolved range */
export function applyOperator(
  state: EditorState,
  operator: string,
  range: OperatorRange,
  register: string = '',
): EditorState {
  const { from, to, linewise } = range
  const flat = state.text
  const ls = lines(flat)

  if (linewise) {
    const fromLine = offsetToPos(flat, from).line
    const toLine = from > to ? fromLine : offsetToPos(flat, to).line

    switch (operator) {
      case 'd': {
        const deleted = ls.slice(fromLine, toLine + 1).join('\n') + '\n'
        const newLines = [...ls.slice(0, fromLine), ...ls.slice(toLine + 1)]
        if (newLines.length === 0) newLines.push('')
        const newText = join(newLines)
        const newLine = Math.min(fromLine, newLines.length - 1)
        let col = 0
        while (col < newLines[newLine].length && isSpace(newLines[newLine][col])) col++
        const newCursor = {
          line: newLine,
          col: Math.min(col, Math.max(0, newLines[newLine].length - 1)),
        }
        const result = pushUndo(state, newText, newCursor, 'normal', 1)
        return { ...result, registers: { ...result.registers, [register]: deleted } }
      }
      case 'c': {
        const line = ls[fromLine]
        const indent = line.match(/^(\s*)/)?.[1] ?? ''
        const newLines = [...ls]
        newLines[fromLine] = indent
        if (toLine > fromLine) {
          newLines.splice(fromLine + 1, toLine - fromLine)
        }
        const newText = join(newLines)
        return {
          ...state,
          text: newText,
          cursor: { line: fromLine, col: indent.length },
          mode: 'insert',
          registers: { ...state.registers, [register]: line },
        }
      }
      case 'y': {
        const yanked = ls.slice(fromLine, toLine + 1).join('\n') + '\n'
        return { ...state, registers: { ...state.registers, [register]: yanked } }
      }
      case '>': {
        const newLines = [...ls]
        for (let i = fromLine; i <= toLine && i < ls.length; i++) {
          newLines[i] = '  ' + newLines[i]
        }
        const newText = join(newLines)
        const resultLine = newLines[state.cursor.line]
        let col = 0
        while (col < resultLine.length && isSpace(resultLine[col])) col++
        return pushUndo(state, newText, { line: state.cursor.line, col }, 'normal', 1)
      }
      case '<': {
        const newLines = [...ls]
        for (let i = fromLine; i <= toLine && i < ls.length; i++) {
          const l = newLines[i]
          if (l.startsWith('  ')) newLines[i] = l.slice(2)
          else if (l.startsWith(' ')) newLines[i] = l.slice(1)
          else if (l.startsWith('\t')) newLines[i] = l.slice(1)
        }
        const newText = join(newLines)
        const resultLine = newLines[state.cursor.line]
        let col = 0
        while (col < resultLine.length && isSpace(resultLine[col])) col++
        return pushUndo(state, newText, { line: state.cursor.line, col }, 'normal', 1)
      }
      case 'gu':
      case 'gU':
      case 'g~': {
        let lineFrom = 0
        for (let i = 0; i < fromLine; i++) lineFrom += ls[i].length + 1
        let lineTo = lineFrom
        for (let i = fromLine; i <= toLine; i++) lineTo += ls[i].length + 1
        lineTo -= 2
        return applyCaseChangeRange(state, lineFrom, Math.max(lineFrom, lineTo), operator)
      }
    }
    return state
  }

  // ─── Charwise ──────────────────────────────────────────────────

  if (from > to) {
    if (operator === 'c') return { ...state, mode: 'insert' }
    return state
  }

  switch (operator) {
    case 'd': {
      const deleted = flat.slice(from, to + 1)
      const newText = flat.slice(0, from) + flat.slice(to + 1)
      const newCursor = offsetToPos(newText, Math.min(from, newText.length - 1))
      const result = pushUndo(
        state,
        newText,
        clampCursor(newText, newCursor, 'normal'),
        'normal',
        1,
      )
      return { ...result, registers: { ...result.registers, [register]: deleted } }
    }
    case 'c': {
      const deleted = flat.slice(from, to + 1)
      const newText = flat.slice(0, from) + flat.slice(to + 1)
      const cCursor = offsetToPos(newText, Math.min(from, newText.length))
      return {
        ...state,
        text: newText,
        cursor: clampCursor(newText, cCursor, 'insert'),
        mode: 'insert',
        registers: { ...state.registers, [register]: deleted },
      }
    }
    case 'y': {
      const yanked = flat.slice(from, to + 1)
      return { ...state, registers: { ...state.registers, [register]: yanked } }
    }
    case '>': {
      const fromLine = offsetToPos(flat, from).line
      const toLine = offsetToPos(flat, to).line
      const newLines = [...ls]
      for (let i = fromLine; i <= toLine && i < ls.length; i++) {
        newLines[i] = '  ' + newLines[i]
      }
      const newText = join(newLines)
      const resultLine = newLines[state.cursor.line]
      let col = 0
      while (col < resultLine.length && isSpace(resultLine[col])) col++
      return pushUndo(state, newText, { line: state.cursor.line, col }, 'normal', 1)
    }
    case '<': {
      const fromLine = offsetToPos(flat, from).line
      const toLine = offsetToPos(flat, to).line
      const newLines = [...ls]
      for (let i = fromLine; i <= toLine && i < ls.length; i++) {
        const l = newLines[i]
        if (l.startsWith('  ')) newLines[i] = l.slice(2)
        else if (l.startsWith(' ')) newLines[i] = l.slice(1)
        else if (l.startsWith('\t')) newLines[i] = l.slice(1)
      }
      const newText = join(newLines)
      const resultLine = newLines[state.cursor.line]
      let col = 0
      while (col < resultLine.length && isSpace(resultLine[col])) col++
      return pushUndo(state, newText, { line: state.cursor.line, col }, 'normal', 1)
    }
    case 'gu':
    case 'gU':
    case 'g~': {
      return applyCaseChangeRange(state, from, to, operator)
    }
  }

  return state
}

// ─── Operator + Motion ────────────────────────────────────────────

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

  let fromOffset = posToOffset(state.text, state.cursor)
  let toOffset = posToOffset(state.text, target)
  if (fromOffset > toOffset) [fromOffset, toOffset] = [toOffset, fromOffset]
  const inclusive = isMotionInclusive(motion)
  const to = inclusive ? toOffset : Math.max(fromOffset, toOffset - 1)

  return applyOperator(state, operator, { from: fromOffset, to, linewise: false }, cmd.register)
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
    case 'ip': {
      // Paragraph = contiguous non-blank lines containing cursor
      const currentLine = state.cursor.line
      if (ls[currentLine].trim() === '') {
        // On a blank line: select contiguous blank lines
        let from = currentLine
        let to = currentLine
        while (from > 0 && ls[from - 1].trim() === '') from--
        while (to < ls.length - 1 && ls[to + 1].trim() === '') to++
        let fromOffset = 0
        for (let i = 0; i < from; i++) fromOffset += ls[i].length + 1
        let toOffset = 0
        for (let i = 0; i <= to; i++) toOffset += ls[i].length + 1
        return { from: fromOffset, to: toOffset - 2 }
      }
      let fromLine = currentLine
      let toLine = currentLine
      while (fromLine > 0 && ls[fromLine - 1].trim() !== '') fromLine--
      while (toLine < ls.length - 1 && ls[toLine + 1].trim() !== '') toLine++
      let fromOffset = 0
      for (let i = 0; i < fromLine; i++) fromOffset += ls[i].length + 1
      let toOffset = 0
      for (let i = 0; i <= toLine; i++) toOffset += ls[i].length + 1
      return { from: fromOffset, to: toOffset - 2 }
    }
    case 'ap': {
      const inner = resolveTextObject(state, 'ip')
      if (!inner) return null
      let { from, to } = inner
      // Include trailing blank lines
      let lineAfter = 0
      let offset = to + 1
      for (let i = 0; i < ls.length; i++) {
        if (offset <= 0) {
          lineAfter = i
          break
        }
        offset -= ls[i].length + 1
      }
      // Recalculate lineAfter properly
      let accumulated = 0
      for (let i = 0; i < ls.length; i++) {
        accumulated += ls[i].length + 1
        if (accumulated > to + 1) {
          lineAfter = i + 1
          break
        }
      }
      if (lineAfter < ls.length && ls[lineAfter].trim() === '') {
        let endLine = lineAfter
        while (endLine < ls.length - 1 && ls[endLine + 1].trim() === '') endLine++
        let endOffset = 0
        for (let i = 0; i <= endLine; i++) endOffset += ls[i].length + 1
        to = endOffset - 2
      } else if (from > 0) {
        // Include leading blank lines
        let startLine = 0
        accumulated = 0
        for (let i = 0; i < ls.length; i++) {
          if (accumulated >= from) {
            startLine = i
            break
          }
          accumulated += ls[i].length + 1
        }
        if (startLine > 0 && ls[startLine - 1].trim() === '') {
          let bl = startLine - 1
          while (bl > 0 && ls[bl - 1].trim() === '') bl--
          let newFrom = 0
          for (let i = 0; i < bl; i++) newFrom += ls[i].length + 1
          from = newFrom
        }
      }
      return { from, to }
    }
    case 'is': {
      // Sentence: delimited by .!? followed by space/newline/EOT
      const text = flat
      // Find sentence containing cursor
      const sentenceEnd = /[.!?][\s]/g
      const boundaries = [0] // start of text is a sentence boundary
      let m: RegExpExecArray | null
      while ((m = sentenceEnd.exec(text)) !== null) {
        // The next sentence starts after the whitespace
        let nextStart = m.index + m[0].length
        while (nextStart < text.length && (text[nextStart] === ' ' || text[nextStart] === '\t'))
          nextStart++
        boundaries.push(nextStart)
      }
      boundaries.push(text.length)

      let from = 0
      let to = text.length - 1
      for (let i = 0; i < boundaries.length - 1; i++) {
        if (curOffset >= boundaries[i] && curOffset < boundaries[i + 1]) {
          from = boundaries[i]
          to = boundaries[i + 1] - 1
          break
        }
      }
      return { from, to }
    }
    case 'as': {
      const inner = resolveTextObject(state, 'is')
      if (!inner) return null
      const { from } = inner
      let { to } = inner
      // Include trailing whitespace
      while (to + 1 < flat.length && (flat[to + 1] === ' ' || flat[to + 1] === '\t')) to++
      return { from, to }
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

/** Execute operator + text object (diw, ci", etc.) */
export function executeOperatorTextObject(state: EditorState, cmd: Command): EditorState {
  const operator = cmd.operator!
  const textObj = cmd.textObject!
  const range = resolveTextObject(state, textObj)
  if (!range) return state

  return applyOperator(
    state,
    operator,
    { from: range.from, to: range.to, linewise: false },
    cmd.register,
  )
}
