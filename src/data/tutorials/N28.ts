import type { Tutorial } from '../../types/tutorial'

/** N28-T: コピーせよ (yiw + p) */
export const N28_T_TUTORIAL: Tutorial = {
  nodeId: 'N28',
  stageId: 'N28-T',
  steps: [
    {
      message: 'yiw と押せ。カーソル下の単語をヤンク（コピー）',
      expectedKey: 'yiw',
    },
    {
      message: '$ で行末に移動',
      expectedKey: '$',
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
