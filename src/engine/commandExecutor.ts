/**
 * commandExecutor — pure functions that transform EditorState.
 *
 * Every function takes an EditorState and returns a NEW EditorState.
 * No side effects, no React dependency.
 *
 * Scope (S4 initial): h/j/k/l, w/b/e, x, u, i/a/Esc, d+motion(dw/de/db)
 * Architecture supports adding all 70 commands without structural changes.
 */

import type { EditorState, CursorPosition, Operation, VimMode } from '../types/editor'
import type { Command } from '../types/command'

// ─── Helpers ────────────────────────────────────────────────────────

/** Split text into lines */
function lines(text: string): string[] {
    return text.split('\n')
}

/** Join lines into text */
function join(ls: string[]): string {
    return ls.join('\n')
}

/** Clamp cursor to valid position within text */
function clampCursor(text: string, cursor: CursorPosition, mode: VimMode): CursorPosition {
    const ls = lines(text)
    const line = Math.max(0, Math.min(cursor.line, ls.length - 1))
    const lineLen = ls[line].length
    // In normal mode, cursor can't go past last char (but can be on it)
    // In insert mode, cursor can go one past the end
    const maxCol = mode === 'insert' ? lineLen : Math.max(0, lineLen - 1)
    const col = Math.max(0, Math.min(cursor.col, maxCol))
    return { line, col }
}

/** Get line length (0-indexed) */
function lineLen(text: string, lineIdx: number): number {
    return lines(text)[lineIdx]?.length ?? 0
}

/** Total number of lines */
function lineCount(text: string): number {
    return lines(text).length
}

/** Check if character is a word character (alphanumeric + underscore) */
function isWordChar(ch: string): boolean {
    return /\w/.test(ch)
}

/** Check if character is whitespace */
function isSpace(ch: string): boolean {
    return /\s/.test(ch)
}

// ─── Snapshot: push to undo stack ──────────────────────────────────

function pushUndo(
    state: EditorState,
    newText: string,
    newCursor: CursorPosition,
    newMode: VimMode,
    damage: number,
): EditorState {
    const op: Operation = {
        oldText: state.text,
        newText,
        oldCursor: state.cursor,
        newCursor,
        oldMode: state.mode,
        newMode,
        damage,
    }
    return {
        ...state,
        text: newText,
        cursor: clampCursor(newText, newCursor, newMode),
        mode: newMode,
        undoStack: [...state.undoStack, op],
        redoStack: [], // any new operation clears redo
    }
}

// ─── Motion Executors ──────────────────────────────────────────────

/** Move cursor left (h) */
function moveLeft(state: EditorState, count: number): CursorPosition {
    return { line: state.cursor.line, col: Math.max(0, state.cursor.col - count) }
}

/** Move cursor down (j) */
function moveDown(state: EditorState, count: number): CursorPosition {
    const maxLine = lineCount(state.text) - 1
    const newLine = Math.min(state.cursor.line + count, maxLine)
    return clampCursor(state.text, { line: newLine, col: state.cursor.col }, state.mode)
}

/** Move cursor up (k) */
function moveUp(state: EditorState, count: number): CursorPosition {
    const newLine = Math.max(0, state.cursor.line - count)
    return clampCursor(state.text, { line: newLine, col: state.cursor.col }, state.mode)
}

/** Move cursor right (l) */
function moveRight(state: EditorState, count: number): CursorPosition {
    const maxCol = Math.max(0, lineLen(state.text, state.cursor.line) - 1)
    return { line: state.cursor.line, col: Math.min(state.cursor.col + count, maxCol) }
}

/** Move to next word start (w) */
function moveWordForward(state: EditorState, count: number): CursorPosition {
    const ls = lines(state.text)
    let { line, col } = state.cursor

    for (let i = 0; i < count; i++) {
        const lineText = ls[line]
        if (col >= lineText.length) {
            // Move to next line
            if (line < ls.length - 1) {
                line++
                col = 0
                // Skip leading whitespace
                while (col < ls[line].length && isSpace(ls[line][col])) col++
            }
            continue
        }

        const startChar = lineText[col]
        // Skip current word or punctuation block
        if (isWordChar(startChar)) {
            while (col < lineText.length && isWordChar(lineText[col])) col++
        } else if (!isSpace(startChar)) {
            while (col < lineText.length && !isWordChar(lineText[col]) && !isSpace(lineText[col])) col++
        }
        // Skip whitespace
        while (col < lineText.length && isSpace(lineText[col])) col++

        // If we've gone past line end, move to next line
        if (col >= lineText.length && line < ls.length - 1) {
            line++
            col = 0
            while (col < ls[line].length && isSpace(ls[line][col])) col++
        }
    }

    return clampCursor(state.text, { line, col }, state.mode)
}

