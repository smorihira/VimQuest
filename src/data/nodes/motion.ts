import type { Stage } from '../../types/stage'
import { NodeId } from '../../types/nodeId'

/** モーション基礎 — h/j/k/l, w/b/e, 0/^/$, gg/G, f/t */
export const MOTION_STAGES: Stage[] = [
  // ── N01-1: 左右に動け ──
  {
    id: 'motion-hl',
    nodeId: NodeId.Motion,
    type: 'tutorial',
    title: '左右に動け',
    language: 'plaintext',
    initialText: 'hello!',
    goalText: 'hello!',
    initialCursor: { line: 0, col: 0 },
    life: 999,
    stars: [999, 999, 999],
    availableCommands: ['h', 'l'],
    clearConditions: { cursor: { line: 0, col: 5 } },
    hints: [{ cost: 1, commands: ['l', 'l', 'l', 'l', 'l'] }],
    flavor: 'カーソルを ! の上まで移動せよ',
    newCommands: ['h', 'l'],
    tutorial: [
      {
        message: 'l を押してみろ。右に動くぞ',
        expectedKey: 'l',
      },
      {
        message: 'もう一度 l だ',
        expectedKey: 'l',
      },
      {
        message: '今度は h で左に戻れ',
        expectedKey: 'h',
      },
      {
        message: 'Space を長押ししてゴールを確認しろ。離すと戻る',
        type: 'hold_space',
        expectedKey: null,
      },
      {
        message:
          'ゴールが浮かんだだろう？ 困ったら :h で答えを再生できるぞ（☆1確定）。プレイ中は画面右下に表示されるキューブでもOKだ',
        type: 'colon_command',
        colonCommand: ':h',
        expectedKey: null,
      },
      {
        message: ':e! でリトライだ。試してみろ',
        type: 'colon_command',
        colonCommand: ':e!',
        expectedKey: null,
      },
      {
        message: '左上の 📖 ボタンでこのチュートリアルをいつでも見返せるぞ。ツリー画面からも OK だ',
        expectedKey: null,
      },
      {
        message: ':q! でツリーに戻れる（Esc でも可）。さぁ、右端を目指せ',
        expectedKey: null,
      },
    ],
    tutorialSetup: {
      text: 'hello!',
      cursor: {
        line: 0,
        col: 0,
      },
    },
  },
  // ── N01-2: 上下に動け ──
  {
    id: 'motion-jk',
    nodeId: NodeId.Motion,
    type: 'tutorial',
    title: '上下に動け',
    language: 'plaintext',
    initialText: 'first line\nsecond line\nthird line',
    goalText: 'first line\nsecond line\nthird line',
    initialCursor: { line: 0, col: 0 },
    life: 999,
    stars: [999, 999, 999],
    availableCommands: ['h', 'j', 'k', 'l'],
    clearConditions: { cursor: { line: 2, col: 9 } },
    hints: [{ cost: 1, commands: ['j', 'j', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l'] }],
    flavor: '右下の e までカーソルを運べ',
    newCommands: ['j', 'k'],
    tutorial: [
      {
        message: 'j で下に移動だ',
        expectedKey: 'j',
      },
      {
        message: 'k で上に戻れる',
        expectedKey: 'k',
      },
      {
        message: 'l で右にも動けるぞ',
        expectedKey: 'l',
      },
      {
        message: 'hjkl の4方向を覚えたな。右下のゴールまで行ってみろ',
        expectedKey: null,
      },
    ],
  },
  // ── N01-3: 単語を飛べ ──
  {
    id: 'motion-word',
    nodeId: NodeId.Motion,
    type: 'tutorial',
    title: '単語を飛べ',
    language: 'plaintext',
    initialText: 'the quick brown fox jumps',
    goalText: 'the quick brown fox jumps',
    initialCursor: { line: 0, col: 0 },
    life: 999,
    stars: [999, 999, 999],
    availableCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e'],
    clearConditions: { cursor: { line: 0, col: 24 } },
    hints: [{ cost: 1, commands: ['w', 'w', 'w', 'w', 'e'] }],
    flavor: 'w と e で行の右端まで進め',
    newCommands: ['w', 'b', 'e'],
    tutorial: [
      {
        message: 'w で次の単語にジャンプだ',
        expectedKey: 'w',
      },
      {
        message: 'もう一度 w',
        expectedKey: 'w',
      },
      {
        message: 'b で前の単語に戻れる',
        expectedKey: 'b',
      },
      {
        message: 'e で単語の末尾に飛ぶ',
        expectedKey: 'e',
      },
      {
        message: 'w で単語の先頭、e で末尾に飛ぶ。行の右端まで進め',
        expectedKey: null,
      },
    ],
  },
  // ── N01-5: 行頭末ジャンプ ──
  {
    id: 'motion-line',
    nodeId: NodeId.Motion,
    type: 'tutorial',
    title: '行の端へ飛べ',
    language: 'plaintext',
    initialText: '    hello world',
    goalText: '    hello world',
    initialCursor: { line: 0, col: 8 },
    life: 999,
    stars: [999, 999, 999],
    availableCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '^', '$'],
    clearConditions: { cursor: { line: 0, col: 4 } },
    hints: [{ cost: 1, commands: ['^'] }],
    flavor: '^ で最初の文字、0 で行頭、$ で行末へ飛べる',
    newCommands: ['0', '^', '$'],
    tutorial: [
      {
        message: '$ で行末にジャンプだ',
        expectedKey: '$',
      },
      {
        message: '0 で行の先頭（列0）に戻れ',
        expectedKey: '0',
      },
      {
        message: '^ で最初の文字に飛ぶ。空白を飛ばしてくれる',
        expectedKey: '^',
      },
      {
        message: 'h に戻ったな。クリア条件も ^ だ',
        expectedKey: null,
      },
    ],
  },
  // ── N01-6: ファイルの端へ ──
  {
    id: 'motion-file',
    nodeId: NodeId.Motion,
    type: 'tutorial',
    title: 'ファイルの端へ',
    language: 'plaintext',
    initialText: 'line 1\nline 2\nline 3\nline 4\nline 5',
    goalText: 'line 1\nline 2\nline 3\nline 4\nline 5',
    initialCursor: { line: 0, col: 0 },
    life: 999,
    stars: [999, 999, 999],
    availableCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '^', '$', 'gg', 'G'],
    clearConditions: { cursor: { line: 4, col: 0 } },
    hints: [{ cost: 1, commands: ['G'] }],
    flavor: 'G でファイル末尾、gg でファイル先頭へ一瞬で飛べる',
    newCommands: ['gg', 'G'],
    tutorial: [
      {
        message: 'G でファイルの最終行にジャンプだ',
        expectedKey: 'G',
      },
      {
        message: 'gg で先頭行に戻れる',
        expectedKey: 'gg',
      },
      {
        message: 'G で最終行に飛んでクリアしろ',
        expectedKey: null,
      },
    ],
  },
  // ── Teach: f/t/;/, で行内ジャンプ ──
  // opt = 2 (f; + ;)
  {
    id: 'motion-find',
    nodeId: NodeId.Motion,
    type: 'tutorial',
    title: '狙い撃て',
    language: 'javascript',
    initialText: 'fn(a, b); fn(c, d);',
    goalText: 'fn(a, b); fn(c, d);',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '^', '$', 'gg', 'G', 'f', 't'],
    clearConditions: { cursor: { line: 0, col: 18 } },
    hints: [{ cost: 1, commands: ['f;', ';'] }],
    flavor: 'f で狙った文字に一瞬で飛べ。; で繰り返しだ',
    newCommands: ['f', 't', ';', ','],
    tutorial: [
      {
        message: 'f( と押せ。行内の ( に一瞬でジャンプ',
        expectedKey: 'f(',
      },
      {
        message: '; を押せ。直前の f を繰り返す',
        expectedKey: ';',
      },
      {
        message: ', を押せ。逆方向に繰り返す',
        expectedKey: ',',
      },
      {
        message: 't) と押せ。) の1文字手前に止まる',
        expectedKey: 't)',
      },
      {
        message: 'f で直接、t で手前。; で繰り返し、, で逆方向だ',
        expectedKey: null,
      },
    ],
  },
  // ── N01-P: 卒業試験 (旧 N01-C) ──
  // opt = 5 (G + k + k + fg + h) → navigate to 'a' of 'age' at (4, 11)
  {
    id: 'motion-practice',
    nodeId: NodeId.Motion,
    type: 'practice',
    title: '卒業試験',
    language: 'javascript',
    initialText:
      'function validateInput(data) {\n  if (!data) return false;\n  if (!data.name) return false;\n  if (!data.email) return false;\n  if (data.age < 0) return false;\n  return true;\n}',
    goalText:
      'function validateInput(data) {\n  if (!data) return false;\n  if (!data.name) return false;\n  if (!data.email) return false;\n  if (data.age < 0) return false;\n  return true;\n}',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 7, 9],
    availableCommands: [],
    clearConditions: { cursor: { line: 4, col: 11 } },
    hints: [{ cost: 1, commands: ['G', 'k', 'k', 'fg', 'h'] }],
    flavor: 'モーションを組み合わせて最短で目標に到達せよ',
    newCommands: [],
    tutorial: [
      {
        message: '基礎訓練の総仕上げだ。全ての武器を使って、4行のタイプミスを修正しろ',
        expectedKey: null,
      },
      {
        message:
          'ここでマスターした武器は「BASE」として、これから先の全ステージで常に使えるぞ。手札の BASE ▸ で確認できる',
        expectedKey: null,
      },
      {
        message: 'さぁ、始めろ。f でジャンプ、r で置換、i/a で挿入だ',
        expectedKey: null,
      },
    ],
  },
]
