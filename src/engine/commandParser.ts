/**
 * commandParser — XState v5 state machine that parses keystroke sequences
 * into Command objects.
 *
 * Scope (S5 initial): h/j/k/l, w/b/e, x/u/Ctrl+R, i/a/Esc, d+motion(dw/de/db)
 * Plus numeric prefix support (e.g. 3l, 2dw, d3w).
 *
 * Supports hand restriction: keys not in availableCommands are rejected
 * with valid=false (u/Ctrl+R/Esc always bypass).
 */

import type { Command, Operator, Motion } from '../types/command'

// ─── Internal types ─────────────────────────────────────────────────

// ─── Result ─────────────────────────────────────────────────────────

/** Result emitted when a parse completes or is rejected */
export interface ParseResult {
    command: Command
    /** Number of damage points (0 for invalid/unavailable commands) */
    damage: number
}

// ─── Constants ──────────────────────────────────────────────────────

const SIMPLE_MOTIONS = new Set<string>([
    'h', 'j', 'k', 'l',
    'w', 'b', 'e',
    'W', 'B', 'E',
    '0', '$', '^',
    'G',
    ';', ',',
    '%',
    'n', 'N',
])

const INSTANT_COMMANDS = new Set<string>([
    'x', 'X', 'p', 'P',
    'J', '~', '.',
    'o', 'O',
    'i', 'a', 'I', 'A',
    'u',
    'D', 'C', 'Y',
    'dd', 'cc', 'yy',
    's', 'S',
    'v', 'V',
])

/** Commands that bypass hand restriction */
const ALWAYS_ALLOWED = new Set<string>(['u', 'Ctrl+R', 'Esc'])

const OPERATORS = new Set<string>(['d', 'c', 'y', '>', '<'])

/** Text object modifiers (what comes after i/a in operator+textobj) */
const TEXT_OBJ_TARGETS = new Set<string>(['w', '"', "'", '(', ')', '{', '}', '[', ']', '<', '>', 't'])

// ─── Guard helpers ──────────────────────────────────────────────────

function isDigit(key: string): boolean {
    return key.length === 1 && key >= '1' && key <= '9'
}

function isDigitOrZero(key: string): boolean {
    return key.length === 1 && key >= '0' && key <= '9'
}

/** Check if the resolved command key is in the available hand */
function isInHand(
    commandKey: string,
    available: string[] | undefined,
): boolean {
    if (available === undefined) return true
    if (ALWAYS_ALLOWED.has(commandKey)) return true
    if (available.includes(commandKey)) return true
    // If a standalone base operator is in hand, allow operator+any motion/textobj
    // Only for multi-char operators (gU, gu) and yank (y) where stages list the base only
    const expandableOperators = ['gU', 'gu', 'y']
    for (const op of expandableOperators) {
        if (commandKey.startsWith(op) && commandKey.length > op.length && available.includes(op)) {
            return true
        }
    }
    return false
}

// ─── Merge counts ───────────────────────────────────────────────────

function mergeCount(
    countPrefix: number | undefined,
    countAfterOp: number | undefined,
): number | undefined {
    if (countPrefix !== undefined && countAfterOp !== undefined) {
        return countPrefix * countAfterOp
    }
    return countPrefix ?? countAfterOp
}

// ─── CommandParser class ────────────────────────────────────────────

export class CommandParser {
    private state: ParserState = 'idle'
    private buffer = ''
    private countPrefix: number | undefined = undefined
    private countAfterOp: number | undefined = undefined
    private operator: Operator | undefined = undefined
    private textobjPrefix: string | undefined = undefined
    private searchBuffer: string = ''
    private registerName: string | undefined = undefined
    private availableCommands: string[] | undefined = undefined
    private onResult: ((result: ParseResult) => void) | undefined = undefined
    private editorMode: 'normal' | 'visual' | 'insert' = 'normal'

    constructor(
        availableCommands?: string[],
        onResult?: (result: ParseResult) => void,
    ) {
        this.availableCommands = availableCommands
        this.onResult = onResult
    }

