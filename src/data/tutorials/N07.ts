import type { Tutorial } from '../../types/tutorial'

/** N07-T: コピーせよ (yiw + p) */
export const N07_T_TUTORIAL: Tutorial = {
  nodeId: 'N05',
  stageId: 'N07-T',
  newCommands: ['y', 'p'],
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
