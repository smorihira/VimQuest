/**
 * CommandSession — unified command processing for play, hint demo, and tests.
 *
 * Single source of truth for:
 *   - key input → parser → executor pipeline
 *   - damage tracking (insert session, visual, normal)
 *   - undo/redo damage restoration
 *   - spell (command history) recording
 *
 * Replaces the duplicated logic in:
 *   - usePlayEngine.ts (handleKey)
 *   - commandReplayer.ts (applyHintCommand + calculateHintDamage)
 *   - hintVerifier.test.ts (simulateHintCommands)
 */

import type { EditorState } from '../types/editor'
import type { CursorPosition } from '../types/editor'
import type { Command } from '../types/command'
import type { SpellEntry } from '../types/spell'
import { createEditorState } from '../types/editor'
import { CommandParser } from './commandParser'
import { executeCommand, finalizeInsertSession } from './commandExecutor'
import { insertSessionDamage } from './damageModel'
import { isStageClear } from './clearChecker'
import type { Stage } from '../types/stage'

// ─── Types ──────────────────────────────────────────────────────

export type SessionStatus = 'playing' | 'clear' | 'dead'

export interface SessionSnapshot {
  editorState: EditorState
  damage: number
  status: SessionStatus
  parserBuffer: string
  spells: SpellEntry[]
}

export interface SessionResult {
  executed: boolean
  commandRaw: string
  invalid: boolean
}

export interface SessionConfig {
  initialText: string
  initialCursor: CursorPosition
  availableCommands: readonly string[]
  baseCommands?: readonly string[]
  visualCommands?: readonly string[]
  life: number
  stage: Stage
  /**
   * Pre-built editor state (e.g., from tutorial completion).
   * When provided, overrides initialText/initialCursor.
   */
  initialState?: EditorState
  /**
   * When true, skip damage for commands that don't change visible state
   * (text, cursor, mode, viewportTop). Useful for gameplay (wall-hit protection).
   * Default: true.
   * calculateDamage sets this to false to match calculateHintDamage behavior.
   */
  skipDamageIfUnchanged?: boolean
  /**
   * When true, never set status to 'clear'. Used by calculateDamage
   * to process all commands without early termination.
   */
  noClearCheck?: boolean
}

// ─── Internal Types ──────────────────────────────────────────────

interface InsertSession {
  entryState: EditorState
  charCount: number
  command: string
  damageAtEntry: number
  entryCommand: Command
  insertText: string
}

// ─── Helpers ─────────────────────────────────────────────────────

/** Stamp damageAtEntry on the last undoStack operation (if stack grew) */
function stampDamageAtEntry(
  next: EditorState,
  prev: EditorState,
  damageAtEntry: number,
): EditorState {
  if (next.undoStack.length <= prev.undoStack.length) return next
  const lastOp = next.undoStack[next.undoStack.length - 1]
  return {
    ...next,
    undoStack: [...next.undoStack.slice(0, -1), { ...lastOp, damageAtEntry }],
  }
}

/** Tokenize a hint command string into individual key presses. */
function tokenizeHintCommand(cmdStr: string): string[] {
  if (cmdStr === 'Esc' || cmdStr === 'Escape') return ['Esc']
  if (cmdStr === 'Enter') return ['Enter']
  if (cmdStr === 'Backspace') return ['Backspace']
  if (cmdStr.startsWith('Ctrl+')) return [cmdStr]
  return cmdStr.split('')
}

// ─── CommandSession ──────────────────────────────────────────────

export class CommandSession {
  private parser: CommandParser
  private state: EditorState
  private _damage: number = 0
  private _status: SessionStatus = 'playing'
  private _spells: SpellEntry[] = []
  private insertSession: InsertSession | null = null
  private readonly life: number
  private readonly stage: Stage
  private readonly skipDamageIfUnchanged: boolean
  private readonly noClearCheck: boolean

