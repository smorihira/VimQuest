/**
 * commandReplayer — replay a single hint command on an EditorState.
 *
 * Used by HintOverlay (step-by-step demo) and hintVerifier tests.
 * Pure function, no React dependency.
 */

import type { EditorState } from '../types/editor'
import type { CursorPosition } from '../types/editor'
import { createEditorState } from '../types/editor'
import { CommandParser } from './commandParser'
import { executeCommand, finalizeInsertSession } from './commandExecutor'

const INSERT_FREE_CHARS = 5

/** Tokenize a hint command string into individual key presses. */
function tokenizeHintCommand(cmdStr: string): string[] {
  // Multi-char special keys are sent as a single token
  if (
    cmdStr.length > 1 &&
    (cmdStr.includes('+') || cmdStr === 'Esc' || cmdStr === 'Enter' || cmdStr === 'Backspace')
  ) {
    return [cmdStr]
  }
  return cmdStr.split('')
}

/**
 * Apply a single hint command string to an EditorState.
 *
 * Handles:
 * - Normal/visual mode parsed commands (w, dw, ci", etc.)
 * - Insert mode text typing (hello → typed char by char)
 * - Special keys (Esc, Enter, Backspace, Ctrl+d)
 * - Esc insert finalization
 */
export function applyHintCommand(
  state: EditorState,
  cmdStr: string,
  availableCommands: readonly string[],
  baseCommands?: readonly string[],
  visualCommands?: readonly string[],
): EditorState {
  // In insert mode, type each character directly (unless Esc/special)
  if (state.mode === 'insert' && cmdStr !== 'Esc') {
    let s = state
    for (const ch of cmdStr) {
      s = executeCommand(s, { raw: ch, valid: true })
    }
    return s
  }

  // Search command: /pattern → feed /, chars, and Enter in one go
  if (state.mode !== 'insert' && cmdStr.startsWith('/')) {
    const parser = new CommandParser(
      availableCommands as string[],
      undefined,
      visualCommands as string[] | undefined,
      baseCommands as string[] | undefined,
    )
    parser.setEditorMode(state.mode)
    parser.feed('/')
    for (const ch of cmdStr.slice(1)) {
      parser.feed(ch)
    }
    const result = parser.feed('Enter')
    let s = state
    if (result?.command.valid) {
      s = executeCommand(s, result.command)
    }
    return s
  }

  const parser = new CommandParser(
    availableCommands as string[],
    undefined,
    visualCommands as string[] | undefined,
    baseCommands as string[] | undefined,
  )
  parser.setEditorMode(state.mode)

  const keys = tokenizeHintCommand(cmdStr)

  let s = state
  for (const key of keys) {
    const result = parser.feed(key)
    if (result?.command.valid) {
      s = executeCommand(s, result.command)
    }
  }

  // Esc in insert mode: finalize insert session
  if (cmdStr === 'Esc') {
    s = executeCommand(s, { raw: 'Esc', valid: true })
    s = finalizeInsertSession(s, state, 0)
  }

  return s
}

/**
 * Calculate total damage from a hint command sequence.
 * Uses the current damage model: INSERT = 1 + max(0, charCount - 5), entry = 0.
 */
export function calculateHintDamage(
  commands: readonly string[],
  initialText: string,
  initialCursor: CursorPosition,
  availableCommands: readonly string[],
  baseCommands?: readonly string[],
  visualCommands?: readonly string[],
): number {
  let state = createEditorState(initialText, initialCursor)
  let damage = 0
  let charCount = 0
  let skipNext = false

  for (const cmd of commands) {
    // Skip 'Enter' that follows a /pattern (already processed)
    if (skipNext) {
      skipNext = false
      continue
    }

    const prevMode = state.mode
    state = applyHintCommand(state, cmd, availableCommands, baseCommands, visualCommands)

    if (prevMode === 'insert') {
      if (cmd === 'Esc') {
        damage += 1 + Math.max(0, charCount - INSERT_FREE_CHARS)
        charCount = 0
      } else {
        charCount += cmd.length
      }
    } else if (prevMode === 'visual') {
      if (cmd === 'Esc') {
        damage += 1 // Esc from visual costs 1
      } else {
        damage += 1 // operations/motions in visual cost 1
      }
    } else {
      if (cmd.startsWith('/')) {
        // Search: /pattern + Enter = 1 damage total
        damage += 1
        skipNext = true // skip the following Enter
      } else if (state.mode === 'insert') {
        charCount = 0 // Entering INSERT: entry = 0
      } else if (state.mode === 'visual') {
        // Entering visual mode: entry = 0
      } else if (cmd !== 'Esc') {
        damage += 1
      }
    }
  }
  return damage
}
