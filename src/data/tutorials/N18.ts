import type { Tutorial } from '../../types/tutorial'

/** N18-T: トグルせよ (~) */
export const N18_T_TUTORIAL: Tutorial = {
  nodeId: 'N18',
  stageId: 'N18-T',
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

/** N18-Ta: 大文字にしろ (gu, gU) */
export const N18_Ta_TUTORIAL: Tutorial = {
  nodeId: 'N18',
  stageId: 'N18-Ta',
  steps: [
    {
      message: 'guiw と押せ。カーソル下の単語が小文字になる',
      expectedKey: 'guiw',
    },
    {
      message: 'w で次の単語へ',
      expectedKey: 'w',
    },
    {
      message: 'gUiw と押せ。今度は大文字になる',
      expectedKey: 'gUiw',
    },
    {
      message: 'gu で小文字、gU で大文字。残りも直せ',
      expectedKey: null,
    },
  ],
}
