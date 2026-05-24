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
import type { Command, TextObject } from '../types/command'

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
        damageAtEntry: 0, // stamped by usePlayEngine with actual cumulative damage
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
            while (
                col < curLine.length - 1 &&
                !isWordChar(curLine[col + 1]) &&
                !isSpace(curLine[col + 1])
            )
                col++
        }
    }

    return clampCursor(state.text, { line, col }, state.mode)
}

/** Move to next WORD start (W) — whitespace-delimited */
function moveWORDForward(state: EditorState, count: number): CursorPosition {
    const ls = lines(state.text)
    let { line, col } = state.cursor

    for (let i = 0; i < count; i++) {
        const lineText = ls[line]
        // Skip non-space characters
        while (col < lineText.length && !isSpace(lineText[col])) col++
        // Skip whitespace
        while (col < lineText.length && isSpace(lineText[col])) col++

        if (col >= lineText.length && line < ls.length - 1) {
            line++
            col = 0
            while (col < ls[line].length && isSpace(ls[line][col])) col++
        }
    }

    return clampCursor(state.text, { line, col }, state.mode)
}

/** Move to previous WORD start (B) — whitespace-delimited */
function moveWORDBackward(state: EditorState, count: number): CursorPosition {
    const ls = lines(state.text)
    let { line, col } = state.cursor

    for (let i = 0; i < count; i++) {
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
        // Skip non-space backwards
        while (col > 0 && !isSpace(lineText[col - 1])) col--
    }

    return { line, col }
}