/** Move to previous word start (b) */
function moveWordBackward(state: EditorState, count: number): CursorPosition {
    const ls = lines(state.text)
    let { line, col } = state.cursor

    for (let i = 0; i < count; i++) {
        // If at start of line, go to previous line end
        if (col === 0) {
            if (line > 0) {
                line--
                col = Math.max(0, ls[line].length - 1)
            }
            continue
        }

        col--
        const lineText = ls[line]

        // Skip whitespace backwards
        while (col > 0 && isSpace(lineText[col])) col--

        // Skip word or punctuation block backwards
        if (isWordChar(lineText[col])) {
            while (col > 0 && isWordChar(lineText[col - 1])) col--
        } else if (!isSpace(lineText[col])) {
            while (col > 0 && !isWordChar(lineText[col - 1]) && !isSpace(lineText[col - 1])) col--
        }
    }

    return { line, col }
}

/** Move to end of word (e) */
function moveWordEnd(state: EditorState, count: number): CursorPosition {
    const ls = lines(state.text)
    let { line, col } = state.cursor

    for (let i = 0; i < count; i++) {
        col++
        const lineText = ls[line]

        // If past line end, go to next line
        if (col >= lineText.length) {
            if (line < ls.length - 1) {
                line++
                col = 0
            } else {
                col = Math.max(0, lineText.length - 1)
                continue
            }
        }

        // Skip whitespace
        while (col < ls[line].length && isSpace(ls[line][col])) {
            col++
            if (col >= ls[line].length && line < ls.length - 1) {
                line++
                col = 0
            }
        }

        // Skip to end of word or punctuation block
        const curLine = ls[line]
        if (col < curLine.length && isWordChar(curLine[col])) {
            while (col < curLine.length - 1 && isWordChar(curLine[col + 1])) col++
        } else if (col < curLine.length && !isSpace(curLine[col])) {
            while (col < curLine.length - 1 && !isWordChar(curLine[col + 1]) && !isSpace(curLine[col + 1]))
                col++
        }
    }

    return clampCursor(state.text, { line, col }, state.mode)
}

/** Resolve a motion to a target cursor position */
function resolveMotion(
    state: EditorState,
    motion: string,
    count: number,
): CursorPosition | null {
    switch (motion) {
        case 'h': return moveLeft(state, count)
        case 'j': return moveDown(state, count)
        case 'k': return moveUp(state, count)
        case 'l': return moveRight(state, count)
        case 'w': return moveWordForward(state, count)
        case 'b': return moveWordBackward(state, count)
        case 'e': return moveWordEnd(state, count)
        default: return null // not yet implemented
    }
}

// ─── Delete Helpers ────────────────────────────────────────────────

/**
 * Delete text from cursor to target position.
 * Returns { text, cursor } after deletion.
 * For motions like w/e, delete includes the character at target.
 */
function deleteRange(
    text: string,
    from: CursorPosition,
    to: CursorPosition,
    inclusive: boolean,
): { text: string; cursor: CursorPosition; deleted: string } {
    const ls = lines(text)

    // Convert positions to flat offsets
    let fromOffset = 0
    for (let i = 0; i < from.line; i++) fromOffset += ls[i].length + 1
    fromOffset += from.col

    let toOffset = 0
    for (let i = 0; i < to.line; i++) toOffset += ls[i].length + 1
    toOffset += to.col

    // Ensure from <= to
    if (fromOffset > toOffset) {
        ;[fromOffset, toOffset] = [toOffset, fromOffset]
    }

    if (inclusive) toOffset++

    const deleted = text.slice(fromOffset, toOffset)
    const newText = text.slice(0, fromOffset) + text.slice(toOffset)

    // Recalculate cursor position from offset
    const newLines = lines(newText)
    let offset = 0
    let cursorLine = 0
    for (let i = 0; i < newLines.length; i++) {
        if (offset + newLines[i].length >= fromOffset) {
            cursorLine = i
            break
        }
        offset += newLines[i].length + 1
    }
    const cursorCol = fromOffset - offset

    return {
        text: newText || '', // ensure non-empty
        cursor: { line: cursorLine, col: Math.max(0, cursorCol) },
        deleted,
    }
}

