import type { Tutorial } from '../../types/tutorial'

/** N21-T: 精密除去 (diw) */
export const N21_T_TUTORIAL: Tutorial = {
  nodeId: 'N21',
  stageId: 'N21-T',
  steps: [
    {
      message: 'w で "temp" に移動しろ',
      expectedKey: 'w',
    },
    {
      message: 'diw と押せ。単語だけ消えて空白は残る',
      expectedKey: 'diw',
    },
    {
      message: 'diw は空白を残して単語だけ消す。残りも消せ',
      expectedKey: null,
    },
  ],
}
