/**
 * LocalStorage persistence helper.
 * Handles save/load/clear for GameProgress.
 */

import type { GameProgress } from '../types/game'
import { SAVE_KEY, createInitialProgress } from '../types/game'

/**
 * Load game progress from LocalStorage.
 * Returns fresh progress if no save found or parse fails.
 */
export function loadProgress(): GameProgress {
    try {
        const raw = localStorage.getItem(SAVE_KEY)
        if (!raw) return createInitialProgress()
        const parsed = JSON.parse(raw) as GameProgress
        // Basic validation
        if (!parsed.dataVersion || !Array.isArray(parsed.unlockedNodes)) {
            return createInitialProgress()
        }
        return parsed
    } catch {
        return createInitialProgress()
    }
}

/**
 * Save game progress to LocalStorage.
 */
export function saveProgress(progress: GameProgress): void {
    localStorage.setItem(SAVE_KEY, JSON.stringify(progress))
}

/**
 * Clear saved progress (new game).
 */
export function clearProgress(): void {
    localStorage.removeItem(SAVE_KEY)
}
