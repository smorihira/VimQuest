import type { Stage } from '../../types/stage'

/**
 * N18: c+f/t (cf, ct)
 * 渇望→報酬サイクル #4: dw+i+入力 → cw で2手
 * Teach(T) + Practice(P) = 2ステージ
 */
export const N18_STAGES: Stage[] = [
  // ── Teach: cf/ct の違いを体験（2行） ──
  // opt = 4 (自力: j+w+w+ct;…large…Esc) → ☆3=4, ☆2=5, ☆1=7, life=10
  {
    id: 'N18-T',
    nodeId: 'N18',
    type: 'teach',
    title: '書き換えろ',
    language: 'css',
    initialText: 'color: red;\nsize: small;',
    goalText: 'color: blue;\nsize: large;',
    initialCursor: { line: 0, col: 0 },
    life: 10,
    stars: [4, 5, 7],
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
