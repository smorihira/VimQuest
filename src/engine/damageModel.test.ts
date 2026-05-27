/**
 * A2: Damage model consistency tests.
 * Verifies that the shared damage model (damageModel.ts) is correct and that
 * CommandSession.calculateDamage follows the same rules as usePlayEngine.
 */

import { describe, it, expect } from 'vitest'
import { INSERT_FREE_CHARS, insertSessionDamage } from './damageModel'
import { CommandSession } from './commandSession'
import type { CursorPosition } from '../types/editor'

// ── damageModel unit tests ──

describe('damageModel', () => {
  it('INSERT_FREE_CHARS is 5', () => {
    expect(INSERT_FREE_CHARS).toBe(5)
  })

  it('insertSessionDamage: 0 chars → 1', () => {
    expect(insertSessionDamage(0)).toBe(1)
  })

  it('insertSessionDamage: up to FREE_CHARS → 1', () => {
    for (let i = 0; i <= INSERT_FREE_CHARS; i++) {
      expect(insertSessionDamage(i)).toBe(1)
    }
  })

  it('insertSessionDamage: excess chars → 1 + excess', () => {
    expect(insertSessionDamage(INSERT_FREE_CHARS + 1)).toBe(2)
    expect(insertSessionDamage(INSERT_FREE_CHARS + 3)).toBe(4)
    expect(insertSessionDamage(INSERT_FREE_CHARS + 10)).toBe(11)
  })
})

// ── CommandSession.calculateDamage pattern tests ──
// These patterns mirror the damage rules in usePlayEngine.

const BASIC_COMMANDS = [
  'h',
  'j',
  'k',
  'l',
  'w',
  'b',
  'e',
  'x',
  'dd',
  'i',
  'a',
  'o',
  'v',
  'V',
  'Esc',
  'd',
  'c',
  'y',
  'p',
  'A',
  'I',
  'O',
  'u',
  'r',
  's',
  'f',
]
const VISUAL_COMMANDS = ['d', 'x', 'y', 'c']
const text = 'hello world'
const cursor: CursorPosition = { line: 0, col: 0 }

function calcDamage(
  commands: readonly string[],
  t: string = text,
  c: CursorPosition = cursor,
  available: readonly string[] = BASIC_COMMANDS,
  base?: readonly string[],
  visual?: readonly string[],
): number {
  return CommandSession.calculateDamage(commands, {
    initialText: t,
    initialCursor: c,
    availableCommands: available,
    baseCommands: base,
    visualCommands: visual,
  })
}

describe('CommandSession.calculateDamage: damage rules', () => {
  it('normal mode motion = 1 damage', () => {
    expect(calcDamage(['w'])).toBe(1)
  })

  it('normal mode operator = 1 damage', () => {
    expect(calcDamage(['x'])).toBe(1)
  })

  it('dd = 1 damage (single compound command)', () => {
    expect(calcDamage(['dd'])).toBe(1)
  })

  it('insert entry (i) = 0, Esc = 1 (empty insert)', () => {
    expect(calcDamage(['i', 'Esc'])).toBe(1)
  })

  it('insert with <=5 chars = 1 damage total', () => {
    expect(calcDamage(['i', 'abc', 'Esc'])).toBe(1) // 3 chars <= 5 free
  })

  it('insert with >5 chars = 1 + excess', () => {
    expect(calcDamage(['i', 'abcdef', 'Esc'])).toBe(2) // 6 chars → 1 + (6-5) = 2
  })

  it('insert with 10 chars = 6 damage', () => {
    expect(calcDamage(['i', 'abcdefghij', 'Esc'])).toBe(6) // 10 chars → 1 + (10-5) = 6
  })

  it('visual entry (v) = 0, operation = 1', () => {
    expect(calcDamage(['v', 'x'], text, cursor, BASIC_COMMANDS, undefined, VISUAL_COMMANDS)).toBe(1)
  })

  it('visual Esc = 1 damage', () => {
    expect(calcDamage(['v', 'Esc'], text, cursor, BASIC_COMMANDS, undefined, VISUAL_COMMANDS)).toBe(
      1,
    )
  })

  it('visual motion + operation = 2', () => {
    expect(
      calcDamage(['v', 'w', 'd'], text, cursor, BASIC_COMMANDS, undefined, VISUAL_COMMANDS),
    ).toBe(2)
  })

  it('Esc in normal mode = 0 damage', () => {
    expect(calcDamage(['Esc'])).toBe(0)
  })

  it('search /pattern = 1 damage', () => {
    expect(calcDamage(['/world', 'Enter'])).toBe(1)
  })

  it('multiple commands accumulate', () => {
    // w(1) + w(1) + x(1) = 3
    expect(calcDamage(['w', 'w', 'x'])).toBe(3)
  })

  it('mixed: motion + insert + motion', () => {
    // w(1) + i(0) + "ab"(2chars) + Esc(1) + w(1) = 3
    expect(calcDamage(['w', 'i', 'ab', 'Esc', 'w'])).toBe(3)
  })
})
