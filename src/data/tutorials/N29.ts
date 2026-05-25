import type { Tutorial } from '../../types/tutorial'

/** N29-T: レジスタ入門 ("a レジスタでヤンク→ペースト) */
export const N29_T_TUTORIAL: Tutorial = {
  nodeId: 'N29',
  stageId: 'N29-T',
  steps: [
    {
      message: '"ayiw と押せ。"hello" を "a レジスタに保存',
      expectedKey: '"ayiw',
    },
    {
      message: '$ で行末に移動',
      expectedKey: '$',
    },
    {
      message: '"ap と押せ。"a レジスタの中身がペーストされる',
      expectedKey: '"ap',
    },
    {
      message: '"a に保存→"ap で呼び出し。2行目も "b レジスタで同じことをやれ',
      expectedKey: null,
    },
  ],
}
