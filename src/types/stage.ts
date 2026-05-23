import type { CursorPosition } from './editor'

/** Supported syntax highlighting languages (Shiki) */
export type Language = 'plaintext' | 'css' | 'html' | 'json' | 'javascript' | 'python' | 'markdown'

/** Stage difficulty type */
export type StageType = 'teach' | 'practice' | 'challenge'

/** Star rating */
export type StarRating = 0 | 1 | 2 | 3

/** Solution hint */
export interface Hint {
    /** Star cost (always 1) */
    cost: number
    /** Demo command sequence (e.g., ["3j", "ci\"", "#333333", "Esc"]) */
    commands: string[]
}

/** Extended clear conditions (beyond text matching) */
export interface ClearCondition {
    /** Cursor must be at this position */
    cursor?: CursorPosition
    /** Specific registers must contain these values */
    registers?: Record<string, string>
}

/** Stage definition — static data in data/stages/ */
export interface Stage {
    /** Unique stage ID (e.g., "N01-T", "N18-C") */
    id: string
    /** Skill tree node ID (e.g., "N01") */
    nodeId: string
    /** Stage type */
    type: StageType
    /** Stage title */
    title: string
    /** Syntax highlighting language */
    language: Language
    /** Initial buffer text (LF linebreaks) */
    initialText: string
    /** Goal buffer text (LF linebreaks) */
    goalText: string
    /** Starting cursor position */
    initialCursor: CursorPosition
    /** Max life */
    life: number
    /** Star thresholds: [☆3, ☆2, ☆1] damage counts */
    stars: [number, number, number]
    /** Available commands (hand cards) */
    availableCommands: string[]
    /** Visual-mode-only commands (shown only in visual mode) */
    visualCommands?: string[]
    /** Extended clear conditions (text match is always required) */
    clearConditions?: ClearCondition
    /** Solution hints */
    hints: Hint[]
    /** Flavor text / mission description */
    flavor: string
}

/** Record of a single stage attempt result */
export interface StageResult {
    /** Stage ID */
    stageId: string
    /** Best star rating achieved */
    bestStars: StarRating
    /** Minimum damage record */
    bestDamage: number
    /** Whether hint was used (locks at ☆1) */
    usedHint: boolean
}
