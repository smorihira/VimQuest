import type { Tutorial } from '../../types/tutorial'

/** N10-T: リピートせよ (I + .) */
export const N10_T_TUTORIAL: Tutorial = {
  nodeId: 'N10',
  stageId: 'N10-T',
  steps: [
    {
      message: 'I で行頭に移動し Insert モードに入れ',
      expectedKey: 'I',
    },
    {
      message: '* (アスタリスク+スペース) と打て',
      expectedKey: '*',
    },
    {
      message: 'スペースを打て',
      expectedKey: ' ',
    },
    {
      message: 'Esc で Normal に戻れ',
      expectedKey: 'Esc',
    },
    {
      message: 'j で次の行へ',
      expectedKey: 'j',
    },
    {
      message: '. を押せ。直前の I + "* " が一発で繰り返される',
      expectedKey: '.',
    },
    {
      message: '. は直前の変更操作を丸ごと繰り返す。Vim の奥義だ。j + . で最後の行も片付けろ',
      expectedKey: null,
    },
  ],
}
