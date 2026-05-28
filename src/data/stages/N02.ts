import type { Stage } from '../../types/stage'

/**
 * N02: Insertバリエーション (I, A, o, O, gi)
 */
export const N02_STAGES: Stage[] = [
  // ── Teach: /* */ で囲む (I で行頭、A で行末) ──
  // opt = 5 (I…Esc(1) + A…Esc(1) + j(1) + I…Esc(1) + A…Esc(1))
  {
    id: 'N02-T',
    nodeId: 'N02',
    type: 'tutorial',
    title: 'コメントで囲め',
    language: 'javascript',
    initialText: 'fix()\nrun()',
    goalText: '/* fix() */\n/* run() */',
    initialCursor: { line: 0, col: 2 },
    life: 11,
    stars: [5, 6, 8],
    availableCommands: ['x', 'X', 'i', 'a', 'I', 'A'],
    hints: [
      {
        cost: 1,
        commands: ['I', '/* ', 'Esc', 'A', ' */', 'Esc', 'j', 'I', '/* ', 'Esc', 'A', ' */', 'Esc'],
      },
    ],
    flavor: 'I で行頭、A で行末から Insert。両端から /* */ で囲め',
    newCommands: ['I', 'A'],
    tutorial: [
      {
        message: 'I を押せ。カーソルがどこにいても行頭で Insert に入る',
        expectedKey: 'I',
      },
      {
        message: '/* と打て。まず /',
        expectedKey: '/',
      },
      {
        message: '*',
        expectedKey: '*',
      },
      {
        message: 'Space',
        expectedKey: ' ',
      },
      {
        message: 'Esc で確定',
        expectedKey: 'Esc',
      },
      {
        message: 'A を押せ。今度は行末に飛んで Insert に入る',
        expectedKey: 'A',
      },
      {
        message: '*/ と打て。まず Space',
        expectedKey: ' ',
      },
      {
        message: '*',
        expectedKey: '*',
      },
      {
        message: '/',
        expectedKey: '/',
      },
      {
        message: 'Esc で確定',
        expectedKey: 'Esc',
      },
      {
        message: 'I は行頭、A は行末から Insert。2行目も同じように囲め',
        expectedKey: null,
      },
    ],
  },
  // ── Teach: 上下に行を追加 (O で上、o で下) ──
  // opt = 5 (O…Esc(1) + j(1) + o…Esc(1) + j(1) + o…Esc(1))
  {
    id: 'N02-Ta',
    nodeId: 'N02',
    type: 'tutorial',
    title: '行を足せ',
    language: 'plaintext',
    initialText: 'B\nD',
    goalText: 'A\nB\nC\nD\nE',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 6, 8],
    availableCommands: ['x', 'X', 'i', 'a', 'I', 'A', 'o', 'O'],
    hints: [
      {
        cost: 1,
        commands: ['O', 'A', 'Esc', 'j', 'o', 'C', 'Esc', 'j', 'o', 'E', 'Esc'],
      },
    ],
    flavor: 'O で上に、o で下に新行を作れ',
    newCommands: ['o', 'O'],
    tutorial: [
      {
        message: 'O を押せ。カーソルの上に新行を作って Insert に入る',
        expectedKey: 'O',
      },
      {
        message: 'A と打て',
        expectedKey: 'A',
      },
      {
        message: 'Esc で NORMAL に戻れ',
        expectedKey: 'Esc',
      },
      {
        message: 'j で B に戻れ',
        expectedKey: 'j',
      },
      {
        message: 'o を押せ。今度は下に新行を作る',
        expectedKey: 'o',
      },
      {
        message: 'C と打て',
        expectedKey: 'C',
      },
      {
        message: 'Esc',
        expectedKey: 'Esc',
      },
      {
        message: 'O は上、o は下に新行。残りも追加しろ',
        expectedKey: null,
      },
    ],
  },

  // ── Practice: 編集基礎の総合 (旧 N02-C) ──
  // opt = 11: l(1)+a…p…Esc(1)+j(1)+x(1)+j(1)+re(1)+I…Esc(1)+k(1)+.(1)+k(1)+.(1)
  {
    id: 'N02-P',
    nodeId: 'N02',
    type: 'practice',
    title: '編集基礎の総合',
    language: 'plaintext',
    initialText: 'aple\nbannana\ncharry',
    goalText: '- apple\n- banana\n- cherry',
    initialCursor: { line: 0, col: 0 },
    life: 17,
    stars: [11, 13, 15],
    availableCommands: [],
    hints: [
      {
        cost: 1,
        commands: ['l', 'a', 'p', 'Esc', 'j', 'x', 'j', 're', 'I', '- ', 'Esc', 'k', '.', 'k', '.'],
      },
    ],
    flavor: 'タイプミスを直し、整形せよ。基礎コマンドの総合力が試される',
    newCommands: [],
  },
]
