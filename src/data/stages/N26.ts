import type { Stage } from '../../types/stage'

/**
 * N26: 未カバーコマンドのチュートリアル補完
 * ? (N04), o-visual (N08), (){}[[]] (N12), FT HML (N14), Ctrl+f/b m'` gi (N16), Ctrl+e/y (N17)
 */

const LONG_TEXT =
  'function main() {\n' +
  '  const a = 1;\n' +
  '  const b = 2;\n' +
  '  const c = 3;\n' +
  '  const d = 4;\n' +
  '  const e = 5;\n' +
  '  const f = 6;\n' +
  '  const g = 7;\n' +
  '  const h = 8;\n' +
  '  const i = 9;\n' +
  '  const j = 10;\n' +
  '  const k = 11;\n' +
  '  const l = 12;\n' +
  '  const m = 13;\n' +
  '  const n = 14;\n' +
  '  const o = 15;\n' +
  '  const p = 16;\n' +
  '  const q = 17;\n' +
  '  const r = 18;\n' +
  '  const s = 19;\n' +
  '  const t = 20;\n' +
  '  return [a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t];\n' +
  '}'

export const N26_STAGES: Stage[] = [
  // ── N04: ? 後方検索 ──
  // opt = 1: ?(1, search damage)
  {
    id: 'N26-T',
    nodeId: 'N04',
    type: 'teach',
    title: '後方検索',
    language: 'javascript',
    initialText: 'let x = 1;\nlet y = 2;\nlet z = 3;',
    goalText: 'let x = 1;\nlet y = 2;\nlet z = 3;',
    initialCursor: { line: 2, col: 0 },
    life: 7,
    stars: [1, 2, 4],
    availableCommands: ['?'],
    clearConditions: { cursor: { line: 0, col: 4 } },
    hints: [{ cost: 1, commands: ['?x', 'Enter'] }],
    flavor: '? で後方検索。/ の逆方向だ',
  },

  // ── N08: o Visual選択端入替 ──
  // opt = 5: v(0)+l(1)+l(1)+o(1)+l(1)+Esc(1)
  {
    id: 'N26-Ta',
    nodeId: 'N08',
    type: 'teach',
    title: '選択端を入替',
    language: 'plaintext',
    initialText: 'abcde',
    goalText: 'abcde',
    initialCursor: { line: 0, col: 1 },
    life: 11,
    stars: [5, 6, 8],
    availableCommands: ['v', 'V', 'Ctrl+v', 'o'],
    clearConditions: { cursor: { line: 0, col: 2 } },
    hints: [{ cost: 1, commands: ['v', 'l', 'l', 'o', 'l', 'Esc'] }],
    flavor: 'Visual モード中に o で選択の反対端にカーソルを移動',
  },

  // ── N12: { } 段落移動 ──
  // opt = 2: }(1)+}(1)
  {
    id: 'N26-Tb',
    nodeId: 'N12',
    type: 'teach',
    title: '段落ジャンプ',
    language: 'plaintext',
    initialText: 'aaa\nbbb\n\nccc\nddd\n\neee',
    goalText: 'aaa\nbbb\n\nccc\nddd\n\neee',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['{', '}'],
    clearConditions: { cursor: { line: 5, col: 0 } },
    hints: [{ cost: 1, commands: ['}', '}'] }],
    flavor: '} で次の空行（段落末）へジャンプ。{ で逆方向',
  },

  // ── N12: ( ) 文移動 ──
  // opt = 2: )(1)+)(1)
  {
    id: 'N26-Tc',
    nodeId: 'N12',
    type: 'teach',
    title: '文ジャンプ',
    language: 'plaintext',
    initialText: 'Hello world. Foo bar. End.',
    goalText: 'Hello world. Foo bar. End.',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['(', ')'],
    clearConditions: { cursor: { line: 0, col: 22 } },
    hints: [{ cost: 1, commands: [')', ')'] }],
    flavor: ') で次の文へ。( で前の文へ戻れる',
  },

  // ── N12: [[ ]] セクション移動 ──
  // opt = 2: ]](1)+]](1)
  {
    id: 'N26-Td',
    nodeId: 'N12',
    type: 'teach',
    title: 'セクション移動',
    language: 'javascript',
    initialText: 'function a()\n{\n  return 1;\n}\nfunction b()\n{\n  return 2;\n}',
    goalText: 'function a()\n{\n  return 1;\n}\nfunction b()\n{\n  return 2;\n}',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['[[', ']]'],
    clearConditions: { cursor: { line: 5, col: 0 } },
    hints: [{ cost: 1, commands: [']]', ']]'] }],
    flavor: ']] で次の { がある行へ。[[ で前へ戻れる',
  },

  // ── N14: F 後方文字検索 ──
  // opt = 1: Fx(1)
  {
    id: 'N26-Te',
    nodeId: 'N14',
    type: 'teach',
    title: '後方文字検索',
    language: 'plaintext',
    initialText: 'a x b c',
    goalText: 'a x b c',
    initialCursor: { line: 0, col: 6 },
    life: 7,
    stars: [1, 2, 4],
    availableCommands: ['F', 'T'],
    clearConditions: { cursor: { line: 0, col: 2 } },
    hints: [{ cost: 1, commands: ['Fx'] }],
    flavor: 'F は f の逆方向。後ろへ文字を探す',
  },

  // ── N14: H M L 画面位置移動 ──
  // opt = 1: M(1)
  {
    id: 'N26-Tf',
    nodeId: 'N14',
    type: 'teach',
    title: '画面位置ジャンプ',
    language: 'javascript',
    initialText: LONG_TEXT,
    goalText: LONG_TEXT,
    initialCursor: { line: 0, col: 0 },
    life: 7,
    stars: [1, 2, 4],
    availableCommands: ['H', 'M', 'L'],
    clearConditions: { cursor: { line: 8, col: 2 } },
    hints: [{ cost: 1, commands: ['M'] }],
    flavor: 'H/M/L で画面の上端/中央/下端へ一発ジャンプ',
  },

  // ── N16: Ctrl+f / Ctrl+b フルページスクロール ──
  // opt = 1: Ctrl+f(1)
  {
    id: 'N26-Tg',
    nodeId: 'N16',
    type: 'teach',
    title: 'ページ送り',
    language: 'javascript',
    initialText: LONG_TEXT,
    goalText: LONG_TEXT,
    initialCursor: { line: 0, col: 0 },
    life: 7,
    stars: [1, 2, 4],
    availableCommands: ['Ctrl+f', 'Ctrl+b'],
    clearConditions: { cursor: { line: 16, col: 0 } },
    hints: [{ cost: 1, commands: ['Ctrl+f'] }],
    flavor: 'Ctrl+f で1ページ下へ。Ctrl+b で1ページ上へ',
  },

  // ── N16: m + ' マーク ──
  // opt = 3: ma(1)+G(1)+'a(1)
  {
    id: 'N26-Th',
    nodeId: 'N16',
    type: 'teach',
    title: 'マークを打て',
    language: 'javascript',
    initialText: 'let target = 1;\nlet a = 2;\nlet b = 3;\nlet c = 4;\nlet d = 5;',
    goalText: 'let target = 1;\nlet a = 2;\nlet b = 3;\nlet c = 4;\nlet d = 5;',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['m', "'", '`'],
    clearConditions: { cursor: { line: 0, col: 0 } },
    hints: [{ cost: 1, commands: ['ma', 'G', "'a"] }],
    flavor: "ma で現在位置をマーク。'a でその行へ戻れる",
  },

  // ── N16: gi 最終挿入位置へ ──
  // opt = 3: i(0)+x+Esc(1)+j(1)+gi(1)
  {
    id: 'N26-Ti',
    nodeId: 'N16',
    type: 'teach',
    title: '最終挿入位置へ',
    language: 'plaintext',
    initialText: 'abc\ndef',
    goalText: 'aXbc\ndef',
    initialCursor: { line: 0, col: 1 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['gi'],
    clearConditions: { cursor: { line: 0, col: 1 } },
    hints: [{ cost: 1, commands: ['i', 'X', 'Esc', 'j', 'gi', 'Esc'] }],
    flavor: 'gi で最後に挿入した位置に戻って挿入モードに入る',
  },

  // ── N17: Ctrl+e / Ctrl+y 1行スクロール ──
  // opt = 3: Ctrl+e(1)+Ctrl+e(1)+Ctrl+e(1)
  {
    id: 'N26-Tj',
    nodeId: 'N17',
    type: 'teach',
    title: '1行スクロール',
    language: 'javascript',
    initialText: LONG_TEXT,
    goalText: LONG_TEXT,
    initialCursor: { line: 3, col: 0 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['Ctrl+e', 'Ctrl+y'],
    clearConditions: { viewportTop: 3 },
    hints: [{ cost: 1, commands: ['Ctrl+e', 'Ctrl+e', 'Ctrl+e'] }],
    flavor: 'Ctrl+e で画面を1行下へ。Ctrl+y で1行上へ。カーソルはそのまま',
  },
]
