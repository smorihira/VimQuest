import type { Stage } from '../../types/stage'

/**
 * N34: ドットリピート (.)
 * ★★★ 最高峰ノード — Vim の真髄
 * 渇望→報酬サイクル #5: 手動繰り返し → . 一発
 * Teach(T) + Practice(P) + Challenge(C) = 3ステージ
 */
export const N34_STAGES: Stage[] = [
  // ── Teach: . で直前の変更を繰り返す ──
  // opt = 3 (ciw+yes+Esc, w+.)
  {
    id: 'N34-T',
    nodeId: 'N34',
    type: 'teach',
    title: 'リピート',
    language: 'plaintext',
    initialText: 'no no no',
    goalText: 'yes yes yes',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 4, 6],
    baseCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', 'i', 'a', 'f', 't', '0', '$', 'x'],
    availableCommands: ['ciw', 's', '.'],
    hints: [{ cost: 1, commands: ['ciw', 'yes', 'Esc', 'w', '.', 'w', '.'] }],
    flavor: 'ciw で最初の no を yes に変え、. で残りも一発だ',
  },

  // ── Practice: 複数行でドットリピート ──
  // opt = 6 (j+^+ciw+let+Esc, j+^+., j+^+.)
  {
    id: 'N34-P',
    nodeId: 'N34',
    type: 'practice',
    title: '連続リピート',
    language: 'javascript',
    initialText:
      'function setup() {\n' + '  var a = 1;\n' + '  var b = 2;\n' + '  var c = 3;\n' + '}',
    goalText: 'function setup() {\n' + '  let a = 1;\n' + '  let b = 2;\n' + '  let c = 3;\n' + '}',
    initialCursor: { line: 0, col: 0 },
    life: 12,
    stars: [6, 8, 10],
    baseCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', 'i', 'a', 'f', 't', '0', '$', '^', 'x'],
    availableCommands: ['ciw', 's', '.'],
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
    id: 'N34-C',
    nodeId: 'N34',
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
    baseCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', 'i', 'a', 'f', 't', '0', '$', '^', 'x'],
    availableCommands: ['ciw', 's', 'S', 'C', '.'],
    hints: [
      {
        cost: 1,
        commands: ['j', '^', 'ciw', 'const', 'Esc', 'j', '^', '.', 'j', '^', '.'],
      },
    ],
    flavor: 'var を const に統一しろ。. を使いこなせ',
  },
]
