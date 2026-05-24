import type { Tutorial } from '../../types/tutorial'

/** N09-T: 同じ奴を探せ (*, #) */
export const N09_T_TUTORIAL: Tutorial = {
  nodeId: 'N09',
  stageId: 'N09-T',
  steps: [
    {
      message: '* を押せ。カーソル下の foo を前方検索して次に飛ぶ',
      expectedKey: '*',
    },
    {
      message: '# を押せ。今度は後方に戻る',
      expectedKey: '#',
    },
    {
      message: '* で前方、# で後方。最後の foo まで飛べ',
      expectedKey: null,
    },
  ],
}
