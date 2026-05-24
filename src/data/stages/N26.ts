import type { Stage } from '../../types/stage'

/**
 * N26: c+TextObj (ciw, ci", ca()
 * ALL合流ノード: N25(delim) + N23(cf/ct)
 * ★★★ 重要ノード — Teach(T) + Practice(P) + Challenge(C) = 3ステージ
 */
export const N26_STAGES: Stage[] = [
  // ── Teach: ciw で単語を置換 ──
  // opt = 2 (w + ciw + 'count' + Esc)
  {
    id: 'N26-T',
    nodeId: 'N26',
    type: 'teach',
    title: '単語を変えろ',
    language: 'javascript',
    initialText: 'let value = 0;',
    goalText: 'let count = 0;',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['dw', 'cf', 'ct', 'ciw', 'ci"', 'ca(', 'f', 't', '0', '$'],
    hints: [{ cost: 1, commands: ['w', 'ciw', 'count', 'Esc'] }],
    flavor: 'ciw で単語を消してそのままInsertモードへ。変数名を変えろ',
  },

  // ── Practice: 複数の TextObj 変更 ──
  // opt = 4 (ci"+#333+Esc, j+ci"+20px+Esc)
  {
    id: 'N26-P',
    nodeId: 'N26',
    type: 'practice',
    title: '属性を直せ',
    language: 'css',
    initialText: 'color: "red";\nfont-size: "16px";',
    goalText: 'color: "#333";\nfont-size: "20px";',
    initialCursor: { line: 0, col: 0 },
    life: 10,
    stars: [4, 6, 8],
    availableCommands: ['dw', 'cf', 'ct', 'ciw', 'ci"', 'ca(', 'f', 't', '0', '$'],
    hints: [{ cost: 1, commands: ['ci"', '#333', 'Esc', 'j', 'ci"', '20px', 'Esc'] }],
    flavor: '2行の引用符内を ci" で書き換えろ',
  },

  // ── Challenge: JSON修正パズル ──
  // opt = 8 (複数の ci" + ca( を駆使)
  {
    id: 'N26-C',
    nodeId: 'N26',
    type: 'challenge',
    title: 'JSON外科',
    language: 'json',
    initialText:
      '{\n' + '  "name": "Alice",\n' + '  "age": "twenty",\n' + '  "role": "user"\n' + '}',
    goalText: '{\n' + '  "name": "Bob",\n' + '  "age": "30",\n' + '  "role": "admin"\n' + '}',
    initialCursor: { line: 0, col: 0 },
    life: 17,
    stars: [9, 12, 15],
    availableCommands: ['dw', 'cf', 'ct', 'ciw', 'ci"', 'ca(', 'f', 't', '0', '$'],
    hints: [
      {
        cost: 1,
        commands: [
          'j',
          'fA',
          'ci"',
          'Bob',
          'Esc',
          'j',
          'ft',
          'ci"',
          '30',
          'Esc',
          'j',
          'fu',
          'ci"',
          'admin',
          'Esc',
        ],
      },
    ],
    flavor: 'JSON の値を3箇所書き換えろ。ci" の腕の見せどころだ',
  },
]
