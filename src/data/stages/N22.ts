import type { Stage } from '../../types/stage'

/**
 * N10: レジスタ (")
 */
export const N22_STAGES: Stage[] = [
  // ── 🆕 Teach: レジスタ入門 ──
  {
    id: 'N10-T',
    nodeId: 'N10',
    type: 'tutorial' as const,
    title: 'レジスタ入門',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['"', 'y', 'd', 'c', 'p', 'P'],
    hints: [],
    flavor: 'TODO',
    newCommands: ['"a'],
  },

  // ── 🆕 Teach: クリップボード ──
  {
    id: 'N10-Ta',
    nodeId: 'N10',
    type: 'tutorial' as const,
    title: 'クリップボード',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['"', 'y', 'd', 'c', 'p', 'P'],
    hints: [],
    flavor: 'TODO',
    newCommands: ['"+'],
  },

  // ── 🆕 Practice: レジスタ活用 ──
  {
    id: 'N10-P',
    nodeId: 'N10',
    type: 'practice' as const,
    title: 'レジスタ活用',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['"'],
    hints: [],
    flavor: 'TODO',
    newCommands: [],
  },
]
