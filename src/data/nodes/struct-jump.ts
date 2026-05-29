import type { Stage } from '../../types/stage'
import { NodeId } from '../../types/nodeId'

/** 構造ジャンプ — %, (, ), {, }, [[, ]] */
export const STRUCT_JUMP_STAGES: Stage[] = [
  // ── 🆕 Teach: 対応ジャンプ ──
  {
    id: 'struct-jump-match',
    nodeId: NodeId.StructJump,
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
    id: 'struct-jump-section',
    nodeId: NodeId.StructJump,
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
    id: 'struct-jump-practice',
    nodeId: NodeId.StructJump,
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
