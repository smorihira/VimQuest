import type { Tutorial } from '../../types/tutorial'

/** N20-T: インデントせよ (>>, <<) */
export const N20_T_TUTORIAL: Tutorial = {
  nodeId: 'N13',
  stageId: 'N20-T',
  steps: [
    {
      message: 'j で print の行に移動しろ',
      expectedKey: 'j',
    },
    {
      message: '>> と押せ。インデントを追加する',
      expectedKey: '>>',
    },
    {
      message: 'j を2回押して return の行に移動しろ',
      expectedKey: 'j',
    },
    {
      message: 'もう一回 j',
      expectedKey: 'j',
    },
    {
      message: '<< と押せ。今度はインデントを削除する',
      expectedKey: '<<',
    },
    {
      message: '>> で追加、<< で削除。残りの行も直せ',
      expectedKey: null,
    },
  ],
}
