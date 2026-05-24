/**
 * commandExecutor — dispatcher that routes parsed commands to executor modules.
 *
 * Every function takes an EditorState and returns a NEW EditorState.
 * No side effects, no React dependency.
 *
 * The actual command implementations live in ./executors/*.
 */

import type { EditorState } from '../types/editor'
import type { Command } from '../types/command'

import { lines, join, pushUndo, deleteRange } from './executors/helpers'

import { executeMotion } from './executors/motions'

import { executeOperatorMotion, executeOperatorTextObject } from './executors/operators'

import {
  executeInsertBefore,
  executeInsertAfter,
  executeInsertLineStart,
  executeInsertLineEnd,
  executeOpenBelow,
  executeOpenAbove,
  executeEscape,
  executeInsertText,
  executeBackspace,
  finalizeInsertSession,
} from './executors/insertMode'

import {
  executeDeleteChar,
  executeUndo,
  executeRedo,
  executeReplace,
  executeToggleCase,
  executeDeleteLine,
  executeDeleteToEnd,
  executeChangeToEnd,
  executeJoinLines,
  executePaste,
  executePasteBefore,
  executeSubstitute,
  executeSubstituteLine,
  executeIndent,
  executeDedent,
  executeSearch,
  executeSearchNext,
  executeSearchPrev,
  executeSearchWordForward,
  ensureCursorVisible,
  executeHalfPageDown,
  executeHalfPageUp,
  executeViewportZZ,
  executeViewportZT,
  executeViewportZB,
  executeVisualChar,
  executeVisualLine,
} from './executors/normalCommands'

// Re-export for external consumers
export { finalizeInsertSession } from './executors/insertMode'

// ─── Public API ─────────────────────────────────────────────────────

/**
 * Execute a parsed command on the editor state.
 * Returns a new EditorState (never mutates the input).
 */
export function executeCommand(state: EditorState, cmd: Command): EditorState {
  const result = executeCommandInner(state, cmd)
  return ensureCursorVisible(result)
}

function executeCommandInner(state: EditorState, cmd: Command): EditorState {
  if (!cmd.valid) return state

  const raw = cmd.raw

  // ── Escape (always available, free) ──
  if (raw === 'Escape' || raw === 'Esc') return executeEscape(state)

  // ── Insert mode input ──
  if (state.mode === 'insert') {
    if (raw === 'Backspace') return executeBackspace(state)
    return executeInsertText(state, raw)
  }

  // ── Undo/Redo (normal/visual mode only) ──
  if (raw === 'u') return executeUndo(state)
  if (raw === 'Ctrl+R') return executeRedo(state)

  // ── Visual mode ──
  if (state.mode === 'visual') {
    return executeVisualModeCommand(state, cmd, raw)
  }

  // ── Normal mode ──
  return executeNormalModeCommand(state, cmd, raw)
}

