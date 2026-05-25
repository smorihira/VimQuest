import type { Tutorial } from '../../types/tutorial'

/** N24-T: リピート (ciw + .) */
export const N24_T_TUTORIAL: Tutorial = {
  nodeId: 'N24',
  stageId: 'N24-T',
  steps: [
    {
      message: 'ciw と押せ。"no" が消えて Insert に入る',
      expectedKey: 'ciw',
    },
    {
      message: 'yes と打て',
      expectedKey: 'y',
    },
    {
      message: 'e',
      expectedKey: 'e',
    },
    {
      message: 's',
      expectedKey: 's',
    },
    {
      message: 'Esc で確定',
      expectedKey: 'Esc',
    },
    {
      message: 'w で次の "no" に移動',
      expectedKey: 'w',
    },
    {
      message: '. を押せ。直前の ciw+yes が一発で繰り返される',
      expectedKey: '.',
    },
    {
      message: '. は直前の操作を繰り返す。Vim の奥義だ。残りも w + . で片付けろ',
      expectedKey: null,
    },
  ],
}
