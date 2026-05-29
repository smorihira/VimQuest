import type { Stage } from '../../types/stage'
import { NodeId } from '../../types/nodeId'

/**
 * 'motion-adv': 発展モーション（その他）(F, T, H, M, L)
 */
export const N25_STAGES: Stage[] = [
  // ── 🆕 Teach: 後方文字検索 ──
  {
    id: 'motion-adv-back-find',
    nodeId: NodeId.MotionAdv,
    type: 'tutorial' as const,
    title: '後方文字検索',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['F', 'T'],
    hints: [],
    flavor: 'TODO',
    newCommands: ['F', 'T'],
  },

  // ── 🆕 Teach: 画面位置ジャンプ ──
  {
    id: 'motion-adv-screen-pos',
    nodeId: NodeId.MotionAdv,
    type: 'tutorial' as const,
    title: '画面位置ジャンプ',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['H', 'M', 'L'],
    hints: [],
    flavor: 'TODO',
    newCommands: ['H', 'M', 'L'],
  },

  // ── 🆕 Practice: 発展モーション総合 ──
  {
    id: 'motion-adv-practice',
    nodeId: NodeId.MotionAdv,
    type: 'practice' as const,
    title: '発展モーション総合',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['W', 'B', 'E', 'F', 'T', 'H', 'M', 'L'],
    hints: [],
    flavor: 'TODO',
    newCommands: [],
  },
]
