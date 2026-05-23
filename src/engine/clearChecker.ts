/**
 * clearChecker — pure functions to check if a stage is cleared.
 *
 * Primary condition: text matches goalText.
 * Optional conditions: cursor position, register values.
 */

import type { EditorState } from '../types/editor'
import type { Stage, ClearCondition } from '../types/stage'

/**
 * Check if the editor state satisfies the stage's clear conditions.
 * Always checks text match; optionally checks cursor and registers.
 */
export function isStageClear(state: EditorState, stage: Stage): boolean {
  // Primary: text must match goal
  if (state.text !== stage.goalText) return false

  // Extended conditions
  if (stage.clearConditions) {
    if (!checkClearConditions(state, stage.clearConditions)) return false
  }

  return true
}

/**
 * Check extended clear conditions (cursor position, registers).
 */
export function checkClearConditions(state: EditorState, conditions: ClearCondition): boolean {
  // Cursor check
  if (conditions.cursor) {
    if (
      state.cursor.line !== conditions.cursor.line ||
      state.cursor.col !== conditions.cursor.col
    ) {
      return false
    }
  }

  // Register check
  if (conditions.registers) {
    for (const [key, expected] of Object.entries(conditions.registers)) {
      if (state.registers[key] !== expected) return false
    }
  }

  return true
}
