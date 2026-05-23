import type { Stage } from '../../types/stage'

/**
 * N26: d+f/t (df, dt)
 * ALL合流ノード: N23(f/t) + N18(dw)
 * Teach(T) = 1ステージ
 */
export const N26_STAGES: Stage[] = [
  // ── Teach: dt で指定文字の手前まで削除 ──
  // opt = 2 (f: + dt;)
  {
    id: 'N26-T',
    nodeId: 'N26',
    type: 'teach',
    title: '範囲を断て',
    language: 'css',
    initialText: 'padding: 0px10px;',
    goalText: 'padding: 10px;',
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
      'f',
      't',
      'x',
      'dw',
      'de',
      'db',
      'df',
      'dt',
    ],
    hints: [{ cost: 1, commands: ['w', 'w', 'dt1'] }],
    flavor: 'dt で指定文字の手前まで削除。余分な部分だけ消せ',
  },
]
