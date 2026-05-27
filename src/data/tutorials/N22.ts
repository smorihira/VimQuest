import type { Tutorial } from '../../types/tutorial'

/** N22-T: レジスタ入門 ("a レジスタでヤンク→ペースト) */
export const N22_T_TUTORIAL: Tutorial = {
  nodeId: 'N10',
  stageId: 'N22-T',
  newCommands: ['"'],
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
