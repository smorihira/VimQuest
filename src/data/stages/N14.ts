import type { Stage } from '../../types/stage'

/**
 * N14: operator+f/t (df, dt, cf, ct)
 */
export const N14_STAGES: Stage[] = [
  // ── Teach: dt で指定文字の手前まで削除（2箇所修正） ──
  // opt = 2 (自力: w+dt2) → ☆3=2, ☆2=3, ☆1=5, life=8
  {
    id: 'N14-T',
    nodeId: 'N14',
    type: 'teach',
    title: '範囲を断て',
    language: 'css',
    initialText: 'padding: 0px10px 0px20px;',
    goalText: 'padding: 10px 20px;',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 6, 8],
    availableCommands: ['dw', 'de', 'db', 'df', 'dt', 'f', 't'],
    hints: [{ cost: 1, commands: ['w', 'w', 'dt1', 'w', 'dt2'] }],
    flavor: 'dt で指定文字の手前まで削除。余分な部分だけ消せ',
  },
  // ── Teach: cf/ct の違いを体験（2行） ──
  // opt = 4 (自力: j+w+w+ct;…large…Esc) → ☆3=4, ☆2=5, ☆1=7, life=10
  {
    id: 'N14-Ta',
    nodeId: 'N14',
    type: 'teach',
    title: '書き換えろ',
    language: 'css',
    initialText: 'color: red;\nsize: small;',
    goalText: 'color: blue;\nsize: large;',
    initialCursor: { line: 0, col: 0 },
    life: 14,
    stars: [8, 9, 11],
    availableCommands: ['df', 'dt', 'cf', 'ct', 'f', 't'],
    hints: [
      {
        cost: 1,
        commands: ['w', 'w', 'ct;', 'blue', 'Esc', 'j', '0', 'w', 'w', 'ct;', 'large', 'Esc'],
      },
    ],
    flavor: 'cf は文字ごと、ct は手前まで変更。使い分けろ',
  },

  // ── Practice: 複数行で cf/ct を使い分け ──
  // opt = 6 (w+w+ct;…50px…Esc(1) + j+b+ct;…80px…Esc(1))
  {
    id: 'N14-P',
    nodeId: 'N14',
    type: 'practice',
    title: '一括修正',
    language: 'css',
    initialText: 'width: 100px;\nheight: 200px;',
    goalText: 'width: 50px;\nheight: 80px;',
    initialCursor: { line: 0, col: 0 },
    life: 12,
    stars: [6, 8, 10],
    availableCommands: ['df', 'dt', 'cf', 'ct', 'f', 't'],
    hints: [
      { cost: 1, commands: ['w', 'w', 'ct;', '50px', 'Esc', 'j', 'b', 'ct;', '80px', 'Esc'] },
    ],
    flavor: 'ct; で値を書き換えろ。2行とも修正だ',
  },
]
