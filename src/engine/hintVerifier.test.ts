/**
 * Hint Verification Test
 *
 * For every stage, execute the hint[0].commands sequence through
 * the command parser + executor, then verify:
 *   1. Final text matches goalText
 *   2. Final cursor matches clearConditions.cursor (if specified)
 *   3. Final registers match clearConditions.registers (if specified)
 */

import { describe, it, expect } from 'vitest'
import { ALL_STAGES } from '../data/stages'
import { BASE_COMMANDS } from '../data/constants'
import { CommandParser } from './commandParser'
import { executeCommand, finalizeInsertSession } from './commandExecutor'
import { createEditorState } from '../types/editor'
import { calculateHintDamage } from './commandReplayer'
import type { EditorState } from '../types/editor'
import type { Stage } from '../types/stage'

/**
 * Simulate executing a hint command sequence on a stage.
 *
 * Hint commands are high-level strings like:
 *   - 'w', 'j', '$' — single key
 *   - 'dw', 'ci"', 'daw' — multi-key parsed commands
 *   - 'hello', 'blue' — insert mode text (typed char by char)
 *   - 'Esc', 'Enter', 'Ctrl+d', 'Ctrl+R' — special keys
 *   - '/error' — search (/ + chars)
 *   - '"ayiw' — register + operator
 *
 * The tricky part: in insert mode, a command string like 'hello'
 * means each character is typed individually. But the parser is
 * only used in normal mode. In insert mode, characters go directly
 * to the executor.
 */
function simulateHintCommands(stage: Stage): EditorState {
  let state = createEditorState(stage.initialText, stage.initialCursor)
  const parser = new CommandParser(
    stage.availableCommands,
    undefined,
    stage.visualCommands,
    stage.nodeId !== 'N01' || stage.id === 'N01-C'
      ? (BASE_COMMANDS as unknown as string[])
      : undefined,
  )

  // Track insert mode for proper insert session handling
  let insertEntryState: EditorState | null = null
  let insertCharCount = 0
  let insertText = ''
  let lastEditCommand: import('../types/command').Command | null = null

  for (const cmd of stage.hints[0].commands) {
    if (state.mode === 'insert') {
      // In insert mode
      if (cmd === 'Esc') {
        // Finalize insert session
        state = finalizeInsertSession(state, insertEntryState!, insertCharCount)
        state = executeCommand(state, { raw: 'Esc', valid: true })
        // Store lastCommand and lastInsertText for dot repeat
        if (lastEditCommand) {
          state = { ...state, lastCommand: lastEditCommand, lastInsertText: insertText }
        }
        insertEntryState = null
        insertCharCount = 0
        insertText = ''
        parser.reset()
      } else if (cmd === 'Enter') {
        state = executeCommand(state, { raw: 'Enter', valid: true })
        insertCharCount++
        insertText += '\n'
      } else if (cmd === 'Backspace') {
        state = executeCommand(state, { raw: 'Backspace', valid: true })
        insertCharCount = Math.max(0, insertCharCount - 1)
      } else {
        // Type each character
        for (const ch of cmd) {
          state = executeCommand(state, { raw: ch, valid: true })
          insertCharCount++
          insertText += ch
        }
      }
      continue
    }

    // Normal/Visual mode: parse the command through the parser
    // Some commands need special handling

    // Search command: /pattern → feed '/' then each char then 'Enter'
    if (cmd.startsWith('/')) {
      const pattern = cmd.slice(1)
      parser.feed('/')
      for (const ch of pattern) {
        parser.feed(ch)
      }
      // Don't feed Enter here — the next command in hints should be 'Enter'
      continue
    }

    // Multi-char commands: feed each character
    const keys = tokenizeCommand(cmd)
    for (const key of keys) {
      // Keep parser aware of current editor mode
      parser.setEditorMode(state.mode === 'visual' ? 'visual' : 'normal')
      const result = parser.feed(key)
      if (result) {
        if (result.command.valid) {
          // Check if this command enters insert mode
          const wasNormal = state.mode !== 'insert'
          state = executeCommand(state, result.command)
          if (wasNormal && state.mode === 'insert') {
            insertEntryState = { ...state }
            insertCharCount = 0
            insertText = ''
            // Track the command that entered insert mode
            lastEditCommand = result.command
          }
          // Store lastCommand for non-insert editing commands
          if (state.mode === 'normal' && result.command.operator) {
            state = { ...state, lastCommand: result.command }
          }
        }
      }
    }
  }

  // If still in insert mode at end, finalize
  if (state.mode === 'insert' && insertEntryState) {
    state = finalizeInsertSession(state, insertEntryState, insertCharCount)
    state = executeCommand(state, { raw: 'Esc', valid: true })
    if (lastEditCommand) {
      state = { ...state, lastCommand: lastEditCommand, lastInsertText: insertText }
    }
  }

  return state
}

