import type { CursorPosition } from './editor'

/** Step type determines input handling */
export type TutorialStepType = 'key' | 'hold_space' | 'colon_command'

/** Single step in a tutorial sequence */
export interface TutorialStep {
  /** Navigator's dialogue message */
  message: string
  /** Step type (default: 'key') */
  type?: TutorialStepType
  /** Correct key to advance (null = any key). Ignored for hold_space / colon_command. */
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
  /** Colon command to wait for (e.g. ':h', ':e!'). Used when type === 'colon_command'. */
  colonCommand?: string
}

/** Complete tutorial definition for a node or stage */
export interface Tutorial {
  /** Target node ID */
  nodeId: string
  /** Target stage ID (required; links tutorial to its stage) */
  stageId: string
  /** Initial editor state for the tutorial (optional; omit to use stage data) */
  initialSetup?: {
    text: string
    cursor: CursorPosition
  }
  /** Ordered step sequence */
  steps: TutorialStep[]
}
