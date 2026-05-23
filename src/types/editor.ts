/** Vim mode */
export type VimMode = 'normal' | 'insert' | 'visual'

/** 0-indexed cursor position */
export interface CursorPosition {
    line: number
    col: number
}

/** Undo/redo stack entry */
export interface Operation {
    /** Text before the operation */
    oldText: string
    /** Text after the operation */
    newText: string
    /** Cursor before the operation */
    oldCursor: CursorPosition
    /** Cursor after the operation */
    newCursor: CursorPosition
    /** Mode before the operation */
    oldMode: VimMode
    /** Mode after the operation */
    newMode: VimMode
    /** Damage incurred (0 for undo/redo themselves) */
    damage: number
}

/** Complete editor state (immutable — always produce new objects) */
export interface EditorState {
    /** Current buffer text (LF linebreaks) */
    text: string
    /** Current cursor position */
    cursor: CursorPosition
    /** Current mode */
    mode: VimMode
    /** Undo stack */
    undoStack: Operation[]
    /** Redo stack */
    redoStack: Operation[]
    /** Named registers: unnamed="", "0-"9, "a-"z */
    registers: Record<string, string>
    /** Visual mode selection start (only in visual mode) */
    visualStart?: CursorPosition
    /** Visual mode type: char (v), line (V), or block (Ctrl+v) */
    visualType?: 'char' | 'line' | 'block'
    /** Last executed command (for dot repeat) */
    lastCommand?: import('./command').Command
    /** Last search pattern (for n/N) */
    lastSearchPattern?: string
    /** Last search direction */
    lastSearchDirection?: 'forward' | 'backward'
    /** Last f/F/t/T motion for ; and , repeat */
    lastFindMotion?: { motion: 'f' | 'F' | 't' | 'T'; char: string }
    /** Last insert text for dot repeat (text typed during last insert session) */
    lastInsertText?: string
    /** Top visible line index for viewport scrolling */
    viewportTop: number
}

/** Create initial editor state from text and cursor */
export function createEditorState(text: string, cursor: CursorPosition): EditorState {
    return {
        text,
        cursor,
        mode: 'normal',
        undoStack: [],
        redoStack: [],
        registers: {},
        viewportTop: 0,
    }
}