  constructor(config: SessionConfig) {
    this.parser = new CommandParser(
      config.availableCommands as string[],
      undefined,
      config.visualCommands as string[] | undefined,
      config.baseCommands as string[] | undefined,
    )
    this.state = config.initialState ?? createEditorState(config.initialText, config.initialCursor)
    this.life = config.life
    this.stage = config.stage
    this.skipDamageIfUnchanged = config.skipDamageIfUnchanged ?? true
    this.noClearCheck = config.noClearCheck ?? false
    // If initial state already clears the stage, start as 'clear'
    if (this.checkClear(this.state)) {
      this._status = 'clear'
    }
  }

  private checkClear(state: EditorState): boolean {
    return !this.noClearCheck && isStageClear(state, this.stage)
  }

  get damage(): number {
    return this._damage
  }

  get status(): SessionStatus {
    return this._status
  }

  get editorState(): EditorState {
    return this.state
  }

  getSnapshot(): SessionSnapshot {
    return {
      editorState: this.state,
      damage: this._damage,
      status: this._status,
      parserBuffer: this.parser.getState() === 'idle' ? '' : this.parser.getDisplayBuffer(),
      spells: this._spells,
    }
  }

  /**
   * Feed a single key press. This is the unified entry point for all command processing.
   * Mirrors the logic from usePlayEngine.handleKey exactly.
   */
  feedKey(key: string): SessionResult {
    if (this._status !== 'playing') {
      return { executed: false, commandRaw: '', invalid: false }
    }

    // ── INSERT mode: handle all keys directly (only Esc falls through to parser) ──
    if (this.state.mode === 'insert' && key !== 'Esc') {
      // Arrow keys: disabled in INSERT mode
      if (key.startsWith('Arrow')) {
        return { executed: false, commandRaw: '', invalid: false }
      }

      // Backspace
      if (key === 'Backspace') {
        if (this.insertSession && this.insertSession.charCount > 0) {
          this.insertSession.charCount--
          this.insertSession.insertText = this.insertSession.insertText.slice(0, -1)
        }
        this.state = executeCommand(this.state, { raw: key, valid: true })
        return { executed: true, commandRaw: key, invalid: false }
      }

      // Enter: counts as a typed character
      if (key === 'Enter') {
        if (this.insertSession) {
          this.insertSession.charCount++
          this.insertSession.insertText += '\n'
        }
        this.state = executeCommand(this.state, { raw: key, valid: true })
        return { executed: true, commandRaw: key, invalid: false }
      }

      // Regular character input
      if (key.length === 1) {
        if (this.insertSession) {
          this.insertSession.charCount++
          this.insertSession.insertText += key
        }
        this.state = executeCommand(this.state, { raw: key, valid: true })
        return { executed: true, commandRaw: key, invalid: false }
      }

      // Other keys: ignore in INSERT
      return { executed: false, commandRaw: '', invalid: false }
    }

    // Sync parser with current editor mode
    this.parser.setEditorMode(this.state.mode)

    const parseResult = this.parser.feed(key)

    if (!parseResult) {
      // Parser is accumulating (e.g., waiting for motion after 'd')
      return { executed: false, commandRaw: '', invalid: false }
    }

    if (!parseResult.command.valid) {
      return { executed: false, commandRaw: '', invalid: true }
    }

    const raw = parseResult.command.raw

    // ── Undo ──
    if (raw === 'u') {
      if (this.state.undoStack.length > 0) {
        const op = this.state.undoStack[this.state.undoStack.length - 1]
        this._damage = op.damageAtEntry
        this._spells = this._spells.slice(0, -1)
      }
      this.state = executeCommand(this.state, parseResult.command)
      if (this.state.mode === 'normal' && this.checkClear(this.state)) {
        this._status = 'clear'
      }
      return { executed: true, commandRaw: raw, invalid: false }
    }

    // ── Redo ──
    if (raw === 'Ctrl+R') {
      if (this.state.redoStack.length > 0) {
        const op = this.state.redoStack[this.state.redoStack.length - 1]
        const newDamage = this._damage + op.damage
        this._damage = newDamage
        this._spells = [...this._spells, { command: 'Ctrl+R', damage: op.damage }]
        if (newDamage >= this.life) {
          this._status = 'dead'
          return { executed: true, commandRaw: raw, invalid: false }
        }
      }
      this.state = executeCommand(this.state, parseResult.command)
      return { executed: true, commandRaw: raw, invalid: false }
    }

    // ── Entering insert mode (i/a/I/A/o/O) ──
    if (
      (raw === 'i' || raw === 'a' || raw === 'I' || raw === 'A' || raw === 'o' || raw === 'O') &&
      this.state.mode === 'normal'
    ) {
      const next = executeCommand(this.state, parseResult.command)
      this.insertSession = {
        entryState: this.state,
        charCount: 0,
        command: raw,
        damageAtEntry: this._damage,
        entryCommand: parseResult.command,
        insertText: '',
      }
      this.state = next
      return { executed: true, commandRaw: raw, invalid: false }
    }

    // ── Entering visual mode (v/V/Ctrl+v): free entry ──
    if ((raw === 'v' || raw === 'V' || raw === 'Ctrl+v') && this.state.mode === 'normal') {
      this.state = executeCommand(this.state, parseResult.command)
      return { executed: true, commandRaw: raw, invalid: false }
    }

    // ── Visual change (c): delete selection + enter insert ──
    if (raw === 'c' && this.state.mode === 'visual') {
      const next = executeCommand(this.state, parseResult.command)
      this.insertSession = {
        entryState: this.state,
        charCount: 0,
        command: 'c',
        damageAtEntry: this._damage,
        entryCommand: parseResult.command,
        insertText: '',
      }
      this.state = next
      return { executed: true, commandRaw: raw, invalid: false }
    }

    // ── Leaving insert mode (Esc) ──
    if (raw === 'Esc' && this.state.mode === 'insert') {
      let next = executeCommand(this.state, parseResult.command)
      const session = this.insertSession
      if (session) {
        const charCount = session.charCount
        next = finalizeInsertSession(next, session.entryState, charCount)
        next = stampDamageAtEntry(next, this.state, session.damageAtEntry)
        next = {
          ...next,
          lastCommand: session.entryCommand,
          lastInsertText: session.insertText,
        }
        this.insertSession = null

        const dmg = insertSessionDamage(charCount)
        const newDamage = this._damage + dmg
        this._damage = newDamage
        this._spells = [...this._spells, { command: session.command + '…Esc', damage: dmg }]
        if (newDamage >= this.life) {
          this._status = 'dead'
          this.state = next
          return { executed: true, commandRaw: raw, invalid: false }
        }
      }
      this.state = next
      if (this.checkClear(next)) {
        this._status = 'clear'
      }
      return { executed: true, commandRaw: raw, invalid: false }
    }

    // ── Esc in visual mode: exit visual (1 damage) ──
    if (raw === 'Esc' && this.state.mode === 'visual') {
      this.state = executeCommand(this.state, parseResult.command)
      const newDamage = this._damage + 1
      this._damage = newDamage
      this._spells = [...this._spells, { command: 'v…Esc', damage: 1 }]
      if (newDamage >= this.life) {
        this._status = 'dead'
        return { executed: true, commandRaw: raw, invalid: false }
      }
      if (this.checkClear(this.state)) {
        this._status = 'clear'
      }
      return { executed: true, commandRaw: raw, invalid: false }
    }

    // ── Esc in normal mode: free ──
    if (raw === 'Esc') {
      return { executed: true, commandRaw: raw, invalid: false }
    }

    // ── All other commands ──
    const next = stampDamageAtEntry(
      executeCommand(this.state, parseResult.command),
      this.state,
      this._damage,
    )

    // Skip damage if state didn't change (e.g., motion hitting wall)
    // Still update state for register changes (e.g., yank)
    if (
      this.skipDamageIfUnchanged &&
      next.text === this.state.text &&
      next.cursor.line === this.state.cursor.line &&
      next.cursor.col === this.state.cursor.col &&
      next.mode === this.state.mode &&
      next.viewportTop === this.state.viewportTop
    ) {
      this.state = next
      return { executed: true, commandRaw: raw, invalid: false }
    }

    // If command transitioned into insert mode (cc, cw, C, s, S, R, etc.)
    if (next.mode === 'insert' && this.state.mode !== 'insert') {
      this.insertSession = {
        entryState: this.state,
        charCount: 0,
        command: raw,
        damageAtEntry: this._damage,
        entryCommand: parseResult.command,
        insertText: '',
      }
      this.state = next
      return { executed: true, commandRaw: raw, invalid: false }
    }

    const newDamage = this._damage + parseResult.damage
    this._damage = newDamage
    this._spells = [...this._spells, { command: raw, damage: parseResult.damage }]

    if (newDamage >= this.life) {
      this._status = 'dead'
      this.state = next
      return { executed: true, commandRaw: raw, invalid: false }
    }

    // Set lastCommand for dot repeat
    const finalNext =
      raw !== '.' && next.text !== this.state.text && next.mode !== 'insert'
        ? { ...next, lastCommand: parseResult.command }
        : next

    this.state = finalNext

    if (finalNext.mode === 'normal' && this.checkClear(finalNext)) {
      this._status = 'clear'
    }

    return { executed: true, commandRaw: raw, invalid: false }
  }

