import type { Tutorial } from '../../types/tutorial'

/**
 * N01 チュートリアル: 基本移動 (h/j/k/l)
 * ゲーム最初のチュートリアル。4方向の移動を体験。
 */
export const N01_TUTORIAL: Tutorial = {
    nodeId: 'N01',
    initialSetup: {
        text: 'hello\nworld',
        cursor: { line: 0, col: 0 },
    },
    steps: [
        {
            message: 'Vimでは h j k l で移動する。まずは l を押して右に動いてみろ',
            expectedKey: 'l',
        },
        {
            message: 'いいぞ。もう一度 l だ',
            expectedKey: 'l',
        },
        {
            message: '今度は h で左に戻ってみろ',
            expectedKey: 'h',
        },
        {
            message: '次は j で下の行へ移動だ',
            expectedKey: 'j',
        },
        {
            message: 'k で上の行に戻れ',
            expectedKey: 'k',
        },
        {
            message: '自由に動いてみろ。終わったら Enter で次へ',
            expectedKey: 'Enter',
            acceptedKeys: ['h', 'j', 'k', 'l'],
        },
        {
            message: 'h j k l — これがVimの基本移動だ。覚えておけ',
            expectedKey: null,
        },
    ],
}