    /** Update hand cards */
    setAvailableCommands(commands: string[] | undefined): void {
        this.availableCommands = commands
    }

    /** Set editor mode so parser can adjust behavior (e.g. visual mode d/x/y) */
    setEditorMode(mode: 'normal' | 'visual' | 'insert'): void {
        this.editorMode = mode
    }

    /** Set result callback */
    setOnResult(cb: (result: ParseResult) => void): void {
        this.onResult = cb
    }

    /** Reset parser to idle */
    reset(): void {
        this.state = 'idle'
        this.buffer = ''
        this.countPrefix = undefined
        this.countAfterOp = undefined
        this.operator = undefined
        this.textobjPrefix = undefined
        this.searchBuffer = ''
        this.registerName = undefined
    }

    /** Get current parser state */
    getState(): ParserState {
        return this.state
    }

    /** Get display string for current buffer (for UI display) */
    getDisplayBuffer(): string {
        if (this.state === 'searchInput') {
            return '/' + this.searchBuffer
        }
        return this.buffer
    }

    /** Feed a single key event to the parser */
    feed(key: string): ParseResult | null {
        const result = this.transition(key)
        if (result && this.onResult) {
            this.onResult(result)
        }
        return result
    }

    private emit(command: Command, damage: number): ParseResult {
        // Attach register if one was set
        if (this.registerName && !command.register) {
            command = { ...command, register: this.registerName }
        }
        const result: ParseResult = { command, damage }
        this.reset()
        return result
    }

    private emitInvalid(raw: string): ParseResult {
        return this.emit({ raw, valid: false }, 0)
    }

    private transition(key: string): ParseResult | null {
        switch (this.state) {
            case 'idle':
                return this.handleIdle(key)
            case 'numberPrefix':
                return this.handleNumberPrefix(key)
            case 'operatorPending':
                return this.handleOperatorPending(key)
            case 'opNumberPrefix':
                return this.handleOpNumberPrefix(key)
            case 'gPending':
                return this.handleGPending(key)
            case 'rPending':
                return this.handleRPending(key)
            case 'fPending':
                return this.handleFPending(key)
            case 'textobjPending':
                return this.handleTextobjPending(key)
            case 'searchInput':
                return this.handleSearchInput(key)
            case 'guPending':
                return this.handleGuPending(key)
            case 'gUPending':
                return this.handleGUPending(key)
            case 'zPending':
                return this.handleZPending(key)
            case 'registerPending':
                return this.handleRegisterPending(key)
            case 'registerAction':
                return this.handleRegisterAction(key)
            default:
                this.reset()
                return null
        }
    }

    // ─── State handlers ─────────────────────────────────────────────

