/**
 * Command metadata — card styling, key mapping, and parser helpers.
 */

export function mapKeyEvent(e: KeyboardEvent): string | null {
  // Ctrl combos
  if (e.ctrlKey && e.key === 'r') return 'Ctrl+R'
  if (e.ctrlKey && e.key === 'd') return 'Ctrl+d'
  if (e.ctrlKey && e.key === 'u') return 'Ctrl+u'
  if (e.ctrlKey && e.key === 'v') {
    e.preventDefault()
    return 'Ctrl+v'
  }

  // Ignore other Ctrl/Meta combos
  if (e.ctrlKey || e.metaKey) return null

  // Special keys
  if (e.key === 'Escape') return 'Esc'
  if (e.key === 'Backspace') return 'Backspace'
  if (e.key === 'Enter') return 'Enter'
  if (e.key === 'ArrowLeft') return 'ArrowLeft'
  if (e.key === 'ArrowDown') return 'ArrowDown'
  if (e.key === 'ArrowUp') return 'ArrowUp'
  if (e.key === 'ArrowRight') return 'ArrowRight'

  // Single character
  if (e.key.length === 1) return e.key

  return null
}

export function getPendingOperator(buffer: string): string | null {
  if (!buffer) return null
  // Strip leading count
  const stripped = buffer.replace(/^\d+/, '')
  if (['d', 'c', 'y', '>', '<'].includes(stripped)) return stripped
  return null
}

export function getCardClass(cmd: string): string {
  if (['d', 'c', 'y'].includes(cmd[0]) && cmd.length >= 2) return 'verb'
  if (['d', 'c', 'y', '>', '<'].includes(cmd)) return 'verb'
  if (
    [
      'h',
      'j',
      'k',
      'l',
      'w',
      'b',
      'e',
      'W',
      'B',
      'E',
      '0',
      '$',
      '^',
      'G',
      'gg',
      'f',
      't',
      ';',
      ',',
      '/',
      'n',
      'N',
      '*',
      '#',
      '{',
      '}',
      '(',
      ')',
      '%',
    ].includes(cmd)
  )
    return 'motion'
  if (['x', 'r', '~', 'J', '.', 'u', 'p', 'P'].includes(cmd)) return 'action'
  if (['i', 'a', 'I', 'A', 'o', 'O', 's', 'S', 'C', 'R'].includes(cmd)) return 'insert'
  if (cmd.startsWith('i') && cmd.length >= 2) return 'object'
  if (cmd.startsWith('a') && cmd.length >= 2) return 'object'
  return ''
}

export function getCardHint(cmd: string): string | null {
  if (cmd === 'f' || cmd === 't') return '; ,'
  if (cmd === '/' || cmd === '*' || cmd === '#') return 'n N'
  return null
}

/**
 * Build a display list from availableCommands,
 * grouping operator combos (dw, de, db, dd → single "d" card with hint "w e b d").
 */
export function buildCardDisplayList(
  commands: readonly string[],
): Array<{ cmd: string; hint: string | null }> {
  const OPERATOR_KEYS = ['d', 'c', 'y', '>', '<']

  // First pass: group multi-char operator combos (skip doubled operators like >>, <<)
  const groups = new Map<string, string[]>()
  for (const cmd of commands) {
    const op = OPERATOR_KEYS.find((o) => cmd.startsWith(o) && cmd.length > o.length)
    if (op && cmd !== op + op) {
      if (!groups.has(op)) groups.set(op, [])
      groups.get(op)!.push(cmd.slice(op.length))
    }
  }

  // Second pass: build display list preserving order
  const result: Array<{ cmd: string; hint: string | null }> = []
  const emitted = new Set<string>()

  for (const cmd of commands) {
    const op = OPERATOR_KEYS.find((o) => cmd.startsWith(o) && cmd.length > o.length)
    if (op && cmd !== op + op) {
      if (!emitted.has(op)) {
        emitted.add(op)
        result.push({ cmd: op, hint: groups.get(op)!.join(' ') })
      }
    } else if (OPERATOR_KEYS.includes(cmd) && groups.has(cmd)) {
      // Standalone operator merged into its group
      if (!emitted.has(cmd)) {
        emitted.add(cmd)
        result.push({ cmd, hint: groups.get(cmd)!.join(' ') })
      }
    } else {
      result.push({ cmd, hint: getCardHint(cmd) })
    }
  }

  return result
}
