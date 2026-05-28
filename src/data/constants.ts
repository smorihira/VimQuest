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
 * - N01 tutorial: no base (player is still learning basics)
 * - N01 practice/challenge: BASE_N01 only (motion commands)
 * - N02 tutorial: BASE_N01 (inherited from completing N01)
 * - N02 practice/challenge: full BASE (N01 + N02)
 * - N03+: full BASE
 */
export function getBaseForStage(stage: Stage): readonly string[] | undefined {
  const node = stage.nodeId
  // N01 tutorial stages: no base
  if (node === 'N01' && stage.type === 'tutorial') {
    return undefined
  }
  // N01 practice/challenge: BASE_N01 only
  if (node === 'N01') {
    return BASE_N01
  }
  // N02 tutorial: BASE_N01 inherited (full BASE if no hand cards)
  if (node === 'N02' && stage.type === 'tutorial') {
    if (stage.availableCommands.length === 0) return BASE_COMMANDS
    return BASE_N01
  }
  // Everything else: full BASE
  return BASE_COMMANDS
}
