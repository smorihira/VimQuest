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
            message: '💡 Space を長押しするとゴール位置が浮かび上がる。目標を確認しろ',
            expectedKey: null,
        },
        {
            message: 'よし。l で右端まで行ってみろ',
            expectedKey: null,
        },
        {
            message: '💡 困ったら :h と入力してみろ。答えが再生される。ただし ☆1 確定だ',
            expectedKey: null,
        },
        {
            message: '💡 :q! でツリーに戻れる（Escでも可）。:r でリトライだ',
            expectedKey: null,
        },
    ],
}

/** N01-2: 上下に動け (j/k) */
export const N01_2_TUTORIAL: Tutorial = {
    nodeId: 'N01',
    stageId: 'N01-2',
    initialSetup: {
        text: 'first line\nsecond line\nthird line',
        cursor: { line: 0, col: 0 },
    },
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
    initialSetup: {
        text: 'the quick brown fox jumps',
        cursor: { line: 0, col: 0 },
    },
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
    initialSetup: {
        text: 'arr.push(x); return obj.key;',
        cursor: { line: 0, col: 0 },
    },
    steps: [
        {
            message: 'w を押してみろ。. で止まるだろう',
            expectedKey: 'w',
        },
        {
            message: '0 で行頭に戻れ',
            expectedKey: '0',
        },
        {
            message: '今度は W だ。空白まで一気に飛ぶ',
            expectedKey: 'W',
        },
        {
            message: 'W は記号をまたいで飛ぶ。return までたどり着いたな',
            expectedKey: null,
        },
    ],
}

/** N01-5: 行の端へ飛べ (0/^/$) */
export const N01_5_TUTORIAL: Tutorial = {
    nodeId: 'N01',
    stageId: 'N01-5',
    initialSetup: {
        text: '    hello world',
        cursor: { line: 0, col: 8 },
    },
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
    initialSetup: {
        text: 'line 1\nline 2\nline 3\nline 4\nline 5',
        cursor: { line: 0, col: 0 },
    },
    steps: [
        {
            message: 'G でファイルの最終行にジャンプだ',
            expectedKey: 'G',
        },
        {
            message: 'gg で先頭行に戻れる',
            expectedKey: 'g',
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
    initialSetup: {
        text: 'hellllo world',
        cursor: { line: 0, col: 3 },
    },
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
            message: 'u と Ctrl+R はいつでも使えるセーフティネットだ。覚えておけ',
            expectedKey: null,
        },
    ],
}

/** N01-8: 文字を書け (i/a + Esc) */
export const N01_8_TUTORIAL: Tutorial = {
    nodeId: 'N01',
    stageId: 'N01-8',
    initialSetup: {
        text: 'hllo worl',
        cursor: { line: 0, col: 1 },
    },
    steps: [
        {
            message: 'i を押すとカーソルの前に文字を挿入できる',
            expectedKey: 'i',
        },
        {
            message: 'e と打ってみろ',
            expectedKey: 'e',
        },
        {
            message: 'Esc で元のモードに戻れ',
            expectedKey: 'Esc',
        },
        {
            message: 'w で次の単語へジャンプだ',
            expectedKey: 'w',
        },
        {
            message: 'e で単語の末尾に移動',
            expectedKey: 'e',
        },
        {
            message: 'a を押すとカーソルの後ろに挿入できる。i との違いを覚えろ',
            expectedKey: 'a',
        },
        {
            message: 'd と打て',
            expectedKey: 'd',
        },
        {
            message: 'Esc で戻れ。Insert に入ったら必ず Esc。これが Vim の基本だ',
            expectedKey: 'Esc',
        },
    ],
}
