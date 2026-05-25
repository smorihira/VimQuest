import type { Tutorial } from '../../types/tutorial'

/** N14-T: 範囲を断て (dt) */
export const N14_T_TUTORIAL: Tutorial = {
  nodeId: 'N14',
  stageId: 'N14-T',
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

/** N14-Ta: 書き換えろ (cf/ct 比較) */
export const N14_Ta_TUTORIAL: Tutorial = {
  nodeId: 'N14',
  stageId: 'N14-Ta',
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
      message: 'cf; と押せ。";" まで消えて Insert に入る',
      expectedKey: 'cf;',
    },
    {
      message: 'blue; と打て（";" も消えたので自分で打つ）',
      expectedKey: 'b',
    },
    {
      message: 'l',
      expectedKey: 'l',
    },
    {
      message: 'u',
      expectedKey: 'u',
    },
    {
      message: 'e',
      expectedKey: 'e',
    },
    {
      message: ';',
      expectedKey: ';',
    },
    {
      message: 'Esc で確定',
      expectedKey: 'Esc',
    },
    {
      message: 'u で戻す。今度は ct; を試そう',
      expectedKey: 'u',
    },
    {
      message: 'ct; と押せ。";" の手前まで消える',
      expectedKey: 'ct;',
    },
    {
      message: 'blue と打て（";" は残っている）',
      expectedKey: 'b',
    },
    {
      message: 'l',
      expectedKey: 'l',
    },
    {
      message: 'u',
      expectedKey: 'u',
    },
    {
      message: 'e',
      expectedKey: 'e',
    },
    {
      message: 'Esc で確定',
      expectedKey: 'Esc',
    },
    {
      message: 'cf は文字ごと、ct は手前まで。2行目も直せ',
      expectedKey: null,
    },
  ],
}
