import type { Tutorial } from '../../types/tutorial'

/** N06-T: ページを飛べ (Ctrl+d, Ctrl+u) */
export const N06_T_TUTORIAL: Tutorial = {
  nodeId: 'N06',
  stageId: 'N06-T',
  steps: [
    {
      message: 'Ctrl+d を押せ。半ページ分カーソルが下に飛ぶ',
      expectedKey: 'Ctrl+d',
    },
    {
      message: 'Ctrl+u を押せ。今度は上に戻る',
      expectedKey: 'Ctrl+u',
    },
    {
      message: 'Ctrl+d で下、Ctrl+u で上。目標行まで飛べ',
      expectedKey: null,
    },
  ],
}
