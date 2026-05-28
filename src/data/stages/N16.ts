import type { Stage } from '../../types/stage'

/**
 * N06: TextObj (iw, aw, is, as, ip, ap, i", a", ...)
 */
export const N16_STAGES: Stage[] = [
  // ── 🆕 Teach: テキストオブジェクト ──
  {
    id: 'N06-T1',
    nodeId: 'N06',
    type: 'tutorial' as const,
    title: 'テキストオブジェクト',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['y', 'd', 'c', 'p', 'P'],
    hints: [],
    flavor: 'TODO',
    newCommands: ['w', 's', 'p'],
  },

  // ── 🆕 Teach: デリミタ ──
  {
    id: 'N06-T2',
    nodeId: 'N06',
    type: 'tutorial' as const,
    title: 'デリミタ',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['y', 'd', 'c', 'p', 'P'],
    hints: [],
    flavor: 'TODO',
    newCommands: ['"', "'", '(', '{', '[', '<'],
  },

  // ── 🆕 Practice: TextObj 応用 ──
  {
    id: 'N06-P',
    nodeId: 'N06',
    type: 'practice' as const,
    title: 'TextObj 応用',
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
