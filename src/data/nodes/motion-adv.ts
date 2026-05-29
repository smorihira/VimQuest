import type { Stage } from '../../types/stage'
import { NodeId } from '../../types/nodeId'

/** 発展モーション — W/B/E, F/T, H/M/L */
export const MOTION_ADV_STAGES: Stage[] = [
  // ── N01-4: WORDで飛べ ──
  {
    id: 'motion-adv-word',
    nodeId: NodeId.MotionAdv,
    type: 'tutorial',
    title: 'WORDで飛べ',
    language: 'javascript',
    initialText: 'arr.push(x); return obj.key;',
    goalText: 'arr.push(x); return obj.key;',
    initialCursor: { line: 0, col: 0 },
    life: 999,
    stars: [999, 999, 999],
    availableCommands: ['W', 'B', 'E'],
    clearConditions: { cursor: { line: 0, col: 27 } },
    hints: [{ cost: 1, commands: ['W', 'W', 'W'] }],
    flavor: 'W は記号をまたいで空白区切りで飛ぶ。末尾の ; まで一気に行け',
    newCommands: ['W', 'B', 'E'],
    tutorial: [
      {
        message: 'w を押してみろ。. で止まるだろう',
        expectedKey: 'w',
      },
      {
        message: 'b で前の単語に戻れ',
        expectedKey: 'b',
      },
      {
        message: '今度は W だ。空白まで一気に飛ぶ',
        expectedKey: 'W',
      },
      {
        message: 'W は記号をまたいで飛ぶ。末尾の ; まで W で一気に行け',
        expectedKey: null,
      },
    ],
  },
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
