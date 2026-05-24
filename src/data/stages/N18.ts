import type { Stage } from '../../types/stage'

/**
 * N18: c+f/t (cf, ct)
 * 渇望→報酬サイクル #4: dw+i+入力 → cw で2手
 * Teach(T) + Practice(P) = 2ステージ
 */
export const N18_STAGES: Stage[] = [
  // ── Teach: ct で文字の手前まで変更 ──
  // opt = 3 (w+w+ct;…blue…Esc(1))
  {
    id: 'N18-T',
    nodeId: 'N18',
    type: 'teach',
    title: '書き換えろ',
    language: 'css',
    initialText: 'color: red;',
    goalText: 'color: blue;',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['df', 'dt', 'cf', 'ct', 'f', 't'],
    hints: [{ cost: 1, commands: ['w', 'w', 'ct;', 'blue', 'Esc'] }],
    flavor: 'ct; で ; の手前まで消してInsertモードに。d+i が一体化した c の威力',
  },

  // ── Practice: 複数行で cf/ct を使い分け ──
  // opt = 6 (w+w+ct;…50px…Esc(1) + j+b+ct;…80px…Esc(1))
  {
    id: 'N18-P',
    nodeId: 'N18',
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
