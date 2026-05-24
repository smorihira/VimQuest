/**
 * commandReplayer — replay a single hint command on an EditorState.
 *
 * Used by HintOverlay (step-by-step demo) and hintVerifier tests.
 * Pure function, no React dependency.
 */

import type { EditorState } from '../types/editor'
import { CommandParser } from './commandParser'
import { executeCommand, finalizeInsertSession } from './commandExecutor'

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