    private handleIdle(key: string): ParseResult | null {
        this.buffer = key

        // Esc — always valid, mode-switch handled by executor
        if (key === 'Esc') {
            return this.emit({ raw: 'Esc', valid: true }, 0)
        }

        // Ctrl+R — always valid
        if (key === 'Ctrl+R') {
            return this.emit({ raw: 'Ctrl+R', valid: true }, 0)
        }

        // u — always valid (free undo)
        if (key === 'u') {
            return this.emit({ raw: 'u', valid: true }, 0)
        }

        // Digit → number prefix (not 0, which is a motion)
        // Only enter number prefix mode if G is in hand (since {count}G is the only allowed count command)
        if (isDigit(key)) {
            if (!isInHand('G', this.availableCommands)) {
                return null  // silently ignore digits when G is not available
            }
            this.countPrefix = parseInt(key, 10)
            this.state = 'numberPrefix'
            return null
        }

        // g prefix
        if (key === 'g') {
            this.state = 'gPending'
            return null
        }

        // r prefix (replace char)
        if (key === 'r') {
            if (!isInHand('r', this.availableCommands)) {
                return this.emitInvalid('r')
            }
            this.state = 'rPending'
            return null
        }

        // f/F/t/T prefix (find/til char)
        if (key === 'f' || key === 'F' || key === 't' || key === 'T') {
            if (!isInHand(key, this.availableCommands)) {
                return this.emitInvalid(key)
            }
            this.state = 'fPending'
            return null
        }

        // Register prefix ("a, "b, etc.)
        if (key === '"') {
            this.state = 'registerPending'
            return null
        }

        // / — search
        if (key === '/') {
            if (!isInHand('/', this.availableCommands)) {
                return this.emitInvalid('/')
            }
            this.searchBuffer = ''
            this.state = 'searchInput'
            return null
        }

        // z prefix (zz, zt, zb)
        if (key === 'z') {
            this.state = 'zPending'
            return null
        }

        // Ctrl+d, Ctrl+u
        if (key === 'Ctrl+d' || key === 'Ctrl+u') {
            if (!isInHand(key, this.availableCommands)) {
                return this.emitInvalid(key)
            }
            return this.emit({ raw: key, valid: true }, 1)
        }

        // Ctrl+v (visual block)
        if (key === 'Ctrl+v') {
            if (!isInHand(key, this.availableCommands)) {
                return this.emitInvalid(key)
            }
            return this.emit({ raw: key, valid: true }, 1)
        }

        // * and # (word under cursor search)
        if (key === '*' || key === '#') {
            if (!isInHand(key, this.availableCommands)) {
                return this.emitInvalid(key)
            }
            return this.emit({ raw: key, motion: key as Motion, valid: true }, 1)
        }

        // >> and << (indent/dedent) — first > or < enters operator
        // Operator handling below will catch >/< and go to operatorPending

        // In visual mode, d/x/y/c are instant commands (operate on selection)
        if (this.editorMode === 'visual' && (key === 'd' || key === 'x' || key === 'y' || key === 'c')) {
            return this.emit({ raw: key, valid: true }, 1)
        }

        // Operator
        if (OPERATORS.has(key)) {
            this.operator = key as Operator
            this.state = 'operatorPending'
            return null
        }

        // Simple motion
        if (SIMPLE_MOTIONS.has(key)) {
            const cmd: Command = {
                raw: key,
                motion: key as Motion,
                valid: true,
            }
            if (!isInHand(key, this.availableCommands)) {
                return this.emitInvalid(key)
            }
            return this.emit(cmd, 1)
        }

        // Instant commands
        if (INSTANT_COMMANDS.has(key)) {
            if (!isInHand(key, this.availableCommands)) {
                return this.emitInvalid(key)
            }
            return this.emit({ raw: key, valid: true }, 1)
        }

        // Insert mode key passthrough (when parser is used in insert mode,
        // the executor handles these, but the parser just passes through)
        if (key === 'Backspace' || key === 'Enter') {
            return this.emit({ raw: key, valid: true }, 0)
        }

        // Unknown key — single printable character in insert mode
        // passed through; in normal mode treated as invalid
        if (key.length === 1) {
            return this.emit({ raw: key, valid: true }, 0)
        }

        return this.emitInvalid(key)
    }

    private handleNumberPrefix(key: string): ParseResult | null {
        this.buffer += key

        // Continue accumulating digits
        if (isDigitOrZero(key)) {
            this.countPrefix = this.countPrefix! * 10 + parseInt(key, 10)
            return null
        }

        // {count}G is the ONLY allowed count command
        if (key === 'G') {
            const raw = this.buffer
            if (!isInHand('G', this.availableCommands)) {
                return this.emitInvalid(raw)
            }
            return this.emit(
                { raw, motion: 'G' as Motion, count: this.countPrefix, valid: true },
                1,
            )
        }

        // Esc cancels
        if (key === 'Esc') {
            return this.emit({ raw: 'Esc', valid: true }, 0)
        }

        // Everything else after count is invalid
        return this.emitInvalid(this.buffer)
    }