/**
 * Determine if a motion's delete is inclusive (includes char at target).
 * w: delete from cursor to start of next word (not including next word start) → special handling
 * e: inclusive (delete through end of word)
 * b: exclusive (delete from cursor back to word start)
 */
function isMotionInclusive(motion: string): boolean {
    switch (motion) {
        case 'e': return true
        case 'w': return false // w deletes up to (not including) next word start
        case 'b': return false
        default: return false
    }
}

// ─── Command Execution ─────────────────────────────────────────────

/** Execute a motion-only command (h/j/k/l/w/b/e) — no undo entry (motions aren't undoable) */
function executeMotion(state: EditorState, cmd: Command): EditorState {
    const count = cmd.count ?? 1
    const motion = cmd.motion!
    const target = resolveMotion(state, motion, count)
    if (!target) return state

    return { ...state, cursor: clampCursor(state.text, target, state.mode) }
}

/** Execute x (delete character under cursor) */
function executeDeleteChar(state: EditorState, cmd: Command): EditorState {
    const count = cmd.count ?? 1
    const ls = lines(state.text)
    const line = ls[state.cursor.line]
    if (line.length === 0) return state

    const start = state.cursor.col
    const end = Math.min(start + count, line.length)
    const deleted = line.slice(start, end)
    const newLine = line.slice(0, start) + line.slice(end)
    const newLines = [...ls]
    newLines[state.cursor.line] = newLine
    const newText = join(newLines)

    const newCursor = clampCursor(newText, state.cursor, 'normal')

    const result = pushUndo(state, newText, newCursor, 'normal', 1)
    return { ...result, registers: { ...result.registers, '': deleted } }
}

/** Execute u (undo) — FREE, no damage */
function executeUndo(state: EditorState): EditorState {
    if (state.undoStack.length === 0) return state

    const op = state.undoStack[state.undoStack.length - 1]
    return {
        ...state,
        text: op.oldText,
        cursor: clampCursor(op.oldText, op.oldCursor, op.oldMode),
        mode: op.oldMode,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, op],
    }
}

/** Execute Ctrl+R (redo) — FREE, no damage */
function executeRedo(state: EditorState): EditorState {
    if (state.redoStack.length === 0) return state

    const op = state.redoStack[state.redoStack.length - 1]
    return {
        ...state,
        text: op.newText,
        cursor: clampCursor(op.newText, op.newCursor, op.newMode),
        mode: op.newMode,
        undoStack: [...state.undoStack, op],
        redoStack: state.redoStack.slice(0, -1),
    }
}

/** Enter insert mode (i) — no undo entry (entire session consolidated on Esc) */
function executeInsertBefore(state: EditorState): EditorState {
    return { ...state, mode: 'insert' as const }
}

/** Enter insert mode after cursor (a) — no undo entry (entire session consolidated on Esc) */
function executeInsertAfter(state: EditorState): EditorState {
    const newCol = Math.min(state.cursor.col + 1, lineLen(state.text, state.cursor.line))
    return { ...state, cursor: { line: state.cursor.line, col: newCol }, mode: 'insert' as const }
}

/** Enter insert mode at first non-blank of line (I) */
function executeInsertLineStart(state: EditorState): EditorState {
    const ls = lines(state.text)
    const line = ls[state.cursor.line]
    let col = 0
    while (col < line.length && isSpace(line[col])) col++
    return { ...state, cursor: { line: state.cursor.line, col }, mode: 'insert' as const }
}

/** Enter insert mode at end of line (A) */
function executeInsertLineEnd(state: EditorState): EditorState {
    const len = lineLen(state.text, state.cursor.line)
    return { ...state, cursor: { line: state.cursor.line, col: len }, mode: 'insert' as const }
}

