import type { Tutorial } from '../../types/tutorial'

/** N30-T: 並び替えろ (dd + P で上にペースト) */
export const N30_T_TUTORIAL: Tutorial = {
  nodeId: 'N30',
  stageId: 'N30-T',
  steps: [
    {
      message: 'j で "A" に移動しろ',
      expectedKey: 'j',
    },
    {
      message: 'dd で "A" を切り取れ',
      expectedKey: 'dd',
    },
    {
      message: 'P を押せ。カーソルの上にペースト — 先頭に来た',
      expectedKey: 'P',
    },
    {
      message: 'p は下、P は上にペースト。"C" と "D" の順番も直せ',
      expectedKey: null,
    },
  ],
}
