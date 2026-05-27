/** Global game constants */

/**
 * BASE_COMMANDS — always-available commands after N01 clear.
 * Includes N01 (motions) + N02 (basic editing) commands.
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
  '0',
  '^',
  '$',
  'gg',
  'G',
  'f',
  't',
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
