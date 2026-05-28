import { describe, it, expect } from 'vitest'
import { parseSubstituteCommand, executeSubstituteCommand } from './commandLine'
import { createEditorState } from '../../types/editor'

describe('parseSubstituteCommand', () => {
  it('parses :s/old/new/', () => {
    expect(parseSubstituteCommand(':s/old/new/')).toEqual({
      pattern: 'old',
      replacement: 'new',
      global: false,
      range: 'current',
    })
  })

  it('parses :s/old/new/g', () => {
    expect(parseSubstituteCommand(':s/old/new/g')).toEqual({
      pattern: 'old',
      replacement: 'new',
      global: true,
      range: 'current',
    })
  })

  it('parses :%s/old/new/', () => {
    expect(parseSubstituteCommand(':%s/old/new/')).toEqual({
      pattern: 'old',
      replacement: 'new',
      global: false,
      range: 'all',
    })
  })

  it('parses :%s/old/new/g', () => {
    expect(parseSubstituteCommand(':%s/old/new/g')).toEqual({
      pattern: 'old',
      replacement: 'new',
      global: true,
      range: 'all',
    })
  })

  it('parses empty replacement :s/old//', () => {
    expect(parseSubstituteCommand(':s/old//')).toEqual({
      pattern: 'old',
      replacement: '',
      global: false,
      range: 'current',
    })
  })

  it('returns null for invalid format', () => {
    expect(parseSubstituteCommand(':s')).toBeNull()
    expect(parseSubstituteCommand(':s/')).toBeNull()
    expect(parseSubstituteCommand(':s/old')).toBeNull()
    expect(parseSubstituteCommand(':s/old/new')).toBeNull()
    expect(parseSubstituteCommand(':q!')).toBeNull()
  })
})

describe('executeSubstituteCommand', () => {
  it(':s replaces first match on current line', () => {
    const state = createEditorState('foo bar foo', { line: 0, col: 0 })
    const result = executeSubstituteCommand(state, {
      pattern: 'foo',
      replacement: 'baz',
      global: false,
      range: 'current',
    })
    expect(result.text).toBe('baz bar foo')
  })

  it(':s/g replaces all matches on current line', () => {
    const state = createEditorState('foo bar foo', { line: 0, col: 0 })
    const result = executeSubstituteCommand(state, {
      pattern: 'foo',
      replacement: 'baz',
      global: true,
      range: 'current',
    })
    expect(result.text).toBe('baz bar baz')
  })

  it(':%s replaces first match on every line', () => {
    const state = createEditorState('foo bar foo\nfoo baz foo', { line: 0, col: 0 })
    const result = executeSubstituteCommand(state, {
      pattern: 'foo',
      replacement: 'x',
      global: false,
      range: 'all',
    })
    expect(result.text).toBe('x bar foo\nx baz foo')
  })

  it(':%s/g replaces all matches on all lines', () => {
    const state = createEditorState('foo bar foo\nfoo baz foo', { line: 0, col: 0 })
    const result = executeSubstituteCommand(state, {
      pattern: 'foo',
      replacement: 'x',
      global: true,
      range: 'all',
    })
    expect(result.text).toBe('x bar x\nx baz x')
  })

  it('returns same state when no match found', () => {
    const state = createEditorState('hello world', { line: 0, col: 0 })
    const result = executeSubstituteCommand(state, {
      pattern: 'xyz',
      replacement: 'abc',
      global: false,
      range: 'current',
    })
    expect(result).toBe(state) // same reference
  })

  it(':s only affects current line (cursor line)', () => {
    const state = createEditorState('aaa\nbbb\naaa', { line: 2, col: 0 })
    const result = executeSubstituteCommand(state, {
      pattern: 'aaa',
      replacement: 'ccc',
      global: false,
      range: 'current',
    })
    expect(result.text).toBe('aaa\nbbb\nccc')
  })

  it('escapes regex special characters in pattern', () => {
    const state = createEditorState('a.b + c', { line: 0, col: 0 })
    const result = executeSubstituteCommand(state, {
      pattern: 'a.b',
      replacement: 'x',
      global: false,
      range: 'current',
    })
    expect(result.text).toBe('x + c')
  })

  it('clamps cursor col when line gets shorter', () => {
    const state = createEditorState('abcdef', { line: 0, col: 5 })
    const result = executeSubstituteCommand(state, {
      pattern: 'cdef',
      replacement: '',
      global: false,
      range: 'current',
    })
    expect(result.text).toBe('ab')
    expect(result.cursor.col).toBe(1)
  })

  it('adds undo entry', () => {
    const state = createEditorState('old text', { line: 0, col: 0 })
    const result = executeSubstituteCommand(state, {
      pattern: 'old',
      replacement: 'new',
      global: false,
      range: 'current',
    })
    expect(result.undoStack.length).toBe(state.undoStack.length + 1)
  })
})
