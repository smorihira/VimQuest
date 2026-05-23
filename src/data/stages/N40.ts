import type { Stage } from '../../types/stage'

/**
 * N40: ペースト (p, P)
 * Teach(T) = 1ステージ
 */
export const N40_STAGES: Stage[] = [
  // ── Teach: dd + P で行を移動 ──
  // opt = 3 (jj + dd + P → move line 3 to line 2)
  {
    id: 'N40-T',
    nodeId: 'N40',
    type: 'teach',
    title: '切り貼りせよ',
    language: 'plaintext',
    initialText: 'first\nthird\nsecond',
    goalText: 'first\nsecond\nthird',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: [
      'h',
      'j',
      'k',
      'l',
      'w',
      'b',
      'e',
      '0',
      '$',
      'x',
      'u',
      'y',
      'yy',
      'dd',
      'p',
      'P',
    ],
    hints: [{ cost: 1, commands: ['j', 'j', 'dd', 'P'] }],
    flavor: 'dd で行を切り取り、P でカーソルの上にペーストだ',
  },
]
