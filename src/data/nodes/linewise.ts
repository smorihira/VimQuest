import type { Stage } from '../../types/stage'
import { NodeId } from '../../types/nodeId'

/** 行単位操作 — dd, cc, yy */
export const LINEWISE_STAGES: Stage[] = [
  // ── 🆕 Teach: 行単位操作 ──
  {
    id: 'linewise-intro',
    nodeId: NodeId.Linewise,
    type: 'tutorial' as const,
    title: '行単位操作',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['y', 'd', 'c', 'p', 'P'],
    hints: [],
    flavor: 'TODO',
    newCommands: ['dd', 'cc', 'yy'],
  },
  // ── 🆕 Practice: 行操作の実践 ──
  {
    id: 'linewise-practice',
    nodeId: NodeId.Linewise,
    type: 'practice' as const,
    title: '行操作の実践',
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
