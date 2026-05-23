import { describe, it, expect, beforeEach } from 'vitest'
import { CommandParser, parseKeys } from './commandParser'
import type { ParseResult } from './commandParser'

// ─── Helper ─────────────────────────────────────────────────────────

/** Feed multiple keys and return the final result */
function feedAll(parser: CommandParser, keys: string[]): ParseResult | null {
    let result: ParseResult | null = null
    for (const key of keys) {
        result = parser.feed(key)
        if (result) return result
    }
    return result
}

// ─── Basic motions ──────────────────────────────────────────────────

describe('basic motions', () => {
    let parser: CommandParser

    beforeEach(() => {
        parser = new CommandParser()
    })

    it.each(['h', 'j', 'k', 'l'])('%s parses as motion', (key) => {
        const r = parser.feed(key)!
        expect(r.command.valid).toBe(true)
        expect(r.command.motion).toBe(key)
        expect(r.command.raw).toBe(key)
        expect(r.damage).toBe(1)
    })

    it.each(['w', 'b', 'e'])('%s parses as word motion', (key) => {
        const r = parser.feed(key)!
        expect(r.command.valid).toBe(true)
        expect(r.command.motion).toBe(key)
        expect(r.damage).toBe(1)
    })

    it('0 parses as motion', () => {
        const r = parser.feed('0')!
        expect(r.command.valid).toBe(true)
        expect(r.command.motion).toBe('0')
    })

    it('$ parses as motion', () => {
        const r = parser.feed('$')!
        expect(r.command.valid).toBe(true)
        expect(r.command.motion).toBe('$')
    })

    it('G parses as motion', () => {
        const r = parser.feed('G')!
        expect(r.command.valid).toBe(true)
        expect(r.command.motion).toBe('G')
    })
})

// ─── Instant commands ───────────────────────────────────────────────

describe('instant commands', () => {
    let parser: CommandParser

    beforeEach(() => {
        parser = new CommandParser()
    })

    it('x parses as instant', () => {
        const r = parser.feed('x')!
        expect(r.command.valid).toBe(true)
        expect(r.command.raw).toBe('x')
        expect(r.damage).toBe(1)
    })

    it('i parses as instant', () => {
        const r = parser.feed('i')!
        expect(r.command.valid).toBe(true)
        expect(r.command.raw).toBe('i')
        expect(r.damage).toBe(1)
    })

    it('a parses as instant', () => {
        const r = parser.feed('a')!
        expect(r.command.valid).toBe(true)
        expect(r.command.raw).toBe('a')
        expect(r.damage).toBe(1)
    })
})

// ─── Always-allowed commands ────────────────────────────────────────

describe('always-allowed commands', () => {
    let parser: CommandParser

    beforeEach(() => {
        parser = new CommandParser()
    })

    it('u is free (0 damage)', () => {
        const r = parser.feed('u')!
        expect(r.command.valid).toBe(true)
        expect(r.command.raw).toBe('u')
        expect(r.damage).toBe(0)
    })

    it('Ctrl+R is free (0 damage)', () => {
        const r = parser.feed('Ctrl+R')!
        expect(r.command.valid).toBe(true)
        expect(r.damage).toBe(0)
    })

    it('Esc is free (0 damage)', () => {
        const r = parser.feed('Esc')!
        expect(r.command.valid).toBe(true)
        expect(r.damage).toBe(0)
    })
})

// ─── Count prefix ───────────────────────────────────────────────────

describe('count prefix', () => {
    let parser: CommandParser

    beforeEach(() => {
        parser = new CommandParser()
    })

    it('3l → invalid (count forbidden except {count}G)', () => {
        const r = feedAll(parser, ['3', 'l'])!
        expect(r.command.valid).toBe(false)
    })

    it('12j → invalid (count forbidden)', () => {
        const r = feedAll(parser, ['1', '2', 'j'])!
        expect(r.command.valid).toBe(false)
    })

    it('3x → invalid (count forbidden)', () => {
        const r = feedAll(parser, ['3', 'x'])!
        expect(r.command.valid).toBe(false)
    })

    it('3dw → invalid (count forbidden)', () => {
        const r = feedAll(parser, ['3', 'd', 'w'])!
        expect(r.command.valid).toBe(false)
    })

    it('42G → valid, count=42, motion=G', () => {
        const r = feedAll(parser, ['4', '2', 'G'])!
        expect(r.command.valid).toBe(true)
        expect(r.command.count).toBe(42)
        expect(r.command.motion).toBe('G')
        expect(r.damage).toBe(1)
    })

    it('5G → valid, count=5', () => {
        const r = feedAll(parser, ['5', 'G'])!
        expect(r.command.valid).toBe(true)
        expect(r.command.count).toBe(5)
        expect(r.command.motion).toBe('G')
    })

    it('3Esc → cancels count, emits Esc', () => {
        const r1 = parser.feed('3')
        expect(r1).toBeNull()
        const r2 = parser.feed('Esc')!
        expect(r2.command.valid).toBe(true)
        expect(r2.command.raw).toBe('Esc')
    })

    it('d3w → invalid (count after operator forbidden)', () => {
        const r = feedAll(parser, ['d', '3', 'w'])!
        expect(r.command.valid).toBe(false)
    })
})

