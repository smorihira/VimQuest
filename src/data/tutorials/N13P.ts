import type { Tutorial } from '../../types/tutorial'

/** N13-P: C/Sで書き換え */
export const N13_P_TUTORIAL: Tutorial = {
  nodeId: 'N13',
  stageId: 'N13-P',
  steps: [
    {
      message: 'C を押せ。カーソルから行末まで消して Insert に入る',
      expectedKey: 'C',
    },
    {
      message: 'ok; と打て',
      expectedKey: 'o',
    },
    {
      message: 'k',
      expectedKey: 'k',
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
      message: 'j で2行目へ',
      expectedKey: 'j',
    },
    {
      message: 'S を押せ。行全体を消して Insert に入る',
      expectedKey: 'S',
    },
    {
      message: 'new と打て',
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
      message: 'Esc で確定。C は c$、S は cc のショートカットだ',
      expectedKey: 'Esc',
    },
    {
      message: 'C は行末まで変更、S は行全体を変更。覚えておこう',
      expectedKey: null,
    },
  ],
}
