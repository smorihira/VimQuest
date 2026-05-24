import type { Tutorial } from '../../types/tutorial'

/** N16-T: 対を見つけろ (%) */
export const N16_T_TUTORIAL: Tutorial = {
  nodeId: 'N16',
  stageId: 'N16-T',
  steps: [
    {
      message: 'f{ と押せ。行内の { に直接飛べる',
      expectedKey: 'f{',
    },
    {
      message: '% を押せ。対応する } にジャンプする',
      expectedKey: '%',
    },
    {
      message: '% で括弧の対を行き来。2行目でも同じように飛べ',
      expectedKey: null,
    },
  ],
}
