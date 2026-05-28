import type { Stage } from '../../types/stage'

/**
 * N05: オペレータ基礎 (y, p, P, d, c)
 */
export const N07_STAGES: Stage[] = [
  // ── 🆕 Teach: コピーせよ ──
  {
    id: 'N05-T1',
    nodeId: 'N05',
    type: 'tutorial' as const,
    title: 'コピーせよ',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['y', 'p', 'P'],
    hints: [],
    flavor: 'TODO',
    newCommands: ['y', 'p', 'P'],
  },

  // ── 🆕 Teach: 消せ・変えろ ──
  {
    id: 'N05-T2',
    nodeId: 'N05',
    type: 'tutorial' as const,
    title: '消せ・変えろ',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['d', 'c', 'p', 'P'],
    hints: [],
    flavor: 'TODO',
    newCommands: ['d', 'c'],
  },

  // ── 🆕 Teach: モーションと組合せ ──
  {
    id: 'N05-T3',
    nodeId: 'N05',
    type: 'tutorial' as const,
    title: 'モーションと組合せ',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['y', 'd', 'c', 'p', 'P'],
    hints: [],
    flavor: 'TODO',
    newCommands: [],
  },

  // ── 🆕 Practice: オペレータ総合 ──
  {
    id: 'N05-P',
    nodeId: 'N05',
    type: 'practice' as const,
    title: 'オペレータ総合',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['y', 'd', 'c', 'p', 'P'],
    hints: [],
    flavor: 'TODO',
    newCommands: [],
  },
]
