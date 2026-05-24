import type { Tutorial } from '../../types/tutorial'

/** N25-T: 大文字にしろ (gu, gU) */
export const N25_T_TUTORIAL: Tutorial = {
  nodeId: 'N25',
  stageId: 'N25-T',
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
