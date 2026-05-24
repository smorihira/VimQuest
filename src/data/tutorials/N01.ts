import type { Tutorial } from '../../types/tutorial'

/**
 * N01 チュートリアル: 基礎訓練
 * 8ステージそれぞれに対応するチュートリアル。
 */

/** N01-1: 左右に動け (h/l) */
export const N01_1_TUTORIAL: Tutorial = {
  nodeId: 'N01',
  stageId: 'N01-1',
  initialSetup: {
    text: 'hello!',
    cursor: { line: 0, col: 0 },
  },
  steps: [
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
}

/** N01-2: 上下に動け (j/k) */
export const N01_2_TUTORIAL: Tutorial = {
  nodeId: 'N01',
  stageId: 'N01-2',
  steps: [
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
}

/** N01-3: 単語を飛べ (w/b/e) */
export const N01_3_TUTORIAL: Tutorial = {
  nodeId: 'N01',
  stageId: 'N01-3',
  steps: [
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
}

/** N01-4: WORDで飛べ (W/B/E) */
export const N01_4_TUTORIAL: Tutorial = {
  nodeId: 'N01',
  stageId: 'N01-4',
  steps: [
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
}

/** N01-5: 行の端へ飛べ (0/^/$) */
export const N01_5_TUTORIAL: Tutorial = {
  nodeId: 'N01',
  stageId: 'N01-5',
  steps: [
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
}

/** N01-6: ファイルの端へ (gg/G) */
export const N01_6_TUTORIAL: Tutorial = {
  nodeId: 'N01',
  stageId: 'N01-6',
  steps: [
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
}

/** N01-7: 文字を消せ (x + undo) */
export const N01_7_TUTORIAL: Tutorial = {
  nodeId: 'N01',
  stageId: 'N01-7',
  steps: [
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
}

/** N01-8: 文字を書け (i/a + Esc) */
export const N01_8_TUTORIAL: Tutorial = {
  nodeId: 'N01',
  stageId: 'N01-8',
  steps: [
    // ── Short insert with `i` ──
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
      message: '1文字打って１ダメージ。insert 中は5文字まで1ダメージで済む',
      expectedKey: null,
    },
    // ── Long insert with `a` ──
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
      message:
        '6文字で2ダメージだ。5文字ごとに1ダメージ増えるぞ。Spaceで重ねてゴールと見比べ、残りも直せ',
      expectedKey: null,
    },
  ],
}

/** N01-9: 文字を置き換えろ (s) */
export const N01_9_TUTORIAL: Tutorial = {
  nodeId: 'N01',
  stageId: 'N01-9',
  steps: [
    {
      message: 's を押してみろ。カーソル上の文字を消して Insert に入るぞ',
      expectedKey: 's',
    },
    {
      message: 'u と打て',
      expectedKey: 'u',
    },
    {
      message: 'Esc で NORMAL に戻れ',
      expectedKey: 'Esc',
    },
    {
      message: 'i は前から、a は後ろから、s は上から。Insert の3つの入口を覚えろ',
      expectedKey: null,
    },
    {
      message: 'もう一箇所直してクリアしろ。w と l で移動して s だ',
      expectedKey: null,
    },
  ],
}

/** N01-C: 卒業試験 */
export const N01_C_TUTORIAL: Tutorial = {
  nodeId: 'N01',
  stageId: 'N01-C',
  steps: [
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
      message: 'さぁ、始めろ。x で消して i/a で挿入、s で置き換えだ',
      expectedKey: null,
    },
  ],
}
