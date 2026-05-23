import type { Stage } from '../../types/stage'

/**
 * N09: WORD移動 (W, B, E)
 * w は記号で止まるが W は空白区切りでジャンプ。
 * Teach(T) = 1ステージ
 */
export const N09_STAGES: Stage[] = [
  // ── Teach: WORD単位で高速移動 ──
  // opt = 2 (WW) → cursor at 'five'
  {
    id: 'N09-T',
    nodeId: 'N09',
    type: 'teach',
    title: 'WORDで飛べ',
    language: 'plaintext',
    initialText: 'one.two three.four five',
    goalText: 'one.two three.four five',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['W', 'B', 'E'],
    clearConditions: { cursor: { line: 0, col: 19 } },
    hints: [{ cost: 1, commands: ['W', 'W'] }],
    flavor: 'w だと . で止まる。W なら空白まで一気に飛べる',
  },
]
