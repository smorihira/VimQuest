import type { Tutorial } from '../../types/tutorial'

/** N10-T: 単語を消せ (dw/de の違い) */
export const N10_T_TUTORIAL: Tutorial = {
  nodeId: 'N10',
  stageId: 'N10-T',
  steps: [
    {
      message: 'w で "this" に移動しろ',
      expectedKey: 'w',
    },
    {
      message: 'de と押せ。単語だけ消える…が空白が残る',
      expectedKey: 'de',
    },
    {
      message: 'u で元に戻せ。今度は dw を試そう',
      expectedKey: 'u',
    },
    {
      message: 'dw と押せ。空白ごとスッキリ消える',
      expectedKey: 'dw',
    },
    {
      message: 'dw は空白ごと、de は単語だけ。残りの不要語も消せ',
      expectedKey: null,
    },
  ],
}
