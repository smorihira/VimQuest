import { describe, it, expect } from 'vitest'
import { executeCommand, finalizeInsertSession } from './commandExecutor'
import { createEditorState } from '../types/editor'
import type { EditorState } from '../types/editor'
import type { Command } from '../types/command'

// ─── Helpers ────────────────────────────────────────────────────────

/** Create a simple motion command */
function motion(raw: string, m: string, count?: number): Command {
  return { raw, motion: m as Command['motion'], count, valid: true }
}

/** Create an operator+motion command */
function opMotion(raw: string, op: string, m: string, count?: number): Command {
  return {
    raw,
    operator: op as Command['operator'],
    motion: m as Command['motion'],
    count,
    valid: true,
  }
}

/** Simple command (x, u, i, a, Esc, etc.) */
function simple(raw: string): Command {
  return { raw, valid: true }
}

// ─── Basic Movement (h/j/k/l) ──────────────────────────────────────

describe('h/j/k/l basic movement', () => {
  it('l moves cursor right', () => {
    const state = createEditorState('hello', { line: 0, col: 0 })
    const next = executeCommand(state, motion('l', 'l'))
    expect(next.cursor).toEqual({ line: 0, col: 1 })
  })

  it('l stops at line end', () => {
    const state = createEditorState('hi', { line: 0, col: 1 })
    const next = executeCommand(state, motion('l', 'l'))
    expect(next.cursor).toEqual({ line: 0, col: 1 })
  })

  it('h moves cursor left', () => {
    const state = createEditorState('hello', { line: 0, col: 3 })
    const next = executeCommand(state, motion('h', 'h'))
    expect(next.cursor).toEqual({ line: 0, col: 2 })
  })

  it('h stops at column 0', () => {
    const state = createEditorState('hello', { line: 0, col: 0 })
    const next = executeCommand(state, motion('h', 'h'))
    expect(next.cursor).toEqual({ line: 0, col: 0 })
  })

  it('j moves cursor down', () => {
    const state = createEditorState('abc\ndef', { line: 0, col: 1 })
    const next = executeCommand(state, motion('j', 'j'))
    expect(next.cursor).toEqual({ line: 1, col: 1 })
  })

  it('j clamps to shorter line', () => {
    const state = createEditorState('abcde\nhi', { line: 0, col: 4 })
    const next = executeCommand(state, motion('j', 'j'))
    expect(next.cursor).toEqual({ line: 1, col: 1 })
  })

  it('j stops at last line', () => {
    const state = createEditorState('abc\ndef', { line: 1, col: 0 })
    const next = executeCommand(state, motion('j', 'j'))
    expect(next.cursor).toEqual({ line: 1, col: 0 })
  })

  it('k moves cursor up', () => {
    const state = createEditorState('abc\ndef', { line: 1, col: 1 })
    const next = executeCommand(state, motion('k', 'k'))
    expect(next.cursor).toEqual({ line: 0, col: 1 })
  })

  it('k stops at first line', () => {
    const state = createEditorState('abc\ndef', { line: 0, col: 0 })
    const next = executeCommand(state, motion('k', 'k'))
    expect(next.cursor).toEqual({ line: 0, col: 0 })
  })

  it('count prefix: 3l moves 3 right', () => {
    const state = createEditorState('hello world', { line: 0, col: 0 })
    const next = executeCommand(state, motion('3l', 'l', 3))
    expect(next.cursor).toEqual({ line: 0, col: 3 })
  })
})

// ─── Word Movement (w/b/e) ──────────────────────────────────────────

describe('w/b/e word movement', () => {
  it('w moves to next word start', () => {
    const state = createEditorState('hello world', { line: 0, col: 0 })
    const next = executeCommand(state, motion('w', 'w'))
    expect(next.cursor).toEqual({ line: 0, col: 6 })
  })

  it('w skips punctuation', () => {
    const state = createEditorState('foo.bar', { line: 0, col: 0 })
    const next = executeCommand(state, motion('w', 'w'))
    // foo -> . (punctuation block)
    expect(next.cursor.col).toBe(3)
  })

  it('b moves to previous word start', () => {
    const state = createEditorState('hello world', { line: 0, col: 6 })
    const next = executeCommand(state, motion('b', 'b'))
    expect(next.cursor).toEqual({ line: 0, col: 0 })
  })

  it('e moves to end of word', () => {
    const state = createEditorState('hello world', { line: 0, col: 0 })
    const next = executeCommand(state, motion('e', 'e'))
    expect(next.cursor).toEqual({ line: 0, col: 4 })
  })

  it('w crosses line boundary', () => {
    const state = createEditorState('hello\nworld', { line: 0, col: 0 })
    const next = executeCommand(state, motion('w', 'w'))
    expect(next.cursor).toEqual({ line: 1, col: 0 })
  })
})

// ─── x (delete character) ───────────────────────────────────────────