  /**
   * Feed a hint command string. Expands to feedKey calls internally.
   * This ensures hint demo and tests use the exact same code path as normal play.
   */
  feedHintCommand(cmd: string): SessionResult {
    // Insert mode: type each character via feedKey
    if (this.state.mode === 'insert' && cmd !== 'Esc') {
      let result: SessionResult = { executed: false, commandRaw: '', invalid: false }
      for (const ch of cmd) {
        result = this.feedKey(ch)
      }
      return result
    }

    // Search command: /pattern or ?pattern → feed prefix, chars individually
    if (this.state.mode !== 'insert' && (cmd.startsWith('/') || cmd.startsWith('?'))) {
      this.feedKey(cmd[0])
      for (const ch of cmd.slice(1)) {
        this.feedKey(ch)
      }
      // Don't feed Enter here — it comes as the next hint command
      return { executed: true, commandRaw: cmd, invalid: false }
    }

    // Normal/visual commands: tokenize and feed each key
    const keys = tokenizeHintCommand(cmd)
    let result: SessionResult = { executed: false, commandRaw: '', invalid: false }
    for (const key of keys) {
      result = this.feedKey(key)
    }
    return result
  }

  /**
   * Calculate total damage for a hint command sequence.
   * Uses feedHintCommand internally — guaranteed to match play engine.
   */
  static calculateDamage(
    commands: readonly string[],
    config: Omit<SessionConfig, 'life' | 'stage'> & { stage?: Stage },
  ): number {
    // Create a minimal stage for clear checking (won't affect damage)
    const minimalStage: Stage = config.stage ?? {
      id: '_damage_calc',
      nodeId: '_',
      type: 'teach',
      title: '',
      language: 'plaintext',
      initialText: config.initialText,
      goalText: config.initialText,
      initialCursor: config.initialCursor,
      life: 999,
      stars: [999, 999, 999] as [number, number, number],
      availableCommands: config.availableCommands as string[],
      hints: [],
      flavor: '',
    }

    const session = new CommandSession({
      ...config,
      life: 999, // Never die during damage calculation
      stage: minimalStage,
      skipDamageIfUnchanged: false,
      noClearCheck: true,
    })

    for (const cmd of commands) {
      session.feedHintCommand(cmd)
    }

    return session._damage
  }
}
