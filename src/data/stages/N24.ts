import type { Stage } from '../../types/stage'

/**
 * N24: ドットリピート (.)
 * ★★★ 最高峰ノード — Vim の真髄
 * 渇望→報酬サイクル #5: 手動繰り返し → . 一発
 * Teach(T) + Practice(P) + Challenge(C) = 3ステージ
 */
export const N24_STAGES: Stage[] = [
  // ── Teach: . で直前の変更を繰り返す ──
  // opt = 6 (ciw(1)+Esc(1) + w(1)+.(1) + w(1)+.(1))
  {
    id: 'N24-T',
    nodeId: 'N24',
    type: 'teach',
    title: 'リピート',
    language: 'plaintext',
    initialText: 'no no no',
    goalText: 'yes yes yes',
    initialCursor: { line: 0, col: 0 },
    life: 12,
    stars: [6, 7, 9],
    availableCommands: ['ciw', 's', '.', 'f', 't'],
    hints: [{ cost: 1, commands: ['ciw', 'yes', 'Esc', 'w', '.', 'w', '.'] }],
    flavor: 'ciw で最初の no を yes に変え、. で残りも一発だ',
  },

  // ── Practice: 複数行でドットリピート ──
  // opt = 10 (j+^+ciw(1)+Esc(1) + j+^+. + j+^+.)
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
    life: 16,
    stars: [10, 12, 14],
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
  // opt = 10 (ciw + . による複数変更 + f/t 移動)
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
    life: 18,
    stars: [10, 13, 16],
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
