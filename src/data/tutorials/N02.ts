import type { Tutorial } from '../../types/tutorial'

/**
 * N02 チュートリアル: 1文字削除 (x) + undo (u)
 * xで消す→消しすぎ→uで戻す、の流れ。
 */
export const N02_TUTORIAL: Tutorial = {
  nodeId: 'N02',
  initialSetup: {
    text: 'hello world',
    cursor: { line: 0, col: 0 },
  },
  steps: [
    {
      message: 'x は目の前の文字を消す武器だ。押してみろ',
      expectedKey: 'x',
    },
    {
      message: 'もう一度。x で文字を消せ',
      expectedKey: 'x',
    },
    {
      message: 'おっと、消しすぎたな。大丈夫、u を押せば元に戻せる',
      expectedKey: 'u',
    },
    {
      message: 'もう一度 u だ。何回でも戻せるぞ',
      expectedKey: 'u',
    },
    {
      message: 'これが undo。いつでも使える安全網だ。覚えておけ',
      expectedKey: null,
    },
  ],
}
