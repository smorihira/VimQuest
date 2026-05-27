import type { Tutorial } from '../../types/tutorial'

/** N03-T: 一文字直せ (r) */
export const N03_T_TUTORIAL: Tutorial = {
  nodeId: 'N02',
  stageId: 'N03-T',
  steps: [
    {
      message: 'l で a の上にカーソルを移動しろ',
      expectedKey: 'l',
    },
    {
      message: 'r を押してから e と打て。1文字だけ入れ替える',
      expectedKey: 're',
    },
    {
      message: 'r は Insert に入らず1文字置換。2行目の typo も直せ',
      expectedKey: null,
    },
  ],
}
