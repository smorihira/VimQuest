import type { Tutorial } from '../../types/tutorial'

/** N14-T: 行をつなげ (J) */
export const N14_T_TUTORIAL: Tutorial = {
  nodeId: 'N14',
  stageId: 'N14-T',
  steps: [
    {
      message: 'J を押せ。下の行を現在行にくっつける',
      expectedKey: 'J',
    },
    {
      message: 'J は行結合。残りも1行にまとめろ',
      expectedKey: null,
    },
  ],
}