/** Move to end of WORD (E) — whitespace-delimited */
function moveWORDEnd(state: EditorState, count: number): CursorPosition {
    const ls = lines(state.text)
    let { line, col } = state.cursor

    for (let i = 0; i < count; i++) {
        col++
        if (col >= ls[line].length) {
            if (line < ls.length - 1) {
                line++
                col = 0
            } else {
                col = Math.max(0, ls[line].length - 1)
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

        // Skip to end of WORD
        while (col < ls[line].length - 1 && !isSpace(ls[line][col + 1])) col++
    }

    return clampCursor(state.text, { line, col }, state.mode)
}

/** Find character forward on current line (f) */
function findCharForward(state: EditorState, char: string, count: number): CursorPosition | null {
    const ls = lines(state.text)
    const line = ls[state.cursor.line]
    let found = 0
    for (let col = state.cursor.col + 1; col < line.length; col++) {
        if (line[col] === char) {
            found++
            if (found === count) return { line: state.cursor.line, col }
        }
    }
    return null
}

/** Find character backward on current line (F) */
function findCharBackward(state: EditorState, char: string, count: number): CursorPosition | null {
    const ls = lines(state.text)
    const line = ls[state.cursor.line]
    let found = 0
    for (let col = state.cursor.col - 1; col >= 0; col--) {
        if (line[col] === char) {
            found++
            if (found === count) return { line: state.cursor.line, col }
        }
    }
    return null
}

/** Find character forward, stop one before (t) */
function tilCharForward(state: EditorState, char: string, count: number): CursorPosition | null {
    const pos = findCharForward(state, char, count)
    if (!pos) return null
    return { line: pos.line, col: Math.max(state.cursor.col + 1, pos.col - 1) }
}

/** Find character backward, stop one after (T) */
function tilCharBackward(state: EditorState, char: string, count: number): CursorPosition | null {
    const pos = findCharBackward(state, char, count)
    if (!pos) return null
    return { line: pos.line, col: Math.min(state.cursor.col - 1, pos.col + 1) }
}

/** Move to start of line (0) */
function moveLineStart(state: EditorState): CursorPosition {
    return { line: state.cursor.line, col: 0 }
}

/** Move to end of line ($) */
function moveLineEnd(state: EditorState): CursorPosition {
    const len = lineLen(state.text, state.cursor.line)
    return { line: state.cursor.line, col: Math.max(0, len - 1) }
}

/** Move to first non-blank character (^) */
function moveFirstNonBlank(state: EditorState): CursorPosition {
    const ls = lines(state.text)
    const line = ls[state.cursor.line]
    let col = 0
    while (col < line.length && isSpace(line[col])) col++
    return { line: state.cursor.line, col: Math.min(col, Math.max(0, line.length - 1)) }
}

/** Move to last line or specific line (G) */
function moveToLine(state: EditorState, count: number | undefined): CursorPosition {
    const maxLine = lineCount(state.text) - 1
    const targetLine = count !== undefined ? Math.min(count - 1, maxLine) : maxLine
    const ls = lines(state.text)
    const line = ls[Math.max(0, targetLine)]
    let col = 0
    while (col < line.length && isSpace(line[col])) col++
    return { line: Math.max(0, targetLine), col: Math.min(col, Math.max(0, line.length - 1)) }
}

/** Move to first line (gg) */
function moveToFirstLine(state: EditorState, count: number | undefined): CursorPosition {
    const maxLine = lineCount(state.text) - 1
    const targetLine = count !== undefined ? Math.min(count - 1, maxLine) : 0
    const ls = lines(state.text)
    const line = ls[Math.max(0, targetLine)]
    let col = 0
    while (col < line.length && isSpace(line[col])) col++
    return { line: Math.max(0, targetLine), col: Math.min(col, Math.max(0, line.length - 1)) }
}

/** Match bracket: find matching (, ), {, }, [, ] (%) */
function matchBracket(state: EditorState): CursorPosition | null {
    const PAIRS: Record<string, string> = {
        '(': ')',
        ')': '(',
        '{': '}',
        '}': '{',
        '[': ']',
        ']': '[',
    }
    const OPEN = new Set(['(', '{', '['])

    const ls = lines(state.text)
    const line = ls[state.cursor.line]

    // Find the first bracket at or after cursor on current line
    let startCol = state.cursor.col
    while (startCol < line.length && !PAIRS[line[startCol]]) startCol++
    if (startCol >= line.length) return null

    const startChar = line[startCol]
    const matchChar = PAIRS[startChar]
    const forward = OPEN.has(startChar)
    const direction = forward ? 1 : -1

    // Convert to flat offset
    let offset = 0
    for (let i = 0; i < state.cursor.line; i++) offset += ls[i].length + 1
    offset += startCol

    const flat = ls.join('\n')
    let depth = 1

    for (let i = offset + direction; i >= 0 && i < flat.length; i += direction) {
        if (flat[i] === startChar) depth++
        else if (flat[i] === matchChar) depth--
        if (depth === 0) {
            // Convert flat offset back to line/col
            let ln = 0,
                col = 0
            for (let j = 0; j < i; j++) {
                if (flat[j] === '\n') {
                    ln++
                    col = 0
                } else col++
            }
            return { line: ln, col }
        }
    }

    return null
}

/** Resolve a motion to a target cursor position */
function resolveMotion(
    state: EditorState,
    motion: string,
    count: number,
    char?: string,
    rawCount?: number,
): CursorPosition | null {
    switch (motion) {
        case 'h':
            return moveLeft(state, count)
        case 'j':
            return moveDown(state, count)
        case 'k':
            return moveUp(state, count)
        case 'l':
            return moveRight(state, count)
        case 'w':
            return moveWordForward(state, count)
        case 'b':
            return moveWordBackward(state, count)
        case 'e':
            return moveWordEnd(state, count)
        case 'W':
            return moveWORDForward(state, count)
        case 'B':
            return moveWORDBackward(state, count)
        case 'E':
            return moveWORDEnd(state, count)
        case 'f':
            return char ? findCharForward(state, char, count) : null
        case 'F':
            return char ? findCharBackward(state, char, count) : null
        case 't':
            return char ? tilCharForward(state, char, count) : null
        case 'T':
            return char ? tilCharBackward(state, char, count) : null
        case '0':
            return moveLineStart(state)
        case '$':
            return moveLineEnd(state)
        case '^':
            return moveFirstNonBlank(state)
        case 'G':
            return moveToLine(state, rawCount)
        case 'gg':
            return moveToFirstLine(state, rawCount)
        case '%':
            return matchBracket(state)
        case 'gj':
            return moveDown(state, count)
        case 'gk':
            return moveUp(state, count)
        case ';': {
            if (!state.lastFindMotion) return null
            return resolveMotion(state, state.lastFindMotion.motion, count, state.lastFindMotion.char)
        }
        case ',': {
            if (!state.lastFindMotion) return null
            const reverse: Record<string, string> = { f: 'F', F: 'f', t: 'T', T: 't' }
            return resolveMotion(
                state,
                reverse[state.lastFindMotion.motion],
                count,
                state.lastFindMotion.char,
            )
        }
        default:
            return null
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
        case 'e':
            return true
        case 'E':
            return true
        case 'f':
            return true
        case 'F':
            return true
        case '$':
            return true
        case '%':
            return true
        case 't':
            return true
        case 'T':
            return true
        case 'w':
            return false
        case 'b':
            return false
        default:
            return false
    }
}

// ─── Command Execution ─────────────────────────────────────────────

/** Execute a motion-only command (h/j/k/l/w/b/e) — no undo entry (motions aren't undoable) */
function executeMotion(state: EditorState, cmd: Command): EditorState {
    const count = cmd.count ?? 1
    const motion = cmd.motion!
    const target = resolveMotion(state, motion, count, cmd.char, cmd.count)
    if (!target) return state

    // Store last f/F/t/T for ; and , repeat
    let newState = { ...state, cursor: clampCursor(state.text, target, state.mode) }
    if ((motion === 'f' || motion === 'F' || motion === 't' || motion === 'T') && cmd.char) {
        newState = {
            ...newState,
            lastFindMotion: { motion: motion as 'f' | 'F' | 't' | 'T', char: cmd.char },
        }
    }
    return newState
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
    return {
        ...state,
        text: newText,
        cursor: { line: state.cursor.line + 1, col: 0 },
        mode: 'insert' as const,
    }
}

/** Open new line above and enter insert mode (O) */
function executeOpenAbove(state: EditorState): EditorState {
    const ls = lines(state.text)
    const newLines = [...ls]
    newLines.splice(state.cursor.line, 0, '')
    const newText = join(newLines)
    return {
        ...state,
        text: newText,
        cursor: { line: state.cursor.line, col: 0 },
        mode: 'insert' as const,
    }
}

/** Exit insert/visual mode (Esc) */
function executeEscape(state: EditorState): EditorState {
    if (state.mode === 'normal') return state

    if (state.mode === 'visual') {
        return { ...state, mode: 'normal', visualStart: undefined, visualType: undefined }
    }

    // In insert mode, move cursor back one (Vim behavior)
    const newCol = Math.max(0, state.cursor.col - 1)

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
    return {
        ...state,
        text: newText,
        cursor: { line: state.cursor.line, col: col + actualText.length },
    }
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

    const target = resolveMotion(state, motion, count, cmd.char, cmd.count)
    if (!target) return state

    // Store last f/F/t/T for ; and , repeat
    if ((motion === 'f' || motion === 'F' || motion === 't' || motion === 'T') && cmd.char) {
        state = {
            ...state,
            lastFindMotion: { motion: motion as 'f' | 'F' | 't' | 'T', char: cmd.char },
        }
    }

    if (operator === 'd') {
        const inclusive = isMotionInclusive(motion)
        const {
            text: newText,
            cursor: newCursor,
            deleted,
        } = deleteRange(state.text, state.cursor, target, inclusive)

        const result = pushUndo(state, newText, newCursor, 'normal', 1)
        return { ...result, registers: { ...result.registers, '': deleted } }
    }

    if (operator === 'c') {
        const inclusive = isMotionInclusive(motion)
        const {
            text: newText,
            cursor: newCursor,
            deleted,
        } = deleteRange(state.text, state.cursor, target, inclusive)
        // Enter insert mode at deletion point
        return {
            ...state,
            text: newText,
            cursor: newCursor,
            mode: 'insert',
            registers: { ...state.registers, '': deleted },
        }
    }

    if (operator === 'y') {
        const inclusive = isMotionInclusive(motion)
        const ls = lines(state.text)
        let fromOffset = 0
        for (let i = 0; i < state.cursor.line; i++) fromOffset += ls[i].length + 1
        fromOffset += state.cursor.col
        let toOffset = 0
        for (let i = 0; i < target.line; i++) toOffset += ls[i].length + 1
        toOffset += target.col
        if (fromOffset > toOffset) [fromOffset, toOffset] = [toOffset, fromOffset]
        if (inclusive) toOffset++
        const yanked = state.text.slice(fromOffset, toOffset)
        return { ...state, registers: { ...state.registers, '': yanked } }
    }

    if (operator === 'gu' || operator === 'gU') {
        return executeCaseChange(state, cmd, operator === 'gU')
    }

    if (operator === '>') {
        return executeIndent(state, cmd.count ?? 1)
    }

    if (operator === '<') {
        return executeDedent(state, cmd.count ?? 1)
    }

    return state
}

// ─── Text Object Resolution ────────────────────────────────────────

/** Resolve a text object to a range [from, to] (inclusive on both ends) */
function resolveTextObject(
    state: EditorState,
    textObj: TextObject,
): { from: number; to: number } | null {
    const flat = state.text
    const ls = lines(flat)

    // Convert cursor to flat offset
    let curOffset = 0
    for (let i = 0; i < state.cursor.line; i++) curOffset += ls[i].length + 1
    curOffset += state.cursor.col

    switch (textObj) {
        case 'iw': {
            // Inner word: the word under cursor
            if (curOffset >= flat.length) return null
            const ch = flat[curOffset]
            const isW = isWordChar(ch)
            const isSp = isSpace(ch)
            const predicate = isW
                ? isWordChar
                : isSp
                    ? isSpace
                    : (c: string) => !isWordChar(c) && !isSpace(c)
            let from = curOffset
            let to = curOffset
            while (from > 0 && predicate(flat[from - 1])) from--
            while (to < flat.length - 1 && predicate(flat[to + 1])) to++
            return { from, to }
        }
        case 'aw': {
            // A word: word under cursor + surrounding whitespace
            const inner = resolveTextObject(state, 'iw')
            if (!inner) return null
            let { from, to } = inner
            // Include trailing whitespace, or leading if no trailing
            if (to + 1 < flat.length && isSpace(flat[to + 1])) {
                while (to + 1 < flat.length && isSpace(flat[to + 1]) && flat[to + 1] !== '\n') to++
            } else if (from > 0 && isSpace(flat[from - 1])) {
                while (from > 0 && isSpace(flat[from - 1]) && flat[from - 1] !== '\n') from--
            }
            return { from, to }
        }
        case 'i"':
        case "i'":
        case 'i(':
        case 'i)':
        case 'i{':
        case 'i}':
        case 'i[':
        case 'i]':
        case 'i<':
        case 'i>': {
            const delim = textObj[1]
            return findInsideDelimiters(flat, curOffset, delim)
        }
        case 'a"':
        case "a'":
        case 'a(':
        case 'a)':
        case 'a{':
        case 'a}':
        case 'a[':
        case 'a]':
        case 'a<':
        case 'a>': {
            const delim = textObj[1]
            const inner = findInsideDelimiters(flat, curOffset, delim)
            if (!inner) return null
            // Include delimiters
            return { from: inner.from - 1, to: inner.to + 1 }
        }
        default:
            return null
    }
}

/** Find inside delimiter pair. For quotes, find matching pair. For brackets, find matching pair. */
function findInsideDelimiters(
    flat: string,
    curOffset: number,
    delim: string,
): { from: number; to: number } | null {
    const PAIRS: Record<string, [string, string]> = {
        '(': ['(', ')'],
        ')': ['(', ')'],
        '{': ['{', '}'],
        '}': ['{', '}'],
        '[': ['[', ']'],
        ']': ['[', ']'],
        '<': ['<', '>'],
        '>': ['<', '>'],
    }

    if (delim === '"' || delim === "'") {
        // Find surrounding quotes
        let start = -1
        let end = -1

        // Search backward for opening quote
        for (let i = curOffset; i >= 0; i--) {
            if (flat[i] === delim) {
                // Check this is actually an opening quote by counting
                start = i
                break
            }
        }

        if (start === -1) {
            // No quote at or before cursor — search forward on same line for a quote pair
            // Find the current line boundaries
            let lineStart = curOffset
            while (lineStart > 0 && flat[lineStart - 1] !== '\n') lineStart--
            let lineEnd = curOffset
            while (lineEnd < flat.length && flat[lineEnd] !== '\n') lineEnd++

            for (let i = curOffset + 1; i < lineEnd; i++) {
                if (flat[i] === delim) {
                    start = i
                    for (let j = i + 1; j < lineEnd; j++) {
                        if (flat[j] === delim) {
                            end = j
                            break
                        }
                    }
                    break
                }
            }
            if (start === -1 || end === -1 || start >= end) return null
            if (start + 1 > end - 1) return { from: start + 1, to: start }
            return { from: start + 1, to: end - 1 }
        }

        // If cursor is on the quote itself, check if it's opening or closing
        if (start === curOffset) {
            // Look for closing quote after
            for (let i = start + 1; i < flat.length; i++) {
                if (flat[i] === delim) {
                    end = i
                    break
                }
            }
            if (end === -1) {
                // This was closing quote, look backward for opening
                for (let i = start - 1; i >= 0; i--) {
                    if (flat[i] === delim) {
                        start = i
                        end = curOffset
                        break
                    }
                }
            }
        } else {
            // Search forward for closing quote
            for (let i = start + 1; i < flat.length; i++) {
                if (flat[i] === delim) {
                    end = i
                    break
                }
            }
        }

        if (start === -1 || end === -1 || start >= end) return null
        if (start + 1 > end - 1) return { from: start + 1, to: start } // empty inside
        return { from: start + 1, to: end - 1 }
    }

    // Bracket pairs
    const pair = PAIRS[delim]
    if (!pair) return null
    const [open, close] = pair

    // Find opening bracket (search backward)
    let depth = 0
    let start = -1
    for (let i = curOffset; i >= 0; i--) {
        if (flat[i] === close && i !== curOffset) depth++
        if (flat[i] === open) {
            if (depth === 0) {
                start = i
                break
            }
            depth--
        }
    }
    if (start === -1) return null

    // Find closing bracket (search forward from opening)
    depth = 0
    let end = -1
    for (let i = start + 1; i < flat.length; i++) {
        if (flat[i] === open) depth++
        if (flat[i] === close) {
            if (depth === 0) {
                end = i
                break
            }
            depth--
        }
    }
    if (end === -1) return null

    if (start + 1 > end - 1) return { from: start + 1, to: start } // empty inside
    return { from: start + 1, to: end - 1 }
}

/** Convert flat offset to line/col */
function offsetToPos(text: string, offset: number): CursorPosition {
    const ls = lines(text)
    let remaining = offset
    for (let i = 0; i < ls.length; i++) {
        if (remaining <= ls[i].length) {
            return { line: i, col: remaining }
        }
        remaining -= ls[i].length + 1
    }
    const lastLine = ls.length - 1
    return { line: lastLine, col: ls[lastLine].length }
}

// ─── Additional Command Implementations ────────────────────────────

/** Execute dd — delete current line */
function executeDeleteLine(state: EditorState, count: number): EditorState {
    const ls = lines(state.text)
    const from = state.cursor.line
    const to = Math.min(from + count, ls.length)
    const deleted = ls.slice(from, to).join('\n') + '\n'
    const newLines = [...ls.slice(0, from), ...ls.slice(to)]
    if (newLines.length === 0) newLines.push('')
    const newText = join(newLines)
    const newLine = Math.min(from, newLines.length - 1)
    // Move to first non-blank of new line
    let col = 0
    while (col < newLines[newLine].length && isSpace(newLines[newLine][col])) col++
    const newCursor = { line: newLine, col: Math.min(col, Math.max(0, newLines[newLine].length - 1)) }
    const result = pushUndo(state, newText, newCursor, 'normal', 1)
    return { ...result, registers: { ...result.registers, '': deleted } }
}

/** Execute D — delete from cursor to end of line */
function executeDeleteToEnd(state: EditorState): EditorState {
    const ls = lines(state.text)
    const line = ls[state.cursor.line]
    const deleted = line.slice(state.cursor.col)
    const newLine = line.slice(0, state.cursor.col)
    const newLines = [...ls]
    newLines[state.cursor.line] = newLine
    const newText = join(newLines)
    const newCol = Math.max(0, state.cursor.col - 1)
    const result = pushUndo(state, newText, { line: state.cursor.line, col: newCol }, 'normal', 1)
    return { ...result, registers: { ...result.registers, '': deleted } }
}

/** Execute J — join current line with next line */
function executeJoinLines(state: EditorState): EditorState {
    const ls = lines(state.text)
    if (state.cursor.line >= ls.length - 1) return state
    const curLine = ls[state.cursor.line]
    const nextLine = ls[state.cursor.line + 1]
    const trimmedNext = nextLine.trimStart()
    const joinCol = curLine.length
    const joined = curLine + (trimmedNext.length > 0 ? ' ' + trimmedNext : '')
    const newLines = [...ls]
    newLines.splice(state.cursor.line, 2, joined)
    const newText = join(newLines)
    return pushUndo(state, newText, { line: state.cursor.line, col: joinCol }, 'normal', 1)
}

/** Execute p — paste after cursor */
function executePaste(state: EditorState, register: string): EditorState {
    const content = state.registers[register] ?? ''
    if (!content) return state

    const ls = lines(state.text)

    // Line-wise paste (content ends with \n)
    if (content.endsWith('\n')) {
        const pasteLines = content.slice(0, -1) // remove trailing \n
        const newLines = [...ls]
        newLines.splice(state.cursor.line + 1, 0, pasteLines)
        const newText = join(newLines)
        const newCursor = { line: state.cursor.line + 1, col: 0 }
        return pushUndo(state, newText, newCursor, 'normal', 1)
    }

    // Character-wise paste (after cursor)
    const line = ls[state.cursor.line]
    const insertCol = Math.min(state.cursor.col + 1, line.length)
    const newLine = line.slice(0, insertCol) + content + line.slice(insertCol)
    const newLines = [...ls]
    newLines[state.cursor.line] = newLine
    const newText = join(newLines)
    const newCursor = { line: state.cursor.line, col: insertCol + content.length - 1 }
    return pushUndo(state, newText, newCursor, 'normal', 1)
}

/** Execute P — paste before cursor */
function executePasteBefore(state: EditorState, register: string): EditorState {
    const content = state.registers[register] ?? ''
    if (!content) return state

    const ls = lines(state.text)

    // Line-wise paste
    if (content.endsWith('\n')) {
        const pasteLines = content.slice(0, -1)
        const newLines = [...ls]
        newLines.splice(state.cursor.line, 0, pasteLines)
        const newText = join(newLines)
        const newCursor = { line: state.cursor.line, col: 0 }
        return pushUndo(state, newText, newCursor, 'normal', 1)
    }

    // Character-wise paste (before cursor)
    const line = ls[state.cursor.line]
    const newLine = line.slice(0, state.cursor.col) + content + line.slice(state.cursor.col)
    const newLines = [...ls]
    newLines[state.cursor.line] = newLine
    const newText = join(newLines)
    const newCursor = { line: state.cursor.line, col: state.cursor.col + content.length - 1 }
    return pushUndo(state, newText, newCursor, 'normal', 1)
}

/** Execute s — substitute character (delete char + enter insert) */
function executeSubstitute(state: EditorState): EditorState {
    const ls = lines(state.text)
    const line = ls[state.cursor.line]
    if (line.length === 0) return { ...state, mode: 'insert' }
    const deleted = line[state.cursor.col]
    const newLine = line.slice(0, state.cursor.col) + line.slice(state.cursor.col + 1)
    const newLines = [...ls]
    newLines[state.cursor.line] = newLine
    const newText = join(newLines)
    return {
        ...state,
        text: newText,
        cursor: state.cursor,
        mode: 'insert',
        registers: { ...state.registers, '': deleted },
    }
}

/** Execute S — substitute entire line (delete line content + enter insert) */
function executeSubstituteLine(state: EditorState): EditorState {
    const ls = lines(state.text)
    const line = ls[state.cursor.line]
    const indent = line.match(/^(\s*)/)?.[1] ?? ''
    const newLines = [...ls]
    newLines[state.cursor.line] = indent
    const newText = join(newLines)
    return {
        ...state,
        text: newText,
        cursor: { line: state.cursor.line, col: indent.length },
        mode: 'insert',
        registers: { ...state.registers, '': line },
    }
}

/** Execute C — change from cursor to end of line */
function executeChangeToEnd(state: EditorState): EditorState {
    const ls = lines(state.text)
    const line = ls[state.cursor.line]
    const deleted = line.slice(state.cursor.col)
    const newLine = line.slice(0, state.cursor.col)
    const newLines = [...ls]
    newLines[state.cursor.line] = newLine
    const newText = join(newLines)
    return {
        ...state,
        text: newText,
        cursor: state.cursor,
        mode: 'insert',
        registers: { ...state.registers, '': deleted },
    }
}

/** Default viewport height in lines */
const VIEWPORT_HEIGHT = 16

/** Clamp viewport top to valid range */
function clampViewport(viewportTop: number, totalLines: number): number {
    const max = Math.max(0, totalLines - 1)
    return Math.min(Math.max(0, viewportTop), max)
}

/** Auto-scroll viewport to keep cursor visible */
function ensureCursorVisible(state: EditorState): EditorState {
    const { cursor, viewportTop } = state
    if (cursor.line < viewportTop) {
        return { ...state, viewportTop: cursor.line }
    }
    if (cursor.line >= viewportTop + VIEWPORT_HEIGHT) {
        return { ...state, viewportTop: cursor.line - VIEWPORT_HEIGHT + 1 }
    }
    return state
}

/** Execute Ctrl+d — half page down */
function executeHalfPageDown(state: EditorState): EditorState {
    const totalLines = lineCount(state.text)
    const halfPage = Math.max(1, Math.floor(VIEWPORT_HEIGHT / 2))
    const target = Math.min(state.cursor.line + halfPage, totalLines - 1)
    const newViewport = clampViewport(state.viewportTop + halfPage, totalLines)
    return { ...state, cursor: { line: target, col: 0 }, viewportTop: newViewport }
}

/** Execute Ctrl+u — half page up */
function executeHalfPageUp(state: EditorState): EditorState {
    const totalLines = lineCount(state.text)
    const halfPage = Math.max(1, Math.floor(VIEWPORT_HEIGHT / 2))
    const target = Math.max(state.cursor.line - halfPage, 0)
    const newViewport = clampViewport(state.viewportTop - halfPage, totalLines)
    return { ...state, cursor: { line: target, col: 0 }, viewportTop: newViewport }
}

/** Execute zz — scroll viewport to center cursor */
function executeViewportZZ(state: EditorState): EditorState {
    const totalLines = lineCount(state.text)
    const newTop = clampViewport(state.cursor.line - Math.floor(VIEWPORT_HEIGHT / 2), totalLines)
    return { ...state, viewportTop: newTop }
}

/** Execute zt — scroll viewport to put cursor at top */
function executeViewportZT(state: EditorState): EditorState {
    const totalLines = lineCount(state.text)
    const newTop = clampViewport(state.cursor.line, totalLines)
    return { ...state, viewportTop: newTop }
}

/** Execute zb — scroll viewport to put cursor at bottom */
function executeViewportZB(state: EditorState): EditorState {
    const totalLines = lineCount(state.text)
    const newTop = clampViewport(state.cursor.line - VIEWPORT_HEIGHT + 1, totalLines)
    return { ...state, viewportTop: newTop }
}

/** Execute >> — indent line */
function executeIndent(state: EditorState, count: number): EditorState {
    const ls = lines(state.text)
    const newLines = [...ls]
    for (let i = 0; i < count && state.cursor.line + i < ls.length; i++) {
        newLines[state.cursor.line + i] = '  ' + newLines[state.cursor.line + i]
    }
    const newText = join(newLines)
    // Move cursor to first non-blank
    const line = newLines[state.cursor.line]
    let col = 0
    while (col < line.length && isSpace(line[col])) col++
    return pushUndo(state, newText, { line: state.cursor.line, col }, 'normal', 1)
}

/** Execute << — dedent line */
function executeDedent(state: EditorState, count: number): EditorState {
    const ls = lines(state.text)
    const newLines = [...ls]
    for (let i = 0; i < count && state.cursor.line + i < ls.length; i++) {
        const line = newLines[state.cursor.line + i]
        if (line.startsWith('  ')) newLines[state.cursor.line + i] = line.slice(2)
        else if (line.startsWith(' ')) newLines[state.cursor.line + i] = line.slice(1)
        else if (line.startsWith('\t')) newLines[state.cursor.line + i] = line.slice(1)
    }
    const newText = join(newLines)
    const line = newLines[state.cursor.line]
    let col = 0
    while (col < line.length && isSpace(line[col])) col++
    return pushUndo(state, newText, { line: state.cursor.line, col }, 'normal', 1)
}

/** Execute search (/ + pattern) */
function executeSearch(state: EditorState, pattern: string): EditorState {
    if (!pattern) return state
    const flat = state.text
    const ls = lines(flat)

    // Convert cursor to flat offset
    let curOffset = 0
    for (let i = 0; i < state.cursor.line; i++) curOffset += ls[i].length + 1
    curOffset += state.cursor.col

    // Search forward from cursor+1
    try {
        const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        const after = flat.slice(curOffset + 1)
        const match = regex.exec(after)
        if (match) {
            const pos = offsetToPos(flat, curOffset + 1 + match.index)
            return { ...state, cursor: pos, lastSearchPattern: pattern, lastSearchDirection: 'forward' }
        }
        // Wrap around
        const before = flat.slice(0, curOffset + 1)
        const wrapMatch = regex.exec(before)
        if (wrapMatch) {
            const pos = offsetToPos(flat, wrapMatch.index)
            return { ...state, cursor: pos, lastSearchPattern: pattern, lastSearchDirection: 'forward' }
        }
    } catch {
        // Invalid regex — treat as literal
    }
    return { ...state, lastSearchPattern: pattern, lastSearchDirection: 'forward' }
}

/** Execute n — repeat search forward */
function executeSearchNext(state: EditorState): EditorState {
    if (!state.lastSearchPattern) return state
    return executeSearch(state, state.lastSearchPattern)
}

/** Execute N — repeat search backward */
function executeSearchPrev(state: EditorState): EditorState {
    if (!state.lastSearchPattern) return state
    const pattern = state.lastSearchPattern
    const flat = state.text
    const ls = lines(flat)

    let curOffset = 0
    for (let i = 0; i < state.cursor.line; i++) curOffset += ls[i].length + 1
    curOffset += state.cursor.col

    try {
        const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
        // Find all matches and pick the one before cursor
        let lastMatch: number | null = null
        let m: RegExpExecArray | null
        while ((m = regex.exec(flat)) !== null) {
            if (m.index < curOffset) lastMatch = m.index
            else break
        }
        if (lastMatch !== null) {
            return { ...state, cursor: offsetToPos(flat, lastMatch) }
        }
        // Wrap around — find last match in entire text
        regex.lastIndex = 0
        let wrapMatch: number | null = null
        while ((m = regex.exec(flat)) !== null) {
            wrapMatch = m.index
        }
        if (wrapMatch !== null) {
            return { ...state, cursor: offsetToPos(flat, wrapMatch) }
        }
    } catch {
        // Invalid pattern
    }
    return state
}

/** Execute * — search for word under cursor forward */
function executeSearchWordForward(state: EditorState): EditorState {
    const ls = lines(state.text)
    const line = ls[state.cursor.line]
    const col = state.cursor.col

    // Find word boundaries
    if (!isWordChar(line[col])) return state
    let start = col
    let end = col
    while (start > 0 && isWordChar(line[start - 1])) start--
    while (end < line.length - 1 && isWordChar(line[end + 1])) end++
    const word = line.slice(start, end + 1)

    return executeSearch(state, word)
}

/** Execute case change via gu/gU + text object or motion */
function executeCaseChange(state: EditorState, cmd: Command, toUpper: boolean): EditorState {
    let from: number, to: number

    if (cmd.textObject) {
        const range = resolveTextObject(state, cmd.textObject)
        if (!range) return state
        from = range.from
        to = range.to
    } else if (cmd.motion) {
        const count = cmd.count ?? 1
        const target = resolveMotion(state, cmd.motion, count, cmd.char, cmd.count)
        if (!target) return state
        const ls = lines(state.text)
        let fromOffset = 0
        for (let i = 0; i < state.cursor.line; i++) fromOffset += ls[i].length + 1
        fromOffset += state.cursor.col
        let toOffset = 0
        for (let i = 0; i < target.line; i++) toOffset += ls[i].length + 1
        toOffset += target.col
        from = Math.min(fromOffset, toOffset)
        to = Math.max(fromOffset, toOffset)
    } else {
        return state
    }

    const flat = state.text
    const before = flat.slice(0, from)
    const middle = flat.slice(from, to + 1)
    const after = flat.slice(to + 1)
    const changed = toUpper ? middle.toUpperCase() : middle.toLowerCase()
    const newText = before + changed + after
    return pushUndo(state, newText, state.cursor, 'normal', 1)
}

/** Execute operator + text object (diw, ci", etc.) */
function executeOperatorTextObject(state: EditorState, cmd: Command): EditorState {
    const operator = cmd.operator!
    const textObj = cmd.textObject!
    const range = resolveTextObject(state, textObj)
    if (!range) return state

    const flat = state.text
    const { from, to } = range

    if (from > to) {
        // Empty text object (e.g., empty quotes "")
        if (operator === 'c') {
            return { ...state, mode: 'insert' }
        }
        return state
    }

    const deleted = flat.slice(from, to + 1)
    const newText = flat.slice(0, from) + flat.slice(to + 1)
    const newCursor = offsetToPos(newText, Math.min(from, newText.length - 1))

    if (operator === 'd') {
        const result = pushUndo(state, newText, clampCursor(newText, newCursor, 'normal'), 'normal', 1)
        return { ...result, registers: { ...result.registers, '': deleted } }
    }

    if (operator === 'c') {
        const cCursor = offsetToPos(newText, Math.min(from, newText.length))
        const result = {
            ...state,
            text: newText,
            cursor: clampCursor(newText, cCursor, 'insert'),
            mode: 'insert' as VimMode,
            registers: { ...state.registers, '': deleted },
        }
        return result
    }

    if (operator === 'y') {
        const reg = cmd.register ?? ''
        return { ...state, registers: { ...state.registers, [reg]: deleted } }
    }

    if (operator === 'gu' || operator === 'gU') {
        return executeCaseChange(state, cmd, operator === 'gU')
    }

    return state
}

/** Execute v — enter visual char mode */
function executeVisualChar(state: EditorState): EditorState {
    return { ...state, mode: 'visual', visualStart: { ...state.cursor }, visualType: 'char' }
}

/** Execute V — enter visual line mode */
function executeVisualLine(state: EditorState): EditorState {
    const ls = lines(state.text)
    const lineContent = ls[state.cursor.line]
    return {
        ...state,
        mode: 'visual',
        visualStart: { line: state.cursor.line, col: 0 },
        cursor: { line: state.cursor.line, col: Math.max(0, lineContent.length - 1) },
        visualType: 'line',
    }
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
    const result = executeCommandInner(state, cmd)
    // Auto-scroll viewport to keep cursor visible after any command
    return ensureCursorVisible(result)
}

function executeCommandInner(state: EditorState, cmd: Command): EditorState {
    if (!cmd.valid) return state

    const raw = cmd.raw

    // ── Escape (always available, free) ──
    if (raw === 'Escape' || raw === 'Esc') return executeEscape(state)

    // ── Insert mode input (must come before undo/redo so 'u' types literal 'u') ──
    if (state.mode === 'insert') {
        if (raw === 'Backspace') return executeBackspace(state)
        // Regular text input in insert mode
        return executeInsertText(state, raw)
    }

    // ── Undo/Redo (normal/visual mode only) ──
    if (raw === 'u') return executeUndo(state)
    if (raw === 'Ctrl+R') return executeRedo(state)

    // ── Visual mode ──
    if (state.mode === 'visual') {
        // Motions extend selection
        if (cmd.motion && !cmd.operator) {
            if (cmd.motion === 'n')
                return {
                    ...executeSearchNext(state),
                    mode: 'visual',
                    visualStart: state.visualStart,
                    visualType: state.visualType,
                }
            if (cmd.motion === 'N')
                return {
                    ...executeSearchPrev(state),
                    mode: 'visual',
                    visualStart: state.visualStart,
                    visualType: state.visualType,
                }
            const newState = executeMotion(state, cmd)
            return {
                ...newState,
                mode: 'visual',
                visualStart: state.visualStart,
                visualType: state.visualType,
            }
        }

        // d/x — delete visual selection
        if (raw === 'd' || raw === 'x') {
            if (!state.visualStart) return { ...state, mode: 'normal' }

            const startLine = Math.min(state.visualStart.line, state.cursor.line)
            const endLine = Math.max(state.visualStart.line, state.cursor.line)

            // Visual block (Ctrl+v) — delete column range from each line
            if (state.visualType === 'block') {
                const ls = lines(state.text)
                const startCol = Math.min(state.visualStart.col, state.cursor.col)
                const endCol = Math.max(state.visualStart.col, state.cursor.col)
                const newLines = ls.map((line, i) => {
                    if (i >= startLine && i <= endLine) {
                        return line.slice(0, startCol) + line.slice(endCol + 1)
                    }
                    return line
                })
                const newText = join(newLines)
                const result = pushUndo(state, newText, { line: startLine, col: startCol }, 'normal', 1)
                return { ...result, mode: 'normal', visualStart: undefined, visualType: undefined }
            }

            // Visual line (V) — delete entire lines
            if (state.visualType === 'line') {
                const ls = lines(state.text)
                const deleted = ls.slice(startLine, endLine + 1).join('\n') + '\n'
                const newLines = [...ls.slice(0, startLine), ...ls.slice(endLine + 1)]
                if (newLines.length === 0) newLines.push('')
                const newText = join(newLines)
                const newLine = Math.min(startLine, newLines.length - 1)
                const result = pushUndo(state, newText, { line: newLine, col: 0 }, 'normal', 1)
                return {
                    ...result,
                    mode: 'normal',
                    visualStart: undefined,
                    visualType: undefined,
                    registers: { ...result.registers, '': deleted },
                }
            }

            // Visual char (v) — delete character range
            const {
                text: newText,
                cursor: newCursor,
                deleted,
            } = deleteRange(state.text, state.visualStart, state.cursor, true)
            const result = pushUndo(state, newText, newCursor, 'normal', 1)
            return {
                ...result,
                mode: 'normal',
                visualStart: undefined,
                visualType: undefined,
                registers: { ...result.registers, '': deleted },
            }
        }

        // y — yank visual selection
        if (raw === 'y') {
            if (!state.visualStart) return { ...state, mode: 'normal' }
            const ls = lines(state.text)

            // Visual line (V) — yank entire lines
            if (state.visualType === 'line') {
                const startLine = Math.min(state.visualStart.line, state.cursor.line)
                const endLine = Math.max(state.visualStart.line, state.cursor.line)
                const yanked = ls.slice(startLine, endLine + 1).join('\n') + '\n'
                return {
                    ...state,
                    mode: 'normal',
                    visualStart: undefined,
                    visualType: undefined,
                    cursor: { line: startLine, col: 0 },
                    registers: { ...state.registers, '': yanked },
                }
            }

            let fromOffset = 0
            for (let i = 0; i < state.visualStart.line; i++) fromOffset += ls[i].length + 1
            fromOffset += state.visualStart.col
            let toOffset = 0
            for (let i = 0; i < state.cursor.line; i++) toOffset += ls[i].length + 1
            toOffset += state.cursor.col
            if (fromOffset > toOffset) [fromOffset, toOffset] = [toOffset, fromOffset]
            const yanked = state.text.slice(fromOffset, toOffset + 1)
            return {
                ...state,
                mode: 'normal',
                visualStart: undefined,
                visualType: undefined,
                registers: { ...state.registers, '': yanked },
            }
        }

        // c — change visual selection (delete + enter insert)
        if (raw === 'c') {
            if (!state.visualStart) return { ...state, mode: 'normal' }

            const startLine = Math.min(state.visualStart.line, state.cursor.line)
            const endLine = Math.max(state.visualStart.line, state.cursor.line)

            // Visual line (V) — delete lines and enter insert on empty line
            if (state.visualType === 'line') {
                const ls = lines(state.text)
                const deleted = ls.slice(startLine, endLine + 1).join('\n') + '\n'
                const newLines = [...ls.slice(0, startLine), '', ...ls.slice(endLine + 1)]
                const newText = join(newLines)
                const result = pushUndo(state, newText, { line: startLine, col: 0 }, 'insert', 1)
                return {
                    ...result,
                    mode: 'insert',
                    visualStart: undefined,
                    visualType: undefined,
                    registers: { ...result.registers, '': deleted },
                }
            }

            // Visual char (v) — delete range and enter insert
            const {
                text: newText,
                cursor: newCursor,
                deleted,
            } = deleteRange(state.text, state.visualStart, state.cursor, true)
            const result = pushUndo(state, newText, newCursor, 'insert', 1)
            return {
                ...result,
                mode: 'insert',
                visualStart: undefined,
                visualType: undefined,
                registers: { ...result.registers, '': deleted },
            }
        }

        // > / < — indent/dedent visual selection
        if (raw === '>' || raw === '<') {
            if (!state.visualStart) return { ...state, mode: 'normal' }
            const startLine = Math.min(state.visualStart.line, state.cursor.line)
            const endLine = Math.max(state.visualStart.line, state.cursor.line)
            const ls = lines(state.text)
            const newLines = ls.map((line, i) => {
                if (i >= startLine && i <= endLine) {
                    if (raw === '>') return '  ' + line
                    // Dedent: remove up to 2 leading spaces
                    return line.replace(/^ {1,2}/, '')
                }
                return line
            })
            const newText = join(newLines)
            const result = pushUndo(state, newText, { line: startLine, col: 0 }, 'normal', 1)
            return { ...result, mode: 'normal', visualStart: undefined, visualType: undefined }
        }

        // v/V — toggle or switch visual mode
        if (raw === 'v') {
            if (state.visualType === 'char') {
                // v in char visual → exit visual
                return { ...state, mode: 'normal', visualStart: undefined, visualType: undefined }
            }
            // V/block visual → switch to char visual
            return { ...state, visualType: 'char' }
        }
        if (raw === 'V') {
            if (state.visualType === 'line') {
                // V in line visual → exit visual
                return { ...state, mode: 'normal', visualStart: undefined, visualType: undefined }
            }
            // char/block visual → switch to line visual
            const ls = lines(state.text)
            return {
                ...state,
                visualType: 'line',
                visualStart: { line: state.visualStart!.line, col: 0 },
                cursor: {
                    line: state.cursor.line,
                    col: Math.max(0, ls[state.cursor.line].length - 1),
                },
            }
        }

        // All other commands are not valid in visual mode — ignore
        return state
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

    // Delete line (dd)
    if (cmd.operator === 'd' && !cmd.motion && !cmd.textObject && raw.includes('dd')) {
        return executeDeleteLine(state, cmd.count ?? 1)
    }

    // Change line (cc)
    if (cmd.operator === 'c' && !cmd.motion && !cmd.textObject && raw.includes('cc')) {
        const ls = lines(state.text)
        const line = ls[state.cursor.line]
        const indent = line.match(/^(\s*)/)?.[1] ?? ''
        const newLines = [...ls]
        newLines[state.cursor.line] = indent
        const newText = join(newLines)
        return {
            ...state,
            text: newText,
            cursor: { line: state.cursor.line, col: indent.length },
            mode: 'insert',
            registers: { ...state.registers, '': line },
        }
    }

    // Yank line (yy)
    if (cmd.operator === 'y' && !cmd.motion && !cmd.textObject && raw.includes('yy')) {
        const ls = lines(state.text)
        const line = ls[state.cursor.line]
        return { ...state, registers: { ...state.registers, '': line + '\n' } }
    }

    // >> (indent)
    if (cmd.operator === '>' && raw.includes('>>')) {
        return executeIndent(state, cmd.count ?? 1)
    }

    // << (dedent)
    if (cmd.operator === '<' && raw.includes('<<')) {
        return executeDedent(state, cmd.count ?? 1)
    }

    // D — delete to end of line
    if (raw === 'D') return executeDeleteToEnd(state)

    // C — change to end of line
    if (raw === 'C') return executeChangeToEnd(state)

    // Y — yank line (same as yy in Vim)
    if (raw === 'Y') {
        const ls = lines(state.text)
        return { ...state, registers: { ...state.registers, '': ls[state.cursor.line] + '\n' } }
    }

    // J — join lines
    if (raw === 'J') return executeJoinLines(state)

    // p — paste after
    if (raw === 'p' || (cmd.register && raw.endsWith('p'))) {
        const reg = cmd.register ?? ''
        return executePaste(state, reg)
    }

    // P — paste before
    if (raw === 'P' || (cmd.register && raw.endsWith('P'))) {
        const reg = cmd.register ?? ''
        return executePasteBefore(state, reg)
    }

    // s — substitute character
    if (raw === 's') return executeSubstitute(state)

    // S — substitute line
    if (raw === 'S') return executeSubstituteLine(state)

    // . — dot repeat
    if (raw === '.') {
        if (state.lastCommand) {
            let result = executeCommand(state, state.lastCommand)
            // If the command entered insert mode and we have lastInsertText, type it
            if (result.mode === 'insert' && state.lastInsertText) {
                const entryState = { ...result }
                let charCount = 0
                for (const ch of state.lastInsertText) {
                    if (ch === '\n') {
                        result = executeInsertText(result, 'Enter')
                    } else {
                        result = executeInsertText(result, ch)
                    }
                    charCount++
                }
                result = finalizeInsertSession(result, entryState, charCount)
                result = executeEscape(result)
                // Preserve lastCommand and lastInsertText for repeated dots
                result = { ...result, lastCommand: state.lastCommand, lastInsertText: state.lastInsertText }
            }
            return result
        }
        return state
    }

    // v — visual character mode
    if (raw === 'v') return executeVisualChar(state)

    // V — visual line mode
    if (raw === 'V') return executeVisualLine(state)

    // Ctrl+v — visual block mode
    if (raw === 'Ctrl+v')
        return { ...state, mode: 'visual', visualStart: { ...state.cursor }, visualType: 'block' }

    // Ctrl+d — half page down
    if (raw === 'Ctrl+d') return executeHalfPageDown(state)

    // Ctrl+u — half page up
    if (raw === 'Ctrl+u') return executeHalfPageUp(state)

    // zz, zt, zb — viewport scroll
    if (raw === 'zz') return executeViewportZZ(state)
    if (raw === 'zt') return executeViewportZT(state)
    if (raw === 'zb') return executeViewportZB(state)

    // Search
    if (cmd.searchPattern !== undefined) return executeSearch(state, cmd.searchPattern)

    // Operator + text object (diw, ci", daw, etc.)
    if (cmd.operator && cmd.textObject) {
        return executeOperatorTextObject(state, cmd)
    }

    // Operator + motion (dw, de, db, cw, ct;, etc.)
    if (cmd.operator && cmd.motion) {
        return executeOperatorMotion(state, cmd)
    }

    // Pure motions (includes n, N, *, # when parsed as motions)
    if (cmd.motion && !cmd.operator) {
        if (cmd.motion === 'n') return executeSearchNext(state)
        if (cmd.motion === 'N') return executeSearchPrev(state)
        if (cmd.motion === '*') return executeSearchWordForward(state)
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
        damageAtEntry: 0, // stamped by usePlayEngine with actual cumulative damage
    }

    return {
        ...state,
        undoStack: [...entryState.undoStack, op],
        redoStack: [],
        lastInsertText: getInsertedText(entryState.text, state.text, entryState.cursor),
    }
}

/**
 * Extract the text that was inserted during an insert session.
 * Compares entry text with final text to determine what was typed.
 */
function getInsertedText(
    entryText: string,
    finalText: string,
    entryCursor: CursorPosition,
): string {
    // Convert entry cursor to offset
    const entryLines = lines(entryText)
    let entryOffset = 0
    for (let i = 0; i < entryCursor.line; i++) entryOffset += entryLines[i].length + 1
    entryOffset += entryCursor.col

    // Simple diff: text before cursor should be the same, text after should be the same
    // The inserted text is what's between
    const before = entryText.slice(0, entryOffset)
    const after = entryText.slice(entryOffset)

    if (finalText.startsWith(before) && finalText.endsWith(after)) {
        return finalText.slice(before.length, finalText.length - after.length)
    }

    // Fallback: return empty
    return ''
}
