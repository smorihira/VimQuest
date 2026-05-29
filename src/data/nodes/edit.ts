import type { Stage } from '../../types/stage'
import { NodeId } from '../../types/nodeId'

/** 編集基礎 — x/X, i/a, I/A, o/O, r, .(repeat) */
export const EDIT_STAGES: Stage[] = [
  // ── N01-7: 文字を消せ ──
  {
    id: 'edit-delete',
    nodeId: NodeId.Edit,
    type: 'tutorial',
    title: '文字を消せ',
    language: 'plaintext',
    initialText: 'hellllo worrld',
    goalText: 'hello world',
    initialCursor: { line: 0, col: 3 },
    life: 999,
    stars: [999, 999, 999],
    availableCommands: ['x', 'X'],
    hints: [{ cost: 1, commands: ['x', 'x', 'w', 'l', 'l', 'l', 'x'] }],
    flavor: '余分な文字を x で消せ',
    newCommands: ['x', 'X', 'u', 'Ctrl+R'],
    tutorial: [
      {
        message: 'x でカーソル上の文字を消せ',
        expectedKey: 'x',
      },
      {
        message: 'いいぞ。もう一度 x だ',
        expectedKey: 'x',
      },
      {
        message: '調子に乗ってもう一発',
        expectedKey: 'x',
      },
      {
        message: 'おっと、消しすぎたな。u で元に戻せ',
        expectedKey: 'u',
      },
      {
        message: 'もう一回 u を押してみろ',
        expectedKey: 'u',
      },
      {
        message: '戻しすぎた！ Ctrl+R でやり直せるぞ',
        expectedKey: 'Ctrl+R',
      },
      {
        message: 'u と Ctrl+R はいつでも使えるセーフティネットだ。残りの余分な文字も x で消せ',
        expectedKey: null,
      },
    ],
  },
  // ── N01-8: 文字を書け ──
  {
    id: 'edit-insert',
    nodeId: NodeId.Edit,
    type: 'tutorial',
    title: '文字を書け',
    language: 'plaintext',
    initialText: 'hllo ',
    goalText: 'hello, world!',
    initialCursor: { line: 0, col: 1 },
    life: 999,
    stars: [999, 999, 999],
    availableCommands: ['x', 'X', 'i', 'a'],
    hints: [
      {
        cost: 1,
        commands: [
          'i',
          'e',
          'Esc',
          '$',
          'a',
          'w',
          'o',
          'r',
          'l',
          'd',
          '!',
          'Esc',
          '0',
          'e',
          'a',
          ',',
          'Esc',
        ],
      },
    ],
    flavor: 'i と a で hello, world! を完成させろ',
    newCommands: ['i', 'a'],
    tutorial: [
      {
        message: 'i を押してみろ。カーソルの前に文字を挿入できるぞ',
        expectedKey: 'i',
      },
      {
        message: 'e と打て',
        expectedKey: 'e',
      },
      {
        message: 'Esc で NORMAL に戻れ',
        expectedKey: 'Esc',
      },
      {
        message: 'INSERT 1回で最低1ダメージ。なるべく少ない回数で済ませろ',
        expectedKey: null,
      },
      {
        message: '$ で行末に飛べ',
        expectedKey: '$',
      },
      {
        message: '今度は a だ。カーソルの後ろに挿入する。i との違いを覚えろ',
        expectedKey: 'a',
      },
      {
        message: 'world! と6文字打ってみろ。まず w',
        expectedKey: 'w',
      },
      {
        message: 'o',
        expectedKey: 'o',
      },
      {
        message: 'r',
        expectedKey: 'r',
      },
      {
        message: 'l',
        expectedKey: 'l',
      },
      {
        message: 'd',
        expectedKey: 'd',
      },
      {
        message: '!',
        expectedKey: '!',
      },
      {
        message: 'Esc。Insert に入ったら必ず Esc。これが Vim の基本だ',
        expectedKey: 'Esc',
      },
      {
        message: '6文字で2ダメージ。5文字までは無料、超えた分は1文字1ダメージだ',
        expectedKey: null,
      },
      {
        message: 'Spaceで重ねてゴールと見比べ、残りも直せ',
        expectedKey: null,
      },
    ],
  },
  // ── Teach: /* */ で囲む (I で行頭、A で行末) ──
  // opt = 5 (I…Esc(1) + A…Esc(1) + j(1) + I…Esc(1) + A…Esc(1))
  {
    id: 'edit-surround',
    nodeId: NodeId.Edit,
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
    id: 'edit-newline',
    nodeId: NodeId.Edit,
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
  // ── Teach: typo を直す (2行分) ──
  // opt = 4 (l + re + j + ro)
  {
    id: 'edit-replace',
    nodeId: NodeId.Edit,
    type: 'tutorial',
    title: '一文字直せ',
    language: 'plaintext',
    initialText: 'hallo\nwarld',
    goalText: 'hello\nworld',
    initialCursor: { line: 0, col: 0 },
    life: 10,
    stars: [4, 5, 7],
    availableCommands: ['x', 'X', 'i', 'a', 'I', 'A', 'o', 'O', 'r'],
    hints: [{ cost: 1, commands: ['l', 're', 'j', 'ro'] }],
    flavor: 'r で 1 文字だけ置換。x+i より速いぞ',
    newCommands: ['r'],
    tutorial: [
      {
        message: 'l で a の上にカーソルを移動しろ',
        expectedKey: 'l',
      },
      {
        message: 'r を押してから e と打て。1文字だけ入れ替える',
        expectedKey: 're',
      },
      {
        message: 'r は Insert に入らず1文字置換。2行目の typo も直せ',
        expectedKey: null,
      },
    ],
  },
  // ── Teach: I で行頭挿入 → . で繰り返し ──
  // opt = 7 (I + '* ' + Esc + j + . + j + .)
  {
    id: 'edit-repeat',
    nodeId: NodeId.Edit,
    type: 'tutorial',
    title: 'リピートせよ',
    language: 'plaintext',
    initialText: 'apple\nbanana\ncherry',
    goalText: '* apple\n* banana\n* cherry',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 6, 8],
    availableCommands: [],
    hints: [{ cost: 1, commands: ['I', '* ', 'Esc', 'j', '.', 'j', '.'] }],
    flavor: 'I で行頭に挿入。. で同じ操作を次の行にも一発リピート',
    newCommands: ['.'],
    tutorial: [
      {
        message: 'I で行頭に移動し Insert モードに入れ',
        expectedKey: 'I',
      },
      {
        message: '* (アスタリスク+スペース) と打て',
        expectedKey: '*',
      },
      {
        message: 'スペースを打て',
        expectedKey: ' ',
      },
      {
        message: 'Esc で Normal に戻れ',
        expectedKey: 'Esc',
      },
      {
        message: 'j で次の行へ',
        expectedKey: 'j',
      },
      {
        message: '. を押せ。直前の I + "* " が一発で繰り返される',
        expectedKey: '.',
      },
      {
        message: '. は直前の変更操作を丸ごと繰り返す。Vim の奥義だ。j + . で最後の行も片付けろ',
        expectedKey: null,
      },
    ],
  },
  // ── Practice: 編集基礎の総合 (旧 N02-C) ──
  // opt = 11: l(1)+a…p…Esc(1)+j(1)+x(1)+j(1)+re(1)+I…Esc(1)+k(1)+.(1)+k(1)+.(1)
  {
    id: 'edit-practice',
    nodeId: NodeId.Edit,
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
