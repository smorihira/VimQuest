import type { Tutorial } from '../../types/tutorial'

/** N29-T: コピーせよ (yiw + p) */
export const N29_T_TUTORIAL: Tutorial = {
  nodeId: 'N29',
  stageId: 'N29-T',
  steps: [
    {
      message: 'yiw と押せ。カーソル下の単語をヤンク（コピー）',
      expectedKey: 'yiw',
    },
    {
      message: 'e で単語の末尾に移動',
      expectedKey: 'e',
    },
    {
      message: 'p でヤンクした内容をペースト',
      expectedKey: 'p',
    },
    {
      message: 'yiw でコピー、p でペースト。2行目も同じことをやれ',
      expectedKey: null,
    },
  ],
}
