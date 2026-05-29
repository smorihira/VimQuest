import type { Stage } from '../../types/stage'
import { NodeId } from '../../types/nodeId'

/**
 * operator: オペレータ基礎 (y, p, P, d, c)
 */
export const N07_STAGES: Stage[] = [
  // ── 🆕 Teach: コピーせよ ──
  {
    id: 'operator-yank',
    nodeId: NodeId.Operator,
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
    id: 'operator-dc',
    nodeId: NodeId.Operator,
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
    id: 'operator-combo',
    nodeId: NodeId.Operator,
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
    id: 'operator-practice',
    nodeId: NodeId.Operator,
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
