import type { Tutorial } from '../../types/tutorial'

/** N12-T: 末尾を切れ (d0, d$) */
export const N12_T_TUTORIAL: Tutorial = {
  nodeId: 'N12',
  stageId: 'N12-T',
  steps: [
    {
      message: 'd0 を押せ。カーソルから行頭まで一気に消える',
      expectedKey: 'd0',
    },
    {
      message: 'd0 は行頭まで、d$ は行末まで削除。残りのコメントも d$ で消せ',
      expectedKey: null,
    },
  ],
}