// ─── Operator + motion ──────────────────────────────────────────────

describe('operator + motion', () => {
    let parser: CommandParser

    beforeEach(() => {
        parser = new CommandParser()
    })

    it('dw → operator=d, motion=w', () => {
        const r = feedAll(parser, ['d', 'w'])!
        expect(r.command.valid).toBe(true)
        expect(r.command.operator).toBe('d')
        expect(r.command.motion).toBe('w')
        expect(r.command.raw).toBe('dw')
        expect(r.damage).toBe(1)
    })

    it('de → operator=d, motion=e', () => {
        const r = feedAll(parser, ['d', 'e'])!
        expect(r.command.valid).toBe(true)
        expect(r.command.operator).toBe('d')
        expect(r.command.motion).toBe('e')
    })

    it('db → operator=d, motion=b', () => {
        const r = feedAll(parser, ['d', 'b'])!
        expect(r.command.valid).toBe(true)
        expect(r.command.operator).toBe('d')
        expect(r.command.motion).toBe('b')
    })

    it('d3w → invalid (count after operator forbidden)', () => {
        const r = feedAll(parser, ['d', '3', 'w'])!
        expect(r.command.valid).toBe(false)
    })

    it('dd → operator=d, line-wise delete', () => {
        const r = feedAll(parser, ['d', 'd'])!
        expect(r.command.valid).toBe(true)
        expect(r.command.operator).toBe('d')
        expect(r.command.raw).toBe('dd')
    })

    it('yy → operator=y', () => {
        const r = feedAll(parser, ['y', 'y'])!
        expect(r.command.valid).toBe(true)
        expect(r.command.operator).toBe('y')
    })

    it('2d3w → invalid (count forbidden)', () => {
        const r = feedAll(parser, ['2', 'd', '3', 'w'])!
        expect(r.command.valid).toBe(false)
    })
})

// ─── g prefix ───────────────────────────────────────────────────────

describe('g prefix', () => {
    let parser: CommandParser

    beforeEach(() => {
        parser = new CommandParser()
    })

    it('gg → motion=gg', () => {
        const r = feedAll(parser, ['g', 'g'])!
        expect(r.command.valid).toBe(true)
        expect(r.command.motion).toBe('gg')
    })

    it('gj → motion=gj', () => {
        const r = feedAll(parser, ['g', 'j'])!
        expect(r.command.valid).toBe(true)
        expect(r.command.motion).toBe('gj')
    })

    it('gk → motion=gk', () => {
        const r = feedAll(parser, ['g', 'k'])!
        expect(r.command.valid).toBe(true)
        expect(r.command.motion).toBe('gk')
    })

    it('gx → invalid', () => {
        const r = feedAll(parser, ['g', 'x'])!
        expect(r.command.valid).toBe(false)
    })
})

// ─── Hand restriction ───────────────────────────────────────────────

