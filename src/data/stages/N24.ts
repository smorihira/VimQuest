import type { Stage } from '../../types/stage'

/**
 * N24: ドットリピート (.)
 * ★★★ 最高峰ノード — Vim の真髄
 * 渇望→報酬サイクル #5: 手動繰り返し → . 一発
 * Teach(T) + Practice(P) + Challenge(C) = 3ステージ
 */
export const N24_STAGES: Stage[] = [
  // ── Teach: . でドットリピート（5単語） ──
  // opt = 6 (自力: w+.+w+.+w+.) → ☆3=6, ☆2=7, ☆1=9, life=12
  {
    id: 'N24-T',
    nodeId: 'N24',
    type: 'teach',
    title: 'リピート',
    language: 'plaintext',
    initialText: 'no no no no no',
    goalText: 'yes yes yes yes yes',
    initialCursor: { line: 0, col: 0 },
    life: 15,
    stars: [9, 10, 12],
    availableCommands: ['ciw', 's', '.', 'f', 't'],
    hints: [{ cost: 1, commands: ['ciw', 'yes', 'Esc', 'w', '.', 'w', '.', 'w', '.', 'w', '.'] }],
    flavor: 'ciw で最初の no を yes に変え、. で残りも一発だ',
  },

  // ── Practice: 複数行でドットリピート ──
  // opt = 9 (j+^+ciw…let…Esc(1) + j+^+. + j+^+.)
  {
    id: 'N24-P',
    nodeId: 'N24',
    type: 'practice',
    title: '連続リピート',
    language: 'javascript',
    initialText:
      'function setup() {\n' + '  var a = 1;\n' + '  var b = 2;\n' + '  var c = 3;\n' + '}',
    goalText: 'function setup() {\n' + '  let a = 1;\n' + '  let b = 2;\n' + '  let c = 3;\n' + '}',
    initialCursor: { line: 0, col: 0 },
    life: 15,
    stars: [9, 11, 13],
    availableCommands: ['ciw', 's', '.', 'f', 't'],
    hints: [
      {
        cost: 1,
        commands: ['j', '^', 'ciw', 'let', 'Esc', 'j', '^', '.', 'j', '^', '.'],
      },
    ],
    flavor: '全ての var を let に変えろ。. で繰り返せ',
  },

  // ── Challenge: 複合パズル ──
  // opt = 9 (j+^+ciw…const…Esc(1) + j+^+. + j+^+.)
  {
    id: 'N24-C',
    nodeId: 'N24',
    type: 'challenge',
    title: 'リファクタリング',
    language: 'javascript',
    initialText:
      'function getUser(id) {\n' +
      '  var name = fetch(id);\n' +
      '  var age = fetch(id);\n' +
      '  var role = fetch(id);\n' +
      '  return { name: name, age: age, role: role };\n' +
      '}',
    goalText:
      'function getUser(id) {\n' +
      '  const name = fetch(id);\n' +
      '  const age = fetch(id);\n' +
      '  const role = fetch(id);\n' +
      '  return { name: name, age: age, role: role };\n' +
      '}',
    initialCursor: { line: 0, col: 0 },
    life: 17,
    stars: [9, 12, 15],
    availableCommands: ['ciw', 's', 'S', 'C', '.', 'f', 't'],
    hints: [
      {
        cost: 1,
        commands: ['j', '^', 'ciw', 'const', 'Esc', 'j', '^', '.', 'j', '^', '.'],
      },
    ],
    flavor: 'var を const に統一しろ。. を使いこなせ',
  },
]
