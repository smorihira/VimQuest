/**
 * Command-line mode commands — :s substitute and future : commands.
 */

import type { EditorState } from '../../types/editor'
import { lines, join, pushUndo } from './helpers'

// ─── Types ──────────────────────────────────────────────────────

export interface SubstituteArgs {
  pattern: string
  replacement: string
  global: boolean
  range: 'current' | 'all'
}

// ─── Parsing ────────────────────────────────────────────────────

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Parse a substitute command string.
 * Supports: :s/old/new/[g], :%s/old/new/[g]
 * The delimiter is always '/'.
 * Returns null if the command doesn't match.
 */
export function parseSubstituteCommand(cmd: string): SubstituteArgs | null {
  const match = cmd.match(/^:(%?)s\/(.+?)\/(.*?)\/([g]?)$/)
  if (!match) return null
  return {
    pattern: match[2],
    replacement: match[3],
    global: match[4] === 'g',
    range: match[1] === '%' ? 'all' : 'current',
  }
}

// ─── Execution ──────────────────────────────────────────────────

/**
 * Execute :s substitute on editor state.
 * Returns the same state reference if no match was found (no-op).
 */
export function executeSubstituteCommand(state: EditorState, args: SubstituteArgs): EditorState {
  const ls = lines(state.text)
  const regex = new RegExp(escapeRegExp(args.pattern), args.global ? 'g' : '')

  if (args.range === 'current') {
    const line = ls[state.cursor.line]
    const newLine = line.replace(regex, args.replacement)
    if (newLine === line) return state
    ls[state.cursor.line] = newLine
  } else {
    let changed = false
    for (let i = 0; i < ls.length; i++) {
      const newLine = ls[i].replace(regex, args.replacement)
      if (newLine !== ls[i]) {
        ls[i] = newLine
        changed = true
      }
    }
    if (!changed) return state
  }

  const newText = join(ls)
  const col = Math.min(state.cursor.col, Math.max(0, ls[state.cursor.line].length - 1))
  return pushUndo(state, newText, { line: state.cursor.line, col }, 'normal', 1)
}
