/**
 * damageModel — shared damage model constants and rules.
 * Single source of truth for damage calculation across play engine and hint replayer.
 */

/** Number of free characters per INSERT session before excess damage kicks in */
export const INSERT_FREE_CHARS = 5

/**
 * Calculate INSERT session damage.
 * Base cost 1 + excess chars beyond free threshold.
 */
export function insertSessionDamage(charCount: number): number {
  return 1 + Math.max(0, charCount - INSERT_FREE_CHARS)
}
