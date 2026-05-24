import type { Tutorial } from '../../types/tutorial'

/** N11-T: 行を消せ (dd) */
export const N11_T_TUTORIAL: Tutorial = {
  nodeId: 'N11',
  stageId: 'N11-T',
  steps: [
    {
      message: 'j でデバッグ行に移動しろ',
      expectedKey: 'j',
    },
    {
      message: 'dd を押せ。行まるごと消える',
      expectedKey: 'dd',
    },
    {
      message: 'dd は行削除。もう1本のデバッグ行も消せ',
      expectedKey: null,
    },
  ],
}