describe('hand restriction', () => {
    it('rejects commands not in hand', () => {
        const parser = new CommandParser(['h', 'l', 'x'])
        const r = parser.feed('j')!
        expect(r.command.valid).toBe(false)
        expect(r.damage).toBe(0)
    })

    it('allows commands in hand', () => {
        const parser = new CommandParser(['h', 'l', 'x'])
        const r = parser.feed('l')!
        expect(r.command.valid).toBe(true)
        expect(r.damage).toBe(1)
    })

    it('u always allowed even if not in hand', () => {
        const parser = new CommandParser(['h', 'l'])
        const r = parser.feed('u')!
        expect(r.command.valid).toBe(true)
        expect(r.damage).toBe(0)
    })

    it('Esc always allowed even if not in hand', () => {
        const parser = new CommandParser(['h', 'l'])
        const r = parser.feed('Esc')!
        expect(r.command.valid).toBe(true)
    })

    it('Ctrl+R always allowed even if not in hand', () => {
        const parser = new CommandParser(['h', 'l'])
        const r = parser.feed('Ctrl+R')!
        expect(r.command.valid).toBe(true)
    })

    it('dw rejected when not in hand', () => {
        const parser = new CommandParser(['h', 'l', 'd'])
        const r = feedAll(parser, ['d', 'w'])!
        expect(r.command.valid).toBe(false)
        expect(r.damage).toBe(0)
    })

    it('dw allowed when in hand', () => {
        const parser = new CommandParser(['h', 'l', 'dw'])
        const r = feedAll(parser, ['d', 'w'])!
        expect(r.command.valid).toBe(true)
        expect(r.damage).toBe(1)
    })

    it('no restriction when availableCommands is undefined', () => {
        const parser = new CommandParser(undefined)
        const r = parser.feed('j')!
        expect(r.command.valid).toBe(true)
    })
})

// ─── Parser reset ───────────────────────────────────────────────────

describe('parser state management', () => {
    it('resets after completed command', () => {
        const parser = new CommandParser()
        parser.feed('l')
        expect(parser.getState()).toBe('idle')
    })

    it('stays in operatorPending after d', () => {
        const parser = new CommandParser()
        parser.feed('d')
        expect(parser.getState()).toBe('operatorPending')
    })

    it('resets after dw completes', () => {
        const parser = new CommandParser()
        parser.feed('d')
        parser.feed('w')
        expect(parser.getState()).toBe('idle')
    })

    it('Esc cancels pending operator', () => {
        const parser = new CommandParser()
        parser.feed('d')
        expect(parser.getState()).toBe('operatorPending')
        const r = parser.feed('Esc')!
        expect(r.command.raw).toBe('Esc')
        expect(parser.getState()).toBe('idle')
    })

    it('manual reset clears state', () => {
        const parser = new CommandParser()
        parser.feed('d')
        parser.reset()
        expect(parser.getState()).toBe('idle')
    })
})

// ─── Callback ───────────────────────────────────────────────────────

describe('callback', () => {
    it('fires onResult callback', () => {
        const results: ParseResult[] = []
        const parser = new CommandParser(undefined, (r) => results.push(r))
        parser.feed('l')
        parser.feed('j')
        expect(results).toHaveLength(2)
        expect(results[0].command.motion).toBe('l')
        expect(results[1].command.motion).toBe('j')
    })
})

// ─── parseKeys convenience ──────────────────────────────────────────

describe('parseKeys convenience', () => {
    it('parses single motion', () => {
        const r = parseKeys(['l'])!
        expect(r.command.valid).toBe(true)
        expect(r.command.motion).toBe('l')
    })

    it('parses dw', () => {
        const r = parseKeys(['d', 'w'])!
        expect(r.command.valid).toBe(true)
        expect(r.command.operator).toBe('d')
        expect(r.command.motion).toBe('w')
    })

    it('parses 3l → invalid (count forbidden)', () => {
        const r = parseKeys(['3', 'l'])!
        expect(r.command.valid).toBe(false)
    })

    it('parses 5G → valid', () => {
        const r = parseKeys(['5', 'G'])!
        expect(r.command.valid).toBe(true)
        expect(r.command.count).toBe(5)
        expect(r.command.motion).toBe('G')
    })

    it('parses with hand restriction', () => {
        const r = parseKeys(['j'], ['h', 'l'])!
        expect(r.command.valid).toBe(false)
    })
})

// ─── Insert mode passthrough ────────────────────────────────────────

describe('insert mode passthrough', () => {
    let parser: CommandParser

    beforeEach(() => {
        parser = new CommandParser()
    })

    it('single character passes through (0 damage)', () => {
        const r = parser.feed('a')!
        // 'a' is an instant command, so damage=1
        expect(r.command.valid).toBe(true)
    })

    it('Backspace passes through', () => {
        const r = parser.feed('Backspace')!
        expect(r.command.valid).toBe(true)
        expect(r.command.raw).toBe('Backspace')
        expect(r.damage).toBe(0)
    })

    it('Enter passes through', () => {
        const r = parser.feed('Enter')!
        expect(r.command.valid).toBe(true)
        expect(r.command.raw).toBe('Enter')
        expect(r.damage).toBe(0)
    })
})
