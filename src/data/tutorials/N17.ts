import type { Tutorial } from '../../types/tutorial'

/** N17-T: 範囲を断て (dt) */
export const N17_T_TUTORIAL: Tutorial = {
  nodeId: 'N17',
  stageId: 'N17-T',
  steps: [
    {
      message: 'w で値の部分に向かえ',
      expectedKey: 'w',
    },
    {
      message: 'もう一回 w',
      expectedKey: 'w',
    },
    {
      message: 'dt1 と押せ。"1" の手前まで削除される',
      expectedKey: 'dt1',
    },
    {
      message: 'dt は指定文字の手前まで削除。残りも同じように直せ',
      expectedKey: null,
    },
  ],
}
