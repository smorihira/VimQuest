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
      message: 'j で2行目に移動',
      expectedKey: 'j',
    },
    {
      message: 'もう一度 %。今度は } から { へ飛ぶ',
      expectedKey: '%',
    },
    {
      message: '% で括弧の対を自在に行き来できる。これが Vim の括弧ジャンプだ',
      expectedKey: null,
    },
  ],
}
