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
])

/** Commands that bypass hand restriction */
const ALWAYS_ALLOWED = new Set<string>(['u', 'Ctrl+R', 'Esc'])

const OPERATORS = new Set<string>(['d', 'c', 'y', '>', '<'])

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
    return available.includes(commandKey)
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
    private availableCommands: string[] | undefined = undefined
    private onResult: ((result: ParseResult) => void) | undefined = undefined

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
    }

    /** Get current parser state */
    getState(): ParserState {
        return this.state
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
        if (isDigit(key)) {
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

        // Operator after count
        if (OPERATORS.has(key)) {
            this.operator = key as Operator
            this.state = 'operatorPending'
            return null
        }

        // g prefix after count
        if (key === 'g') {
            this.state = 'gPending'
            return null
        }

        // r prefix after count
        if (key === 'r') {
            if (!isInHand('r', this.availableCommands)) {
                return this.emitInvalid(this.buffer)
            }
            this.state = 'rPending'
            return null
        }

        // Simple motion with count
        if (SIMPLE_MOTIONS.has(key)) {
            const raw = this.buffer
            if (!isInHand(key, this.availableCommands)) {
                return this.emitInvalid(raw)
            }
            return this.emit(
                { raw, motion: key as Motion, count: this.countPrefix, valid: true },
                1,
            )
        }

        // Instant with count
        if (INSTANT_COMMANDS.has(key)) {
            const raw = this.buffer
            if (!isInHand(key, this.availableCommands)) {
                return this.emitInvalid(raw)
            }
            return this.emit(
                { raw, count: this.countPrefix, valid: true },
                1,
            )
        }

        // Esc cancels
        if (key === 'Esc') {
            return this.emit({ raw: 'Esc', valid: true }, 0)
        }

        return this.emitInvalid(this.buffer)
    }

    private handleOperatorPending(key: string): ParseResult | null {
        this.buffer += key

        // Digit after operator (e.g. d3w)
        if (isDigit(key)) {
            this.countAfterOp = parseInt(key, 10)
            this.state = 'opNumberPrefix'
            return null
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
}

// ─── State type ─────────────────────────────────────────────────────

type ParserState =
    | 'idle'
    | 'numberPrefix'
    | 'operatorPending'
    | 'opNumberPrefix'
    | 'gPending'
    | 'rPending'

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