    private handleOperatorPending(key: string): ParseResult | null {
        this.buffer += key

        // Digit after operator (e.g. d3w) — count is forbidden
        if (isDigit(key)) {
            return this.emitInvalid(this.buffer)
        }

        // Same operator doubled (dd, cc, yy)
        if (key === this.operator) {
            const raw = this.buffer
            const doubled = `${this.operator}${this.operator}` as string
            if (!isInHand(doubled, this.availableCommands)) {
                return this.emitInvalid(raw)
            }
            const count = mergeCount(this.countPrefix, this.countAfterOp)
            return this.emit(
                { raw, operator: this.operator, count, valid: true },
                1,
            )
        }

        // Motion after operator
        if (SIMPLE_MOTIONS.has(key)) {
            const raw = this.buffer
            const cmdKey = `${this.operator}${key}`
            if (!isInHand(cmdKey, this.availableCommands)) {
                return this.emitInvalid(raw)
            }
            const count = mergeCount(this.countPrefix, this.countAfterOp)
            return this.emit(
                {
                    raw,
                    operator: this.operator,
                    motion: key as Motion,
                    count,
                    valid: true,
                },
                1,
            )
        }

        // Text object prefix (i/a after operator → textobjPending)
        // For now, not in S5 scope but structurally supported

        // f/F/t/T after operator (e.g., df(, dt;)
        if (key === 'f' || key === 'F' || key === 't' || key === 'T') {
            const cmdKey = `${this.operator}${key}`
            if (!isInHand(cmdKey, this.availableCommands)) {
                return this.emitInvalid(this.buffer)
            }
            this.state = 'fPending'
            return null
        }

        // Text object prefix (i/a after operator → textobjPending)
        if (key === 'i' || key === 'a') {
            this.textobjPrefix = key
            this.state = 'textobjPending'
            return null
        }

        // Esc cancels
        if (key === 'Esc') {
            return this.emit({ raw: 'Esc', valid: true }, 0)
        }

        return this.emitInvalid(this.buffer)
    }

    private handleOpNumberPrefix(key: string): ParseResult | null {
        this.buffer += key

        // Continue accumulating digits
        if (isDigitOrZero(key)) {
            this.countAfterOp = this.countAfterOp! * 10 + parseInt(key, 10)
            return null
        }

        // Motion after operator + count
        if (SIMPLE_MOTIONS.has(key)) {
            const raw = this.buffer
            const cmdKey = `${this.operator}${key}`
            if (!isInHand(cmdKey, this.availableCommands)) {
                return this.emitInvalid(raw)
            }
            const count = mergeCount(this.countPrefix, this.countAfterOp)
            return this.emit(
                {
                    raw,
                    operator: this.operator,
                    motion: key as Motion,
                    count,
                    valid: true,
                },
                1,
            )
        }

        // Text object after operator + count
        if (key === 'i' || key === 'a') {
            this.textobjPrefix = key
            this.state = 'textobjPending'
            return null
        }

        // Esc cancels
        if (key === 'Esc') {
            return this.emit({ raw: 'Esc', valid: true }, 0)
        }

        return this.emitInvalid(this.buffer)
    }

    private handleGPending(key: string): ParseResult | null {
        this.buffer += key

        // gg — go to first line
        if (key === 'g') {
            const raw = this.buffer
            if (!isInHand('gg', this.availableCommands)) {
                return this.emitInvalid(raw)
            }
            const count = mergeCount(this.countPrefix, this.countAfterOp)
            return this.emit(
                { raw, motion: 'gg' as Motion, count, valid: true },
                1,
            )
        }

        // gj, gk
        if (key === 'j' || key === 'k') {
            const raw = this.buffer
            const motionKey = `g${key}` as Motion
            if (!isInHand(motionKey, this.availableCommands)) {
                return this.emitInvalid(raw)
            }
            const count = mergeCount(this.countPrefix, this.countAfterOp)
            return this.emit(
                { raw, motion: motionKey, count, valid: true },
                1,
            )
        }

        // gu (lowercase)
        if (key === 'u') {
            if (!isInHand('gu', this.availableCommands)) {
                return this.emitInvalid(this.buffer)
            }
            this.state = 'guPending'
            return null
        }

        // gU (uppercase)
        if (key === 'U') {
            if (!isInHand('gU', this.availableCommands)) {
                return this.emitInvalid(this.buffer)
            }
            this.state = 'gUPending'
            return null
        }

        // Esc cancels
        if (key === 'Esc') {
            return this.emit({ raw: 'Esc', valid: true }, 0)
        }

        return this.emitInvalid(this.buffer)
    }

