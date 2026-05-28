/** Global game constants */

import type { Stage } from '../types/stage'

/**
 * BASE_N01 — N01 (モーション基礎) commands.
 * Available as base from N01-P onward.
 */
export const BASE_N01: readonly string[] = [
  'h',
  'j',
  'k',
  'l',
  'w',
  'b',
  'e',
  '0',
  '^',
  '$',
  'gg',
  'G',
  'f',
  't',
] as const

/**
 * BASE_COMMANDS — full base (N01 + N02).
 * Available as base from N02-P onward.
 */
export const BASE_COMMANDS: readonly string[] = [
  ...BASE_N01,
  'x',
  'X',
  'r',
  'i',
  'a',
  'I',
  'A',
  'o',
  'O',
] as const

/**
 * Determine which base commands are available for a given stage.
 *
 * - N01 tutorial/teach: no base (player is still learning basics)
 * - N01-P/C: BASE_N01 only (motion commands)
 * - N02 teach/tutorial: BASE_N01 (inherited from completing N01)
 * - N02-P/C: full BASE (N01 + N02)
 * - N03+, N12, N14 etc.: full BASE
 */
export function getBaseForStage(stage: Stage): readonly string[] | undefined {
  const id = stage.id
  // N01 tutorial/teach stages: no base
  if (id.startsWith('N01-') && stage.type !== 'practice' && stage.type !== 'challenge') {
    return undefined
  }
  // N01 practice/challenge: BASE_N01 only
  if (id.startsWith('N01-')) {
    return BASE_N01
  }
  // N02 teach/tutorial: BASE_N01 inherited
  if (id.startsWith('N02-') && stage.type !== 'practice' && stage.type !== 'challenge') {
    return BASE_N01
  }
  // Everything else: full BASE
  return BASE_COMMANDS
}
