import type { Tutorial } from '../../types/tutorial'

/** N05-T: トグルせよ (~) */
export const N05_T_TUTORIAL: Tutorial = {
  nodeId: 'N05',
  stageId: 'N05-T',
  steps: [
    {
      message: '~ を押せ。大文字と小文字を入れ替えるぞ',
      expectedKey: '~',
    },
    {
      message: '~ は大小トグル+カーソル前進。W も小文字に直せ',
      expectedKey: null,
    },
  ],
}
