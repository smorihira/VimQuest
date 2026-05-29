import type { Stage } from '../../types/stage'
import { NodeId } from '../../types/nodeId'

/**
 * number: 数値操作 (Ctrl+a, Ctrl+x)
 */
export const N15_STAGES: Stage[] = [
  // ── 🆕 Teach: 数値操作 ──
  {
    id: 'number-intro',
    nodeId: NodeId.Number,
    type: 'tutorial' as const,
    title: '数値操作',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['Ctrl+a', 'Ctrl+x'],
    hints: [],
    flavor: 'TODO',
    newCommands: ['Ctrl+a', 'Ctrl+x'],
  },

  // ── 🆕 Practice: 数値調整 ──
  {
    id: 'number-practice',
    nodeId: NodeId.Number,
    type: 'practice' as const,
    title: '数値調整',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['Ctrl+a', 'Ctrl+x'],
    hints: [],
    flavor: 'TODO',
    newCommands: [],
  },
]
