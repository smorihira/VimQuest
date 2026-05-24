import type { Stage } from '../../types/stage'

/**
 * N19: 行結合 (J)
 * Teach(T) = 1ステージ
 */
export const N19_STAGES: Stage[] = [
  // ── Teach: 2行を1行に結合 ──
  // opt = 1 (J)
  {
    id: 'N19-T',
    nodeId: 'N19',
    type: 'teach',
    title: '行をつなげ',
    language: 'plaintext',
    initialText: 'hello\nworld',
    goalText: 'hello world',
    initialCursor: { line: 0, col: 0 },
    life: 7,
    stars: [1, 2, 4],
    availableCommands: ['dd', 'J', '0', '$', '^'],
    hints: [{ cost: 1, commands: ['J'] }],
    flavor: 'J で下の行を現在行に結合できる',
  },
]