    private handleRPending(key: string): ParseResult | null {
        this.buffer += key

        // Esc cancels
        if (key === 'Esc') {
            return this.emit({ raw: 'Esc', valid: true }, 0)
        }

        // Any single character → replace command
        if (key.length === 1) {
            const raw = this.buffer
            const count = mergeCount(this.countPrefix, this.countAfterOp)
            return this.emit(
                { raw, char: key, count, valid: true },
                1,
            )
        }

        return this.emitInvalid(this.buffer)
    }

    private handleFPending(key: string): ParseResult | null {
        this.buffer += key

        // Esc cancels
        if (key === 'Esc') {
            return this.emit({ raw: 'Esc', valid: true }, 0)
        }

        // Any single character → f/F/t/T + char motion (or operator+motion)
        if (key.length === 1) {
            const raw = this.buffer
            const count = mergeCount(this.countPrefix, this.countAfterOp)
            // The motion letter is the first char of buffer (or after operator/count prefix)
            const motionLetter = this.operator
                ? raw[raw.length - 2]  // e.g., "df(" → 'f'
                : (this.countPrefix !== undefined ? raw[String(this.countPrefix).length] : raw[0])
            if (this.operator) {
                return this.emit(
                    { raw, operator: this.operator, motion: motionLetter as Motion, char: key, count, valid: true },
                    1,
                )
            }
            return this.emit(
                { raw, motion: motionLetter as Motion, char: key, count, valid: true },
                1,
            )
        }

        return this.emitInvalid(this.buffer)
    }

    private handleTextobjPending(key: string): ParseResult | null {
        this.buffer += key

        // Esc cancels
        if (key === 'Esc') {
            return this.emit({ raw: 'Esc', valid: true }, 0)
        }

        if (TEXT_OBJ_TARGETS.has(key)) {
            const raw = this.buffer
            const textObj = `${this.textobjPrefix}${key}` as import('../types/command').TextObject
            const cmdKey = `${this.operator}${textObj}`
            if (!isInHand(cmdKey, this.availableCommands)) {
                return this.emitInvalid(raw)
            }
            const count = mergeCount(this.countPrefix, this.countAfterOp)
            return this.emit(
                { raw, operator: this.operator, textObject: textObj, count, valid: true },
                1,
            )
        }

        return this.emitInvalid(this.buffer)
    }

    private handleSearchInput(key: string): ParseResult | null {
        // Esc cancels search
        if (key === 'Esc') {
            this.buffer = 'Esc'
            return this.emit({ raw: 'Esc', valid: true }, 0)
        }

        // Backspace removes last char
        if (key === 'Backspace') {
            if (this.searchBuffer.length > 0) {
                this.searchBuffer = this.searchBuffer.slice(0, -1)
            }
            return null
        }

        // Enter confirms search
        if (key === 'Enter') {
            const raw = `/${this.searchBuffer}`
            return this.emit(
                { raw, searchPattern: this.searchBuffer, valid: true },
                1,
            )
        }

        // Accumulate search pattern
        if (key.length === 1) {
            this.searchBuffer += key
            return null
        }

        return null
    }

    private handleGuPending(key: string): ParseResult | null {
        this.buffer += key

        if (key === 'Esc') {
            return this.emit({ raw: 'Esc', valid: true }, 0)
        }

        // gu + text object (gui/gua → textobj pending with gu operator)
        if (key === 'i' || key === 'a') {
            this.operator = 'gu'
            this.textobjPrefix = key
            this.state = 'textobjPending'
            return null
        }

        // gu + motion
        if (SIMPLE_MOTIONS.has(key)) {
            const raw = this.buffer
            const cmdKey = `gu${key}`
            if (!isInHand(cmdKey, this.availableCommands)) {
                return this.emitInvalid(raw)
            }
            const count = mergeCount(this.countPrefix, this.countAfterOp)
            return this.emit(
                { raw, operator: 'gu', motion: key as Motion, count, valid: true },
                1,
            )
        }

        return this.emitInvalid(this.buffer)
    }

