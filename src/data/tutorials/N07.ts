import type { Tutorial } from '../../types/tutorial'

/** N07-T: 画面を合わせろ (zz, zt, zb) */
export const N07_T_TUTORIAL: Tutorial = {
  nodeId: 'N07',
  stageId: 'N07-T',
  steps: [
    {
      message: 'Ctrl+d で半ページ下へ飛べ',
      expectedKey: 'Ctrl+d',
    },
    {
      message: 'zz を押せ。カーソル行が画面中央に来る',
      expectedKey: 'zz',
    },
    {
      message: 'zt を押せ。今度はカーソル行が画面上端に来る',
      expectedKey: 'zt',
    },
    {
      message: 'zb を押せ。画面下端に配置する',
      expectedKey: 'zb',
    },
    {
      message: '3つの画面調整を覚えた。TARGET 行で zz を決めろ',
      expectedKey: null,
    },
  ],
}
