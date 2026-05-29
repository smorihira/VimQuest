import type { Stage } from '../../types/stage'
import { NodeId } from '../../types/nodeId'

/**
 * motion: 基礎訓練 (h/j/k/l/w/b/e/W/B/E/0/^/$/gg/G/x/i/a)
 * ゲーム最初のノード。8ステージ構成のチュートリアルノード。
 * 連続プレイ（ツリー非表示）。ライフ/☆評価なし。
 */

export const N01_STAGES: Stage[] = [
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

  // ── N01-4: WORDで飛べ ──
  {
    id: 'motion-adv-word',
    nodeId: NodeId.MotionAdv,
    type: 'tutorial',
    title: 'WORDで飛べ',
    language: 'javascript',
    initialText: 'arr.push(x); return obj.key;',
    goalText: 'arr.push(x); return obj.key;',
    initialCursor: { line: 0, col: 0 },
    life: 999,
    stars: [999, 999, 999],
    availableCommands: ['W', 'B', 'E'],
    clearConditions: { cursor: { line: 0, col: 27 } },
    hints: [{ cost: 1, commands: ['W', 'W', 'W'] }],
    flavor: 'W は記号をまたいで空白区切りで飛ぶ。末尾の ; まで一気に行け',
    newCommands: ['W', 'B', 'E'],
    tutorial: [
      {
        message: 'w を押してみろ。. で止まるだろう',
        expectedKey: 'w',
      },
      {
        message: 'b で前の単語に戻れ',
        expectedKey: 'b',
      },
      {
        message: '今度は W だ。空白まで一気に飛ぶ',
        expectedKey: 'W',
      },
      {
        message: 'W は記号をまたいで飛ぶ。末尾の ; まで W で一気に行け',
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
