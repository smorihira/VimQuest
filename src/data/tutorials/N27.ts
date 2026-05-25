import type { Tutorial } from '../../types/tutorial'

/** N27-T: 選んで消せ (V + d) */
export const N27_T_TUTORIAL: Tutorial = {
  nodeId: 'N27',
  stageId: 'N27-T',
  steps: [
    {
      message: 'j で削除対象の行に移動しろ',
      expectedKey: 'j',
    },
    {
      message: 'V を押せ。行全体が選択される',
      expectedKey: 'V',
    },
    {
      message: 'd で選択範囲を削除',
      expectedKey: 'd',
    },
    {
      message: 'V で行選択、d で削除。残りの不要行も消せ',
      expectedKey: null,
    },
  ],
}
