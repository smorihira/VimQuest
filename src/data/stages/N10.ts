import type { Stage } from '../../types/stage'

/**
 * N11: ショートカット (s, S, Y, D, C, J)
 */
export const N10_STAGES: Stage[] = [
  // ── 🆕 Teach: 置き換え ──
  {
    id: 'N11-T1',
    nodeId: 'N11',
    type: 'tutorial' as const,
    title: '置き換え',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['s', 'S'],
    hints: [],
    flavor: 'TODO',
    newCommands: ['s', 'S'],
  },

  // ── 🆕 Teach: 行末操作 ──
  {
    id: 'N11-T2',
    nodeId: 'N11',
    type: 'tutorial' as const,
    title: '行末操作',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['Y', 'D', 'C'],
    hints: [],
    flavor: 'TODO',
    newCommands: ['Y', 'D', 'C'],
  },

  // ── 🆕 Teach: 行結合 ──
  {
    id: 'N11-T3',
    nodeId: 'N11',
    type: 'tutorial' as const,
    title: '行結合',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['J'],
    hints: [],
    flavor: 'TODO',
    newCommands: ['J'],
  },

  // ── 🆕 Practice: ショートカット総合 ──
  {
    id: 'N11-P',
    nodeId: 'N11',
    type: 'practice' as const,
    title: 'ショートカット総合',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['s', 'S', 'Y', 'D', 'C', 'J'],
    hints: [],
    flavor: 'TODO',
    newCommands: [],
  },
]
