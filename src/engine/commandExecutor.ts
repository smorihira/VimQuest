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
  executeDeleteCharBefore,
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
  executeSearchWordBackward,
  executeSearchBackward,
  ensureCursorVisible,
  executeHalfPageDown,
  executeHalfPageUp,
  executeFullPageDown,
  executeFullPageUp,
  executeViewportZZ,
  executeViewportZT,
  executeViewportZB,
  executeVisualChar,
  executeVisualLine,
  executeScrollDown1,
  executeScrollUp1,
  executeIncrement,
  executeDecrement,
  pushJumpList,
  executeJumpBack,
  executeJumpForward,
  executeReplaceMode,
  executeGn,
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
    const result = executeVisualModeCommand(state, cmd, raw)
    // Save last visual selection when leaving visual mode
    if (result.mode !== 'visual' && state.visualStart) {
      return {
        ...result,
        lastVisualStart: state.visualStart,
        lastVisualEnd: state.cursor,
        lastVisualType: state.visualType,
      }
    }
    return result
  }

  // ── Normal mode ──
  return executeNormalModeCommand(state, cmd, raw)
}

function executeVisualModeCommand(state: EditorState, cmd: Command, raw: string): EditorState {
  // Motions extend selection
  if (cmd.motion && !cmd.operator) {
    if (cmd.motion === 'gn') {
      // In visual mode, gn extends selection to end of next match
      const result = executeGn(state)
      if (result.mode === 'visual') {
        return { ...result, visualStart: state.visualStart }
      }
      return state
    }
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

    // Visual block
    if (state.visualType === 'block') {
      const startLine = Math.min(state.visualStart.line, state.cursor.line)
      const endLine = Math.max(state.visualStart.line, state.cursor.line)
      const startCol = Math.min(state.visualStart.col, state.cursor.col)
      const endCol = Math.max(state.visualStart.col, state.cursor.col)
      const yanked = ls
        .slice(startLine, endLine + 1)
        .map((line) => line.slice(startCol, endCol + 1))
        .join('\n')
      return {
        ...state,
        mode: 'normal',
        visualStart: undefined,
        visualType: undefined,
        cursor: { line: startLine, col: startCol },
        registers: { ...state.registers, '': yanked },
      }
    }

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

    // Visual block — delete block region, enter insert
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
      const result = pushUndo(state, newText, { line: startLine, col: startCol }, 'insert', 1)
      return { ...result, mode: 'insert', visualStart: undefined, visualType: undefined }
    }

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

  // o — swap cursor and visualStart (toggle selection end)
  if (raw === 'o') {
    if (!state.visualStart) return state
    return {
      ...state,
      cursor: state.visualStart,
      visualStart: state.cursor,
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

  // Delete character before cursor (X)
  if (raw === 'X') return executeDeleteCharBefore(state)

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

  // m{a-zA-Z} — set mark
  if (raw.length === 2 && raw[0] === 'm') {
    const markName = raw[1]
    return {
      ...state,
      marks: { ...state.marks, [markName]: { ...state.cursor } },
    }
  }

  // S — substitute line
  if (raw === 'S') return executeSubstituteLine(state)

  // . — dot repeat
  if (raw === '.') {
    if (state.lastCommand) {
      // Capture state before replay for undo (covers both deletion + insert)
      const preReplayState = state
      let result = executeCommand(state, state.lastCommand)
      if (result.mode === 'insert' && state.lastInsertText) {
        let charCount = 0
        for (const ch of state.lastInsertText) {
          if (ch === '\n') {
            result = executeInsertText(result, 'Enter')
          } else {
            result = executeInsertText(result, ch)
          }
          charCount++
        }
        result = finalizeInsertSession(result, preReplayState, charCount)
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

  // Ctrl+f — full page down
  if (raw === 'Ctrl+f') return executeFullPageDown(state)

  // Ctrl+b — full page up
  if (raw === 'Ctrl+b') return executeFullPageUp(state)

  // Ctrl+e — scroll down 1 line
  if (raw === 'Ctrl+e') return executeScrollDown1(state)

  // Ctrl+y — scroll up 1 line
  if (raw === 'Ctrl+y') return executeScrollUp1(state)

  // Ctrl+a — increment number
  if (raw === 'Ctrl+a') return executeIncrement(state)

  // Ctrl+x — decrement number
  if (raw === 'Ctrl+x') return executeDecrement(state)

  // Ctrl+o — jump back
  if (raw === 'Ctrl+o') return executeJumpBack(state)

  // Ctrl+i — jump forward
  if (raw === 'Ctrl+i') return executeJumpForward(state)

  // R — replace mode
  if (raw === 'R') return executeReplaceMode(state)

  // gi — go to last insert position
  if (raw === 'gi') {
    if (state.lastInsertPosition) {
      const cursor = {
        line: Math.min(state.lastInsertPosition.line, lines(state.text).length - 1),
        col: state.lastInsertPosition.col,
      }
      return { ...state, cursor, mode: 'insert' }
    }
    return { ...state, mode: 'insert' }
  }

  // gv — reselect last visual selection
  if (raw === 'gv') {
    if (state.lastVisualStart && state.lastVisualEnd && state.lastVisualType) {
      return {
        ...state,
        mode: 'visual',
        visualStart: state.lastVisualStart,
        cursor: state.lastVisualEnd,
        visualType: state.lastVisualType,
      }
    }
    return state
  }

  // zz, zt, zb — viewport scroll
  if (raw === 'zz') return executeViewportZZ(state)
  if (raw === 'zt') return executeViewportZT(state)
  if (raw === 'zb') return executeViewportZB(state)

  // Search (/ or ?)
  if (cmd.searchPattern !== undefined) {
    const s = pushJumpList(state)
    if (cmd.searchDirection === 'backward') {
      return executeSearchBackward(s, cmd.searchPattern)
    }
    return executeSearch(s, cmd.searchPattern)
  }

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
    // gn — select next search match in visual mode
    if (cmd.motion === 'gn') {
      return executeGn(state)
    }

    // Jump-list motions: record position before jumping
    const JUMP_MOTIONS = new Set([
      'G',
      'gg',
      '%',
      '{',
      '}',
      '(',
      ')',
      '[[',
      ']]',
      'H',
      'M',
      'L',
      'n',
      'N',
      '*',
      '#',
    ])
    const isMarkJump = cmd.motion.length === 2 && (cmd.motion[0] === "'" || cmd.motion[0] === '`')
    if (JUMP_MOTIONS.has(cmd.motion) || isMarkJump) {
      const s = pushJumpList(state)
      if (cmd.motion === 'n') return executeSearchNext(s)
      if (cmd.motion === 'N') return executeSearchPrev(s)
      if (cmd.motion === '*') return executeSearchWordForward(s)
      if (cmd.motion === '#') return executeSearchWordBackward(s)
      return executeMotion(s, cmd)
    }
    if (cmd.motion === '*') return executeSearchWordForward(state)
    if (cmd.motion === '#') return executeSearchWordBackward(state)
    return executeMotion(state, cmd)
  }

  return state
}
