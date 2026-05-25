import type { Tutorial } from '../../types/tutorial'

/** N16-T: 単語を掴め (iw, aw) */
export const N16_T_TUTORIAL: Tutorial = {
  nodeId: 'N16',
  stageId: 'N16-T',
  steps: [
    {
      message: 'w で次の単語に移動しろ',
      expectedKey: 'w',
    },
    {
      message: 'diw と押せ。単語だけ消える…が空白が残る',
      expectedKey: 'diw',
    },
    {
      message: 'u で元に戻せ。今度は daw を試そう',
      expectedKey: 'u',
    },
    {
      message: 'daw と押せ。空白ごとスッキリ消える',
      expectedKey: 'daw',
    },
    {
      message: 'daw は空白ごと消す。残りの不要語も daw で消せ',
      expectedKey: null,
    },
  ],
}
