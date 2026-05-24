import type { Stage } from '../../types/stage'

/**
 * N03: 新行Insert (o, O)
 * Teach(T) = 1ステージ
 */
export const N03_STAGES: Stage[] = [
  // ── Teach: 上下に行を追加 (O で上、o で下) ──
  // opt = 5 (O…Esc(1) + j(1) + o…Esc(1) + j(1) + o…Esc(1))
  {
    id: 'N03-T',
    nodeId: 'N03',
    type: 'teach',
    title: '行を足せ',
    language: 'plaintext',
    initialText: 'B\nD',
    goalText: 'A\nB\nC\nD\nE',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 6, 8],
    availableCommands: ['o', 'O', 'I', 'A'],
    hints: [
      {
        cost: 1,
        commands: ['O', 'A', 'Esc', 'j', 'o', 'C', 'Esc', 'j', 'o', 'E', 'Esc'],
      },
    ],
    flavor: 'O で上に、o で下に新行を作れ',
  },
]