describe('x delete character', () => {
  it('deletes character under cursor', () => {
    const state = createEditorState('hello', { line: 0, col: 0 })
    const next = executeCommand(state, simple('x'))
    expect(next.text).toBe('ello')
    expect(next.cursor).toEqual({ line: 0, col: 0 })
  })

  it('deletes in middle of line', () => {
    const state = createEditorState('hello', { line: 0, col: 2 })
    const next = executeCommand(state, simple('x'))
    expect(next.text).toBe('helo')
    expect(next.cursor).toEqual({ line: 0, col: 2 })
  })

  it('deletes last character, cursor moves back', () => {
    const state = createEditorState('hi', { line: 0, col: 1 })
    const next = executeCommand(state, simple('x'))
    expect(next.text).toBe('h')
    expect(next.cursor).toEqual({ line: 0, col: 0 })
  })

  it('stores deleted char in unnamed register', () => {
    const state = createEditorState('hello', { line: 0, col: 0 })
    const next = executeCommand(state, simple('x'))
    expect(next.registers['']).toBe('h')
  })

  it('does nothing on empty line', () => {
    const state = createEditorState('', { line: 0, col: 0 })
    const next = executeCommand(state, simple('x'))
    expect(next.text).toBe('')
  })
})

// ─── u (undo) ───────────────────────────────────────────────────────

describe('u undo', () => {
  it('undoes last operation', () => {
    const state = createEditorState('hello', { line: 0, col: 0 })
    const after = executeCommand(state, simple('x'))
    expect(after.text).toBe('ello')

    const undone = executeCommand(after, simple('u'))
    expect(undone.text).toBe('hello')
    expect(undone.cursor).toEqual({ line: 0, col: 0 })
  })

  it('multiple undos', () => {
    let state = createEditorState('hello', { line: 0, col: 0 })
    state = executeCommand(state, simple('x')) // "ello"
    state = executeCommand(state, simple('x')) // "llo"
    expect(state.text).toBe('llo')

    state = executeCommand(state, simple('u')) // "ello"
    expect(state.text).toBe('ello')

    state = executeCommand(state, simple('u')) // "hello"
    expect(state.text).toBe('hello')
  })

  it('does nothing with empty undo stack', () => {
    const state = createEditorState('hello', { line: 0, col: 0 })
    const next = executeCommand(state, simple('u'))
    expect(next.text).toBe('hello')
  })
})

// ─── Redo (Ctrl+R) ─────────────────────────────────────────────────

describe('Ctrl+R redo', () => {
  it('redoes after undo', () => {
    let state = createEditorState('hello', { line: 0, col: 0 })
    state = executeCommand(state, simple('x'))
    state = executeCommand(state, simple('u'))
    expect(state.text).toBe('hello')

    state = executeCommand(state, { raw: 'Ctrl+R', valid: true })
    expect(state.text).toBe('ello')
  })

  it('redo stack clears on new text-changing operation', () => {
    let state = createEditorState('hello', { line: 0, col: 0 })
    state = executeCommand(state, simple('x'))
    state = executeCommand(state, simple('u'))
    // Now do a new text-changing operation instead of redo
    state = executeCommand(state, simple('x'))
    // Redo should do nothing
    state = executeCommand(state, { raw: 'Ctrl+R', valid: true })
    expect(state.text).toBe('ello') // stays from the second x
  })
})

// ─── Insert mode (i/a/Esc) ─────────────────────────────────────────

describe('insert mode', () => {
  it('i enters insert mode', () => {
    const state = createEditorState('hello', { line: 0, col: 2 })
    const next = executeCommand(state, simple('i'))
    expect(next.mode).toBe('insert')
    expect(next.cursor).toEqual({ line: 0, col: 2 })
  })

  it('a enters insert mode after cursor', () => {
    const state = createEditorState('hello', { line: 0, col: 2 })
    const next = executeCommand(state, simple('a'))
    expect(next.mode).toBe('insert')
    expect(next.cursor).toEqual({ line: 0, col: 3 })
  })

  it('typing in insert mode inserts text', () => {
    let state = createEditorState('hllo', { line: 0, col: 1 })
    state = { ...state, mode: 'insert' }
    state = executeCommand(state, simple('e'))
    expect(state.text).toBe('hello')
    expect(state.cursor).toEqual({ line: 0, col: 2 })
  })

  it('Esc returns to normal mode', () => {
    let state = createEditorState('hello', { line: 0, col: 3 })
    state = { ...state, mode: 'insert' }
    state = executeCommand(state, simple('Esc'))
    expect(state.mode).toBe('normal')
    expect(state.cursor).toEqual({ line: 0, col: 2 }) // back one
  })

  it('Backspace in insert mode deletes previous char', () => {
    let state = createEditorState('hello', { line: 0, col: 2 })
    state = { ...state, mode: 'insert' }
    state = executeCommand(state, simple('Backspace'))
    expect(state.text).toBe('hllo')
    expect(state.cursor).toEqual({ line: 0, col: 1 })
  })
})

// ─── dw (delete word) ──────────────────────────────────────────────

