import type { Stage } from '../../types/stage'

/**
 * N18: operator+TextObj (diw, daw, ciw, caw, ...)
 */
export const N18_STAGES: Stage[] = [
  // ── Teach: diw で単語削除（3単語） ──
  // opt = 2 (自力: diw×2) → ☆3=2, ☆2=3, ☆1=5, life=8
  {
    id: 'N18-T',
    nodeId: 'N06',
    type: 'teach',
    title: '精密除去',
    language: 'javascript',
    initialText: 'const temp old = 42;',
    goalText: 'const   = 42;',
    initialCursor: { line: 0, col: 0 },
    life: 10,
    stars: [4, 5, 7],
    availableCommands: ['dw', 'de', 'db', 'diw', 'f', 't'],
    hints: [{ cost: 1, commands: ['w', 'diw', 'w', 'diw'] }],
    flavor: 'diw は単語だけを正確に消す。前後の空白は残る',
  },

  // ── Practice: 括弧内・引用符内の削除 ──
  // opt = 2 (f"+di")
  {
    id: 'N18-P',
    nodeId: 'N06',
    type: 'practice',
    title: '外科手術',
    language: 'javascript',
    initialText: 'alert("error: " + value);',
    goalText: 'alert("" + value);',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 4, 6],
    availableCommands: ['dw', 'de', 'db', 'diw', 'di"', 'f', 't'],
    hints: [{ cost: 1, commands: ['f"', 'di"'] }],
    flavor: '引用符の中身だけを di" で消せ。外側は残る',
  },
  // ── Teach: ciw で単語置換（2箇所） ──
  // opt = 3 (自力: w+w+ciw…new…Esc) → ☆3=3, ☆2=4, ☆1=6, life=9
  {
    id: 'N18-Ta',
    nodeId: 'N06',
    type: 'teach',
    title: '単語を変えろ',
    language: 'javascript',
    initialText: 'let value = old;',
    goalText: 'let count = new;',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 6, 8],
    availableCommands: ['dw', 'cf', 'ct', 'ciw', 'ci"', 'f', 't'],
    hints: [{ cost: 1, commands: ['w', 'ciw', 'count', 'Esc', 'w', 'w', 'ciw', 'new', 'Esc'] }],
    flavor: 'ciw で単語を消してそのままInsertモードへ。変数名を変えろ',
  },

  // ── Practice: 複数の TextObj 変更 ──
  // opt = 3 (ci"…#333…Esc(1) + j(1) + ci"…20px…Esc(1))
  {
    id: 'N18-Tb',
    nodeId: 'N06',
    type: 'practice',
    title: '属性を直せ',
    language: 'css',
    initialText: 'color: "red";\nfont-size: "16px";',
    goalText: 'color: "#333";\nfont-size: "20px";',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 5, 7],
    availableCommands: ['dw', 'cf', 'ct', 'ciw', 'ci"', 'f', 't'],
    hints: [{ cost: 1, commands: ['ci"', '#333', 'Esc', 'j', 'ci"', '20px', 'Esc'] }],
    flavor: '2行の引用符内を ci" で書き換えろ',
  },

  // ── Challenge: JSON修正パズル ──
  // opt = 9 (j+fA+ci"…Bob…Esc(1) + j+ft+ci"…30…Esc(1) + j+fu+ci"…admin…Esc(1))
  {
    id: 'N18-C',
    nodeId: 'N06',
    type: 'challenge',
    title: 'JSON外科',
    language: 'json',
    initialText:
      '{\n' + '  "name": "Alice",\n' + '  "age": "twenty",\n' + '  "role": "user"\n' + '}',
    goalText: '{\n' + '  "name": "Bob",\n' + '  "age": "30",\n' + '  "role": "admin"\n' + '}',
    initialCursor: { line: 0, col: 0 },
    life: 17,
    stars: [9, 12, 15],
    availableCommands: ['dw', 'cf', 'ct', 'ciw', 'ci"', 'f', 't'],
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