function executeVisualModeCommand(state: EditorState, cmd: Command, raw: string): EditorState {
  // Motions extend selection
  if (cmd.motion && !cmd.operator) {
    if (cmd.motion === 'n')
      return {
        ...executeSearchNext(state),
        mode: 'visual',
        visualStart: state.visualStart,
        visualType: state.visualType,
      }
    if (cmd.motion === 'N')
      return {
        ...executeSearchPrev(state),
        mode: 'visual',
        visualStart: state.visualStart,
        visualType: state.visualType,
      }
    const newState = executeMotion(state, cmd)
    return {
      ...newState,
      mode: 'visual',
      visualStart: state.visualStart,
      visualType: state.visualType,
    }
  }

  // d/x — delete visual selection
  if (raw === 'd' || raw === 'x') {
    if (!state.visualStart) return { ...state, mode: 'normal' }

    const startLine = Math.min(state.visualStart.line, state.cursor.line)
    const endLine = Math.max(state.visualStart.line, state.cursor.line)

    // Visual block
    if (state.visualType === 'block') {
      const ls = lines(state.text)
      const startCol = Math.min(state.visualStart.col, state.cursor.col)
      const endCol = Math.max(state.visualStart.col, state.cursor.col)
      const newLines = ls.map((line, i) => {
        if (i >= startLine && i <= endLine) {
          return line.slice(0, startCol) + line.slice(endCol + 1)
        }
        return line
      })
      const newText = join(newLines)
      const result = pushUndo(state, newText, { line: startLine, col: startCol }, 'normal', 1)
      return { ...result, mode: 'normal', visualStart: undefined, visualType: undefined }
    }

    // Visual line
    if (state.visualType === 'line') {
      const ls = lines(state.text)
      const deleted = ls.slice(startLine, endLine + 1).join('\n') + '\n'
      const newLines = [...ls.slice(0, startLine), ...ls.slice(endLine + 1)]
      if (newLines.length === 0) newLines.push('')
      const newText = join(newLines)
      const newLine = Math.min(startLine, newLines.length - 1)
      const result = pushUndo(state, newText, { line: newLine, col: 0 }, 'normal', 1)
      return {
        ...result,
        mode: 'normal',
        visualStart: undefined,
        visualType: undefined,
        registers: { ...result.registers, '': deleted },
      }
    }

    // Visual char
    const {
      text: newText,
      cursor: newCursor,
      deleted,
    } = deleteRange(state.text, state.visualStart, state.cursor, true)
    const result = pushUndo(state, newText, newCursor, 'normal', 1)
    return {
      ...result,
      mode: 'normal',
      visualStart: undefined,
      visualType: undefined,
      registers: { ...result.registers, '': deleted },
    }
  }

  // y — yank visual selection
  if (raw === 'y') {
    if (!state.visualStart) return { ...state, mode: 'normal' }
    const ls = lines(state.text)

    if (state.visualType === 'line') {
      const startLine = Math.min(state.visualStart.line, state.cursor.line)
      const endLine = Math.max(state.visualStart.line, state.cursor.line)
      const yanked = ls.slice(startLine, endLine + 1).join('\n') + '\n'
      return {
        ...state,
        mode: 'normal',
        visualStart: undefined,
        visualType: undefined,
        cursor: { line: startLine, col: 0 },
        registers: { ...state.registers, '': yanked },
      }
    }

    let fromOffset = 0
    for (let i = 0; i < state.visualStart.line; i++) fromOffset += ls[i].length + 1
    fromOffset += state.visualStart.col
    let toOffset = 0
    for (let i = 0; i < state.cursor.line; i++) toOffset += ls[i].length + 1
    toOffset += state.cursor.col
    if (fromOffset > toOffset) [fromOffset, toOffset] = [toOffset, fromOffset]
    const yanked = state.text.slice(fromOffset, toOffset + 1)
    return {
      ...state,
      mode: 'normal',
      visualStart: undefined,
      visualType: undefined,
      registers: { ...state.registers, '': yanked },
    }
  }

  // c — change visual selection
  if (raw === 'c') {
    if (!state.visualStart) return { ...state, mode: 'normal' }

    const startLine = Math.min(state.visualStart.line, state.cursor.line)
    const endLine = Math.max(state.visualStart.line, state.cursor.line)

    if (state.visualType === 'line') {
      const ls = lines(state.text)
      const deleted = ls.slice(startLine, endLine + 1).join('\n') + '\n'
      const newLines = [...ls.slice(0, startLine), '', ...ls.slice(endLine + 1)]
      const newText = join(newLines)
      const result = pushUndo(state, newText, { line: startLine, col: 0 }, 'insert', 1)
      return {
        ...result,
        mode: 'insert',
        visualStart: undefined,
        visualType: undefined,
        registers: { ...result.registers, '': deleted },
      }
    }

    const {
      text: newText,
      cursor: newCursor,
      deleted,
    } = deleteRange(state.text, state.visualStart, state.cursor, true)
    const result = pushUndo(state, newText, newCursor, 'insert', 1)
    return {
      ...result,
      mode: 'insert',
      visualStart: undefined,
      visualType: undefined,
      registers: { ...result.registers, '': deleted },
    }
  }

  // > / < — indent/dedent visual selection
  if (raw === '>' || raw === '<') {
    if (!state.visualStart) return { ...state, mode: 'normal' }
    const startLine = Math.min(state.visualStart.line, state.cursor.line)
    const endLine = Math.max(state.visualStart.line, state.cursor.line)
    const ls = lines(state.text)
    const newLines = ls.map((line, i) => {
      if (i >= startLine && i <= endLine) {
        if (raw === '>') return '  ' + line
        return line.replace(/^ {1,2}/, '')
      }
      return line
    })
    const newText = join(newLines)
    const result = pushUndo(state, newText, { line: startLine, col: 0 }, 'normal', 1)
    return { ...result, mode: 'normal', visualStart: undefined, visualType: undefined }
  }

  // v/V — toggle or switch visual mode
  if (raw === 'v') {
    if (state.visualType === 'char') {
      return { ...state, mode: 'normal', visualStart: undefined, visualType: undefined }
    }
    return { ...state, visualType: 'char' }
  }
  if (raw === 'V') {
    if (state.visualType === 'line') {
      return { ...state, mode: 'normal', visualStart: undefined, visualType: undefined }
    }
    const ls = lines(state.text)
    return {
      ...state,
      visualType: 'line',
      visualStart: { line: state.visualStart!.line, col: 0 },
      cursor: {
        line: state.cursor.line,
        col: Math.max(0, ls[state.cursor.line].length - 1),
      },
    }
  }

  return state
}

