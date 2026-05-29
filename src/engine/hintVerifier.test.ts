/**
 * Hint Verification Test
 *
 * For every stage, execute the hint[0].commands sequence through
 * CommandSession.feedHintCommand, then verify:
 *   1. Final text matches goalText
 *   2. Final cursor matches clearConditions.cursor (if specified)
 *   3. Final registers match clearConditions.registers (if specified)
 *   4. Final viewportTop matches clearConditions.viewportTop (if specified)
 *   5. Damage equals opt (stars[0])
 */

import { describe, it, expect } from 'vitest'
import { ALL_STAGES } from '../data/nodes'
import { getBaseForStage } from '../data/constants'
import { CommandSession } from './commandSession'

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Hint Verification', () => {
  const stages = Object.values(ALL_STAGES)

  for (const stage of stages) {
    it(`${stage.id}: hint commands produce correct result`, () => {
      if (stage.hints.length === 0) return // stub stage
      const base = getBaseForStage(stage) as string[] | undefined

      const session = new CommandSession({
        initialText: stage.initialText,
        initialCursor: stage.initialCursor,
        availableCommands: stage.availableCommands,
        baseCommands: base,
        visualCommands: stage.visualCommands,
        life: 999,
        stage,
        noClearCheck: true,
      })

      for (const cmd of stage.hints[0].commands) {
        session.feedHintCommand(cmd)
      }

      const snap = session.getSnapshot()

      // 1. Text must match goalText
      expect(snap.editorState.text).toBe(stage.goalText)

      // 2. Cursor must match clearConditions.cursor (if specified)
      if (stage.clearConditions?.cursor) {
        expect(snap.editorState.cursor).toEqual(stage.clearConditions.cursor)
      }

      // 3. Registers must match clearConditions.registers (if specified)
      if (stage.clearConditions?.registers) {
        for (const [reg, value] of Object.entries(stage.clearConditions.registers)) {
          expect(snap.editorState.registers[reg]).toBe(value)
        }
      }

      // 4. viewportTop must match clearConditions.viewportTop (if specified)
      if (stage.clearConditions?.viewportTop != null) {
        expect(snap.editorState.viewportTop).toBe(stage.clearConditions.viewportTop)
      }
    })
  }
})

describe('Hint Damage Calculation', () => {
  const stages = Object.values(ALL_STAGES)

  for (const stage of stages) {
    it(`${stage.id}: hint damage === opt (opt=${stage.stars[0]})`, () => {
      if (stage.hints.length === 0) return // stub stage
      const base = getBaseForStage(stage) as readonly string[] | undefined

      const damage = CommandSession.calculateDamage(stage.hints[0].commands, {
        initialText: stage.initialText,
        initialCursor: stage.initialCursor,
        availableCommands: stage.availableCommands,
        baseCommands: base,
        visualCommands: stage.visualCommands,
        stage,
      })

      expect(damage).toBeGreaterThan(0)

      if (stage.stars[0] !== 999) {
        expect(damage, `hint damage ${damage} !== opt ${stage.stars[0]}`).toBe(stage.stars[0])
      }
    })
  }
})
