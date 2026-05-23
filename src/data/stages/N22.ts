import type { Stage } from '../../types/stage'

/**
 * N22: 行結合 (J)
 * Teach(T) = 1ステージ
 */
export const N22_STAGES: Stage[] = [
  // ── Teach: 2行を1行に結合 ──
  // opt = 1 (J)
  {
    id: 'N22-T',
    nodeId: 'N22',
    type: 'teach',
    title: '行をつなげ',
    language: 'plaintext',
    initialText: 'hello\nworld',
    goalText: 'hello world',
    initialCursor: { line: 0, col: 0 },
    life: 7,
    stars: [1, 2, 4],
    availableCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', '^', 'x', 'dd', 'J'],
    hints: [{ cost: 1, commands: ['J'] }],
    flavor: 'J で下の行を現在行に結合できる',
  },
]