function executeNormalModeCommand(state: EditorState, cmd: Command, raw: string): EditorState {
  // Enter insert mode
  if (raw === 'i') return executeInsertBefore(state)
  if (raw === 'a') return executeInsertAfter(state)
  if (raw === 'I') return executeInsertLineStart(state)
  if (raw === 'A') return executeInsertLineEnd(state)
  if (raw === 'o') return executeOpenBelow(state)
  if (raw === 'O') return executeOpenAbove(state)

  // Toggle case
  if (raw === '~') return executeToggleCase(state)

  // Replace character (r + char)
  if (cmd.char !== undefined && raw.startsWith('r')) {
    return executeReplace(state, cmd.char)
  }

  // Delete character
  if (raw === 'x') return executeDeleteChar(state, cmd)

  // Delete line (dd)
  if (cmd.operator === 'd' && !cmd.motion && !cmd.textObject && raw.includes('dd')) {
    return executeDeleteLine(state, cmd.count ?? 1)
  }

  // Change line (cc)
  if (cmd.operator === 'c' && !cmd.motion && !cmd.textObject && raw.includes('cc')) {
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

  // Yank line (yy)
  if (cmd.operator === 'y' && !cmd.motion && !cmd.textObject && raw.includes('yy')) {
    const ls = lines(state.text)
    const line = ls[state.cursor.line]
    return { ...state, registers: { ...state.registers, '': line + '\n' } }
  }

  // >> (indent)
  if (cmd.operator === '>' && raw.includes('>>')) {
    return executeIndent(state, cmd.count ?? 1)
  }

  // << (dedent)
  if (cmd.operator === '<' && raw.includes('<<')) {
    return executeDedent(state, cmd.count ?? 1)
  }

  // D — delete to end of line
  if (raw === 'D') return executeDeleteToEnd(state)

  // C — change to end of line
  if (raw === 'C') return executeChangeToEnd(state)

  // Y — yank line
  if (raw === 'Y') {
    const ls = lines(state.text)
    return { ...state, registers: { ...state.registers, '': ls[state.cursor.line] + '\n' } }
  }

  // J — join lines
  if (raw === 'J') return executeJoinLines(state)

  // p — paste after
  if (raw === 'p' || (cmd.register && raw.endsWith('p'))) {
    const reg = cmd.register ?? ''
    return executePaste(state, reg)
  }

  // P — paste before
  if (raw === 'P' || (cmd.register && raw.endsWith('P'))) {
    const reg = cmd.register ?? ''
    return executePasteBefore(state, reg)
  }

  // s — substitute character
  if (raw === 's') return executeSubstitute(state)

  // S — substitute line
  if (raw === 'S') return executeSubstituteLine(state)

  // . — dot repeat
  if (raw === '.') {
    if (state.lastCommand) {
      let result = executeCommand(state, state.lastCommand)
      if (result.mode === 'insert' && state.lastInsertText) {
        const entryState = { ...result }
        let charCount = 0
        for (const ch of state.lastInsertText) {
          if (ch === '\n') {
            result = executeInsertText(result, 'Enter')
          } else {
            result = executeInsertText(result, ch)
          }
          charCount++
        }
        result = finalizeInsertSession(result, entryState, charCount)
        result = executeEscape(result)
        result = {
          ...result,
          lastCommand: state.lastCommand,
          lastInsertText: state.lastInsertText,
        }
      }
      return result
    }
    return state
  }

  // v — visual character mode
  if (raw === 'v') return executeVisualChar(state)

  // V — visual line mode
  if (raw === 'V') return executeVisualLine(state)

  // Ctrl+v — visual block mode
  if (raw === 'Ctrl+v')
    return { ...state, mode: 'visual', visualStart: { ...state.cursor }, visualType: 'block' }

  // Ctrl+d — half page down
  if (raw === 'Ctrl+d') return executeHalfPageDown(state)

  // Ctrl+u — half page up
  if (raw === 'Ctrl+u') return executeHalfPageUp(state)

  // zz, zt, zb — viewport scroll
  if (raw === 'zz') return executeViewportZZ(state)
  if (raw === 'zt') return executeViewportZT(state)
  if (raw === 'zb') return executeViewportZB(state)

  // Search
  if (cmd.searchPattern !== undefined) return executeSearch(state, cmd.searchPattern)

  // Operator + text object
  if (cmd.operator && cmd.textObject) {
    return executeOperatorTextObject(state, cmd)
  }

  // Operator + motion
  if (cmd.operator && cmd.motion) {
    return executeOperatorMotion(state, cmd)
  }

  // Pure motions
  if (cmd.motion && !cmd.operator) {
    if (cmd.motion === 'n') return executeSearchNext(state)
    if (cmd.motion === 'N') return executeSearchPrev(state)
    if (cmd.motion === '*') return executeSearchWordForward(state)
    return executeMotion(state, cmd)
  }

  return state
}
