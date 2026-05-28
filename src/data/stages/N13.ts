import type { Stage } from '../../types/stage'

/**
 * N12: 発展モーション（構造ジャンプ）(%, (, ), {, }, [[, ]])
 */
export const N13_STAGES: Stage[] = [
  // ── 🆕 Teach: 対応ジャンプ ──
  {
    id: 'N12-T1',
    nodeId: 'N12',
    type: 'tutorial' as const,
    title: '対応ジャンプ',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['%', '(', ')', '{', '}'],
    hints: [],
    flavor: 'TODO',
    newCommands: ['%', '(', ')', '{', '}'],
  },

  // ── 🆕 Teach: セクション移動 ──
  {
    id: 'N12-T2',
    nodeId: 'N12',
    type: 'tutorial' as const,
    title: 'セクション移動',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['[[', ']]'],
    hints: [],
    flavor: 'TODO',
    newCommands: ['[[', ']]'],
  },

  // ── 🆕 Practice: 構造ジャンプ総合 ──
  {
    id: 'N12-P',
    nodeId: 'N12',
    type: 'practice' as const,
    title: '構造ジャンプ総合',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['%', '(', ')', '{', '}', '[[', ']]'],
    hints: [],
    flavor: 'TODO',
    newCommands: [],
  },
]
