import type { Tutorial } from '../../types/tutorial'

/** N23-T: ショートカット (s, S) */
export const N23_T_TUTORIAL: Tutorial = {
  nodeId: 'N23',
  stageId: 'N23-T',
  steps: [
    {
      message: 's を押せ。1文字消して Insert に入る',
      expectedKey: 's',
    },
    {
      message: 'y と打て',
      expectedKey: 'y',
    },
    {
      message: 'Esc で確定',
      expectedKey: 'Esc',
    },
    {
      message: 'j で2行目に移動',
      expectedKey: 'j',
    },
    {
      message: 'S を押せ。行全体を消して Insert に入る',
      expectedKey: 'S',
    },
    {
      message: 'new code; と打て',
      expectedKey: 'n',
    },
    {
      message: 'e',
      expectedKey: 'e',
    },
    {
      message: 'w',
      expectedKey: 'w',
    },
    {
      message: ' ',
      expectedKey: ' ',
    },
    {
      message: 'c',
      expectedKey: 'c',
    },
    {
      message: 'o',
      expectedKey: 'o',
    },
    {
      message: 'd',
      expectedKey: 'd',
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
      message: 's は1文字、S は行全体、C は行末まで変更。3行目も直せ',
      expectedKey: null,
    },
  ],
}