/**
 * Tokenize a hint command string into individual key presses.
 * Examples:
 *   'w' → ['w']
 *   'dw' → ['d', 'w']
 *   'ci"' → ['c', 'i', '"']
 *   'f(' → ['f', '(']
 *   'dtr' → ['d', 't', 'r']
 *   'gUiw' → ['g', 'U', 'i', 'w']
 *   'gg' → ['g', 'g']
 *   'dd' → ['d', 'd']
 *   'Esc' → ['Esc']
 *   'Ctrl+d' → ['Ctrl+d']
 *   'Ctrl+R' → ['Ctrl+R']
 *   'Ctrl+v' → ['Ctrl+v']
 *   '>>' → ['>', '>']
 *   '<<' → ['<', '<']
 *   '"ayiw' → ['"', 'a', 'y', 'i', 'w']
 *   '"ap' → ['"', 'a', 'p']
 *   'Enter' → ['Enter']
 *   'f{' → ['f', '{']
 */
function tokenizeCommand(cmd: string): string[] {
  // Special multi-char keys
  if (cmd === 'Esc' || cmd === 'Escape') return ['Esc']
  if (cmd === 'Enter') return ['Enter']
  if (cmd === 'Backspace') return ['Backspace']
  if (cmd.startsWith('Ctrl+')) return [cmd]

  // Single character
  if (cmd.length === 1) return [cmd]

  // Multi-character: split into individual characters
  return cmd.split('')
}

// ─── Tests ──────────────────────────────────────────────────────────

describe('Hint Verification', () => {
  const stages = Object.values(ALL_STAGES)

  for (const stage of stages) {
    it(`${stage.id}: hint commands produce correct result`, () => {
      const finalState = simulateHintCommands(stage)

      // 1. Text must match goalText
      expect(finalState.text).toBe(stage.goalText)

      // 2. Cursor must match clearConditions.cursor (if specified)
      if (stage.clearConditions?.cursor) {
        expect(finalState.cursor).toEqual(stage.clearConditions.cursor)
      }

      // 3. Registers must match clearConditions.registers (if specified)
      if (stage.clearConditions?.registers) {
        for (const [reg, value] of Object.entries(stage.clearConditions.registers)) {
          expect(finalState.registers[reg]).toBe(value)
        }
      }

      // 4. viewportTop must match clearConditions.viewportTop (if specified)
      if (stage.clearConditions?.viewportTop != null) {
        expect(finalState.viewportTop).toBe(stage.clearConditions.viewportTop)
      }
    })
  }
})

describe('Hint Damage Calculation', () => {
  const stages = Object.values(ALL_STAGES)

  for (const stage of stages) {
    it(`${stage.id}: hint damage === opt (opt=${stage.stars[0]})`, () => {
      const showBase = stage.nodeId !== 'N01' || stage.id === 'N01-C'
      const baseCommands = showBase ? (BASE_COMMANDS as unknown as readonly string[]) : undefined

      const damage = calculateHintDamage(
        stage.hints[0].commands,
        stage.initialText,
        stage.initialCursor,
        stage.availableCommands,
        baseCommands,
        stage.visualCommands,
      )

      expect(damage).toBeGreaterThan(0)

      if (stage.stars[0] !== 999) {
        // Hint must be the optimal solution — no exceptions by stage type.
        // If this fails, either the hint or the stage design needs to be fixed.
        expect(damage, `hint damage ${damage} !== opt ${stage.stars[0]}`).toBe(stage.stars[0])
      }
    })
  }
})