describe('dw delete word', () => {
  it('deletes from cursor to next word start', () => {
    const state = createEditorState('hello world', { line: 0, col: 0 })
    const next = executeCommand(state, opMotion('dw', 'd', 'w'))
    expect(next.text).toBe('world')
    expect(next.cursor).toEqual({ line: 0, col: 0 })
  })

  it('delete this from "delete this word"', () => {
    const state = createEditorState('delete this word', { line: 0, col: 7 })
    const next = executeCommand(state, opMotion('dw', 'd', 'w'))
    expect(next.text).toBe('delete word')
  })

  it('stores deleted text in register', () => {
    const state = createEditorState('hello world', { line: 0, col: 0 })
    const next = executeCommand(state, opMotion('dw', 'd', 'w'))
    expect(next.registers['']).toBe('hello ')
  })
})

// ─── de (delete to end of word) ─────────────────────────────────────

describe('de delete to end of word', () => {
  it('deletes through end of word (inclusive)', () => {
    const state = createEditorState('hello world', { line: 0, col: 0 })
    const next = executeCommand(state, opMotion('de', 'd', 'e'))
    expect(next.text).toBe(' world')
    expect(next.cursor).toEqual({ line: 0, col: 0 })
  })
})

// ─── db (delete to previous word) ───────────────────────────────────

describe('db delete backward word', () => {
  it('deletes back to previous word start', () => {
    // cursor at col 6 = 'w' in "world", b goes to col 0 ("hello")
    // db deletes from col 0 to col 6 (exclusive) = "hello "
    const state = createEditorState('hello world', { line: 0, col: 6 })
    const next = executeCommand(state, opMotion('db', 'd', 'b'))
    expect(next.text).toBe('world')
    expect(next.cursor).toEqual({ line: 0, col: 0 })
  })

  it('deletes single word', () => {
    // cursor at col 11 is past end, will clamp to col 10 ('d')
    // Let's use a valid position
    const state2 = createEditorState('hello world', { line: 0, col: 10 })
    const next = executeCommand(state2, opMotion('db', 'd', 'b'))
    // b from col 10 'd' -> col 6 'w', delete col 6..10
    expect(next.text).toBe('hello d')
  })
})

// ─── Undo stack correctness ────────────────────────────────────────

describe('undo stack', () => {
  it('movement does NOT push to undo stack (motions are not undoable)', () => {
    const state = createEditorState('hello', { line: 0, col: 0 })
    const next = executeCommand(state, motion('l', 'l'))
    expect(next.undoStack).toHaveLength(0)
  })

  it('undo does not increase undo stack', () => {
    let state = createEditorState('hello', { line: 0, col: 0 })
    state = executeCommand(state, simple('x'))
    expect(state.undoStack).toHaveLength(1)

    state = executeCommand(state, simple('u'))
    expect(state.undoStack).toHaveLength(0)
    expect(state.redoStack).toHaveLength(1)
  })
})

// ─── Invalid commands ──────────────────────────────────────────────

describe('invalid commands', () => {
  it('invalid command returns state unchanged', () => {
    const state = createEditorState('hello', { line: 0, col: 0 })
    const next = executeCommand(state, { raw: 'z', valid: false })
    expect(next).toBe(state)
  })
})

// ─── finalizeInsertSession ─────────────────────────────────────────

describe('finalizeInsertSession', () => {
  it('consolidates insert session into one undo entry', () => {
    const entry = createEditorState('hello', { line: 0, col: 5 })
    // Simulate: entered insert mode, typed " world" (6 chars)
    const afterInsert: EditorState = {
      ...entry,
      text: 'hello world',
      cursor: { line: 0, col: 11 },
      mode: 'insert',
      undoStack: [], // i/a no longer pushes undo
    }

    const finalized = finalizeInsertSession(afterInsert, entry, 6)
    expect(finalized.undoStack).toHaveLength(1)
    expect(finalized.undoStack[0].oldText).toBe('hello')
    expect(finalized.undoStack[0].newText).toBe('hello world')
    // 6 chars → ceil(6/5) = 2 damage
    expect(finalized.undoStack[0].damage).toBe(2)
  })

  it('empty insert (i→Esc) produces 0 damage and no undo entry', () => {
    const entry = createEditorState('hello', { line: 0, col: 2 })
    // Same text, just mode changed
    const afterInsert: EditorState = {
      ...entry,
      mode: 'normal',
      cursor: { line: 0, col: 1 }, // Esc moves cursor back
    }

    const finalized = finalizeInsertSession(afterInsert, entry, 0)
    expect(finalized.undoStack).toHaveLength(0)
  })

  it('5 chars → 1 damage', () => {
    const entry = createEditorState('', { line: 0, col: 0 })
    const afterInsert: EditorState = {
      ...entry,
      text: 'hello',
      cursor: { line: 0, col: 5 },
      mode: 'normal',
    }

    const finalized = finalizeInsertSession(afterInsert, entry, 5)
    expect(finalized.undoStack[0].damage).toBe(1)
  })

  it('11 chars → 7 damage (1 + max(0, 11-5))', () => {
    const entry = createEditorState('', { line: 0, col: 0 })
    const afterInsert: EditorState = {
      ...entry,
      text: 'hello world',
      cursor: { line: 0, col: 11 },
      mode: 'normal',
    }

    const finalized = finalizeInsertSession(afterInsert, entry, 11)
    expect(finalized.undoStack[0].damage).toBe(7)
  })
})
