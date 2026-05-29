import type { Stage } from '../../types/stage'
import { NodeId } from '../../types/nodeId'

/**
 * shortcut: ショートカット (s, S, Y, D, C, J)
 */
export const N10_STAGES: Stage[] = [
  // ── 🆕 Teach: 置き換え ──
  {
    id: 'shortcut-sub',
    nodeId: NodeId.Shortcut,
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
    id: 'shortcut-line-end',
    nodeId: NodeId.Shortcut,
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
    id: 'shortcut-join',
    nodeId: NodeId.Shortcut,
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
    id: 'shortcut-practice',
    nodeId: NodeId.Shortcut,
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