/** Replace character under cursor (r + char) */
function executeReplace(state: EditorState, char: string): EditorState {
    const ls = lines(state.text)
    const line = ls[state.cursor.line]
    if (line.length === 0 || state.cursor.col >= line.length) return state

    const newLine = line.slice(0, state.cursor.col) + char + line.slice(state.cursor.col + 1)
    const newLines = [...ls]
    newLines[state.cursor.line] = newLine
    const newText = join(newLines)

    return pushUndo(state, newText, state.cursor, 'normal', 1)
}

/** Toggle case of character under cursor (~) and advance */
function executeToggleCase(state: EditorState): EditorState {
    const ls = lines(state.text)
    const line = ls[state.cursor.line]
    if (line.length === 0 || state.cursor.col >= line.length) return state

    const ch = line[state.cursor.col]
    const toggled = ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()
    const newLine = line.slice(0, state.cursor.col) + toggled + line.slice(state.cursor.col + 1)
    const newLines = [...ls]
    newLines[state.cursor.line] = newLine
    const newText = join(newLines)

    // ~ advances cursor by 1 (Vim behavior)
    const newCol = Math.min(state.cursor.col + 1, Math.max(0, newLine.length - 1))
    return pushUndo(state, newText, { line: state.cursor.line, col: newCol }, 'normal', 1)
}

/** Open new line below and enter insert mode (o) */
function executeOpenBelow(state: EditorState): EditorState {
    const ls = lines(state.text)
    const newLines = [...ls]
    newLines.splice(state.cursor.line + 1, 0, '')
    const newText = join(newLines)
    return { ...state, text: newText, cursor: { line: state.cursor.line + 1, col: 0 }, mode: 'insert' as const }
}

/** Open new line above and enter insert mode (O) */
function executeOpenAbove(state: EditorState): EditorState {
    const ls = lines(state.text)
    const newLines = [...ls]
    newLines.splice(state.cursor.line, 0, '')
    const newText = join(newLines)
    return { ...state, text: newText, cursor: { line: state.cursor.line, col: 0 }, mode: 'insert' as const }
}

/** Exit insert mode (Esc) */
function executeEscape(state: EditorState): EditorState {
    if (state.mode === 'normal') return state

    // In insert mode, move cursor back one (Vim behavior)
    const newCol = state.mode === 'insert' ? Math.max(0, state.cursor.col - 1) : state.cursor.col

    // Esc itself is free (0 damage) — just a mode change
    // But the insert session was already recorded when entering insert
    return {
        ...state,
        cursor: clampCursor(state.text, { line: state.cursor.line, col: newCol }, 'normal'),
        mode: 'normal',
    }
}

/** Insert text at cursor (during insert mode) */
function executeInsertText(state: EditorState, text: string): EditorState {
    // Map 'Enter' key string to actual newline
    const actualText = text === 'Enter' ? '\n' : text
    const ls = lines(state.text)
    const line = ls[state.cursor.line]
    const { col } = state.cursor

    if (actualText === '\n') {
        // Enter key — split line
        const before = line.slice(0, col)
        const after = line.slice(col)
        const newLines = [...ls]
        newLines.splice(state.cursor.line, 1, before, after)
        const newText = join(newLines)
        const newCursor: CursorPosition = { line: state.cursor.line + 1, col: 0 }
        // Insert text doesn't push individual chars to undo (the whole insert session is one undo unit)
        return { ...state, text: newText, cursor: newCursor }
    }

    // Regular character insertion
    const newLine = line.slice(0, col) + actualText + line.slice(col)
    const newLines = [...ls]
    newLines[state.cursor.line] = newLine
    const newText = join(newLines)
    return { ...state, text: newText, cursor: { line: state.cursor.line, col: col + actualText.length } }
}

/** Execute Backspace in insert mode */
function executeBackspace(state: EditorState): EditorState {
    const ls = lines(state.text)
    const { line: lineIdx, col } = state.cursor

    if (col === 0) {
        // Join with previous line
        if (lineIdx === 0) return state
        const prevLine = ls[lineIdx - 1]
        const curLine = ls[lineIdx]
        const newLines = [...ls]
        newLines.splice(lineIdx - 1, 2, prevLine + curLine)
        const newText = join(newLines)
        return { ...state, text: newText, cursor: { line: lineIdx - 1, col: prevLine.length } }
    }

    const line = ls[lineIdx]
    const newLine = line.slice(0, col - 1) + line.slice(col)
    const newLines = [...ls]
    newLines[lineIdx] = newLine
    const newText = join(newLines)
    return { ...state, text: newText, cursor: { line: lineIdx, col: col - 1 } }
}

