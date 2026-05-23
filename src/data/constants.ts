/** Global game constants */

/**
 * BASE_COMMANDS — always-available commands after N01 clear.
 * Displayed as small badges in the "base row" above regular hand cards.
 * Not included in per-stage availableCommands.
 */
export const BASE_COMMANDS: readonly string[] = [
  'h',
  'j',
  'k',
  'l',
  'w',
  'b',
  'e',
  'x',
  'i',
  'a',
] as const
