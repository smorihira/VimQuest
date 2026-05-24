import type { Stage } from '../../types/stage'

/**
 * N14: 行結合 (J)
 * Teach(T) = 1ステージ
 */
export const N14_STAGES: Stage[] = [
  // ── Teach: 複数行を1行に結合 ──
  // opt = 2 (J + J)
  {
    id: 'N14-T',
    nodeId: 'N14',
    type: 'teach',
    title: '行をつなげ',
    language: 'plaintext',
    initialText: 'hello\nbeautiful\nworld',
    goalText: 'hello beautiful world',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['dd', 'J'],
    hints: [{ cost: 1, commands: ['J', 'J'] }],
    flavor: 'J で下の行を現在行に結合できる',
  },
]
