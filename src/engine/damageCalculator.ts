/**
 * damageCalculator — pure functions for damage tracking and star rating.
 *
 * Damage rules:
 *   - 1 valid command = 1 damage (1 life consumed)
 *   - u/Ctrl+R/Esc = 0 damage (free, unlimited)
 *   - Invalid command (not in hand) = 0 damage
 *   - Hint used = star locked to ☆1
 */

import type { Stage, StarRating } from '../types/stage'

/**
 * Calculate star rating from total damage.
 * stars array is [☆3 threshold, ☆2 threshold, ☆1 threshold].
 * If damage <= ☆3 → 3 stars, etc. If damage > ☆1 → 0 stars.
 */
export function calculateStars(damage: number, stars: [number, number, number]): StarRating {
  const [s3, s2, s1] = stars
  if (damage <= s3) return 3
  if (damage <= s2) return 2
  if (damage <= s1) return 1
  return 0
}

/**
 * Check if the player is still alive.
 */
export function isAlive(damage: number, life: number): boolean {
  return damage < life
}

/**
 * Apply hint penalty: if hint was used, cap stars at 1.
 */
export function applyHintPenalty(stars: StarRating, usedHint: boolean): StarRating {
  if (usedHint && stars > 1) return 1
  return stars
}

/**
 * Full evaluation: given a stage and attempt stats, compute the final star rating.
 */
export function evaluateAttempt(
  stage: Stage,
  damage: number,
  usedHint: boolean,
): { stars: StarRating; alive: boolean } {
  const alive = isAlive(damage, stage.life)
  if (!alive) {
    return { stars: 0, alive: false }
  }
  const raw = calculateStars(damage, stage.stars)
  const final = applyHintPenalty(raw, usedHint)
  return { stars: final, alive: true }
}
