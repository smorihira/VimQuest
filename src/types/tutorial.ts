import type { CursorPosition } from './editor'

/** Single step in a tutorial sequence */
export interface TutorialStep {
    /** Navigator's dialogue message */
    message: string
    /** Correct key to advance (null = any key) */
    expectedKey: string | null
    /** Additional accepted keys (omit = expectedKey only) */
    acceptedKeys?: string[]
    /** Override editor state at step start (omit = inherit previous) */
    editorSetup?: {
        text: string
        cursor: CursorPosition
    }
    /** Custom message for wrong key input (omit = default) */
    wrongKeyMessage?: string
}

/** Complete tutorial definition for a node */
export interface Tutorial {
    /** Target node ID */
    nodeId: string
    /** Initial editor state for the tutorial */
    initialSetup: {
        text: string
        cursor: CursorPosition
    }
    /** Ordered step sequence */
    steps: TutorialStep[]
}