/** Execute operator + motion (e.g., dw, de, db) */
function executeOperatorMotion(state: EditorState, cmd: Command): EditorState {
    const count = cmd.count ?? 1
    const motion = cmd.motion!
    const operator = cmd.operator!

    const target = resolveMotion(state, motion, count)
    if (!target) return state

    if (operator === 'd') {
        // For 'w' motion with delete: dw deletes from cursor to start of next word
        // but if on last word of line, deletes to end of line including trailing space
        const inclusive = isMotionInclusive(motion)
        const { text: newText, cursor: newCursor, deleted } = deleteRange(
            state.text,
            state.cursor,
            target,
            inclusive,
        )

        const result = pushUndo(state, newText, newCursor, 'normal', 1)
        return { ...result, registers: { ...result.registers, '': deleted } }
    }

    // Other operators (c, y, etc.) will be added later
    return state
}

// ─── Public API ─────────────────────────────────────────────────────

/**
 * Execute a parsed command on the editor state.
 * Returns a new EditorState (never mutates the input).
 *
 * @param state  Current editor state
 * @param cmd    Parsed command from commandParser
 * @returns      New editor state after command execution
 */
export function executeCommand(state: EditorState, cmd: Command): EditorState {
    if (!cmd.valid) return state

    const raw = cmd.raw

    // ── Undo/Redo (always available, free) ──
    if (raw === 'u') return executeUndo(state)
    if (raw === 'Ctrl+R') return executeRedo(state)

    // ── Escape (always available, free) ──
    if (raw === 'Escape' || raw === 'Esc') return executeEscape(state)

    // ── Insert mode input ──
    if (state.mode === 'insert') {
        if (raw === 'Backspace') return executeBackspace(state)
        // Regular text input in insert mode
        return executeInsertText(state, raw)
    }

    // ── Normal mode ──

    // Enter insert mode
    if (raw === 'i') return executeInsertBefore(state)
    if (raw === 'a') return executeInsertAfter(state)
    if (raw === 'I') return executeInsertLineStart(state)
    if (raw === 'A') return executeInsertLineEnd(state)
    if (raw === 'o') return executeOpenBelow(state)
    if (raw === 'O') return executeOpenAbove(state)

    // Toggle case
    if (raw === '~') return executeToggleCase(state)

    // Replace character (r + char)
    if (cmd.char !== undefined && raw.startsWith('r')) {
        return executeReplace(state, cmd.char)
    }

    // Delete character
    if (raw === 'x') return executeDeleteChar(state, cmd)

    // Operator + motion (dw, de, db)
    if (cmd.operator && cmd.motion) {
        return executeOperatorMotion(state, cmd)
    }

    // Pure motions
    if (cmd.motion && !cmd.operator) {
        return executeMotion(state, cmd)
    }

    return state
}

/**
 * Finalize insert mode: consolidate the insert session into a single undo entry.
 * Called when exiting insert mode (Esc).
 *
 * Damage formula (ENGINE-SPEC §5.1, per examples):
 *   charCount === 0 → 0 (immediate cancel: i→Esc)
 *   charCount >= 1  → ceil(charCount / 5)
 *
 * @param charCount  Net characters typed (chars − backspaces, Enter counts as 1)
 */
export function finalizeInsertSession(
    state: EditorState,
    entryState: EditorState,
    charCount: number,
): EditorState {
    // Empty insert (i → Esc): no damage, no undo entry
    if (charCount === 0 && state.text === entryState.text) {
        return {
            ...state,
            undoStack: entryState.undoStack,
            redoStack: [],
        }
    }

    const damage = charCount <= 0 ? 1 : Math.ceil(charCount / 5)
    const op: Operation = {
        oldText: entryState.text,
        newText: state.text,
        oldCursor: entryState.cursor,
        newCursor: state.cursor,
        oldMode: 'normal',
        newMode: 'normal',
        damage,
    }

    return {
        ...state,
        undoStack: [...entryState.undoStack, op],
        redoStack: [],
    }
}
