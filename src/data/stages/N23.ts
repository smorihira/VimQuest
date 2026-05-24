import type { Stage } from '../../types/stage'

/**
 * N23: c+f/t (cf, ct)
 * 渇望→報酬サイクル #4: dw+i+入力 → cw で2手
 * Teach(T) + Practice(P) = 2ステージ
 */
export const N23_STAGES: Stage[] = [
  // ── Teach: ct で文字の手前まで変更 ──
  // opt = 2 (w + ct;)  — change 'red' to 'blue'
  {
    id: 'N23-T',
    nodeId: 'N23',
    type: 'teach',
    title: '書き換えろ',
    language: 'css',
    initialText: 'color: red;',
    goalText: 'color: blue;',
    initialCursor: { line: 0, col: 0 },
    life: 10,
    stars: [4, 5, 7],
    availableCommands: ['df', 'dt', 'cf', 'ct', 'f', 't'],
    hints: [{ cost: 1, commands: ['w', 'w', 'ct;', 'blue', 'Esc'] }],
    flavor: 'ct; で ; の手前まで消してInsertモードに。d+i が一体化した c の威力',
  },

  // ── Practice: 複数行で cf/ct を使い分け ──
  // opt = 5 (w+ct;+50px+Esc, j+w+ct;+80px+Esc)
  {
    id: 'N23-P',
    nodeId: 'N23',
    type: 'practice',
    title: '一括修正',
    language: 'css',
    initialText: 'width: 100px;\nheight: 200px;',
    goalText: 'width: 50px;\nheight: 80px;',
    initialCursor: { line: 0, col: 0 },
    life: 14,
    stars: [8, 10, 12],
    availableCommands: ['df', 'dt', 'cf', 'ct', 'f', 't'],
    hints: [
      { cost: 1, commands: ['w', 'w', 'ct;', '50px', 'Esc', 'j', 'b', 'ct;', '80px', 'Esc'] },
    ],
    flavor: 'ct; で値を書き換えろ。2行とも修正だ',
  },
]