    private handleGUPending(key: string): ParseResult | null {
        this.buffer += key

        if (key === 'Esc') {
            return this.emit({ raw: 'Esc', valid: true }, 0)
        }

        // gU + text object
        if (key === 'i' || key === 'a') {
            this.operator = 'gU'
            this.textobjPrefix = key
            this.state = 'textobjPending'
            return null
        }

        // gU + motion
        if (SIMPLE_MOTIONS.has(key)) {
            const raw = this.buffer
            const cmdKey = `gU${key}`
            if (!isInHand(cmdKey, this.availableCommands)) {
                return this.emitInvalid(raw)
            }
            const count = mergeCount(this.countPrefix, this.countAfterOp)
            return this.emit(
                { raw, operator: 'gU', motion: key as Motion, count, valid: true },
                1,
            )
        }

        return this.emitInvalid(this.buffer)
    }

    private handleZPending(key: string): ParseResult | null {
        this.buffer += key

        if (key === 'Esc') {
            return this.emit({ raw: 'Esc', valid: true }, 0)
        }

        if (key === 'z' || key === 't' || key === 'b') {
            const raw = this.buffer
            const cmdKey = `z${key}`
            if (!isInHand(cmdKey, this.availableCommands)) {
                return this.emitInvalid(raw)
            }
            return this.emit({ raw: cmdKey, valid: true }, 1)
        }

        return this.emitInvalid(this.buffer)
    }

    private handleRegisterPending(key: string): ParseResult | null {
        this.buffer += key

        if (key === 'Esc') {
            return this.emit({ raw: 'Esc', valid: true }, 0)
        }

        // Register name is a-z, A-Z, 0-9
        if (/^[a-zA-Z0-9]$/.test(key)) {
            // Check if register is in hand (e.g., "a → check '"a')
            const regKey = `"${key}`
            if (!isInHand(regKey, this.availableCommands)) {
                return this.emitInvalid(this.buffer)
            }
            this.registerName = key
            // After register, expect the next command (y, d, p, P, etc.)
            // Reset state to idle but keep register name
            this.state = 'registerAction'
            return null
        }

        return this.emitInvalid(this.buffer)
    }

    private handleRegisterAction(key: string): ParseResult | null {
        this.buffer += key

        // Handle y, d, c operators after register
        if (OPERATORS.has(key)) {
            this.operator = key as Operator
            this.state = 'operatorPending'
            return null
        }

        // Handle p, P after register
        if (key === 'p' || key === 'P') {
            const raw = this.buffer
            return this.emit({ raw, register: this.registerName, valid: true }, 1)
        }

        // Handle yy, dd after register
        if (key === 'y' || key === 'd') {
            // Check if this is operator start (handled above for single y/d since they're operators)
            // This shouldn't be reached since y/d are OPERATORS
        }

        return this.emitInvalid(this.buffer)
    }
}

// ─── State type ─────────────────────────────────────────────────────

type ParserState =
    | 'idle'
    | 'numberPrefix'
    | 'operatorPending'
    | 'opNumberPrefix'
    | 'gPending'
    | 'rPending'
    | 'fPending'
    | 'textobjPending'
    | 'searchInput'
    | 'guPending'
    | 'gUPending'
    | 'zPending'
    | 'registerPending'
    | 'registerAction'

// ─── Convenience: one-shot parse ────────────────────────────────────

/**
 * Parse a complete key sequence into a Command.
 * For simple single-key or well-known sequences.
 * Returns the final ParseResult after feeding all keys.
 */
export function parseKeys(
    keys: string[],
    availableCommands?: string[],
): ParseResult | null {
    const parser = new CommandParser(availableCommands)
    let result: ParseResult | null = null
    for (const key of keys) {
        result = parser.feed(key)
        if (result) return result
    }
    return result
}
