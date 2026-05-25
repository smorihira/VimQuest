import type { Tutorial } from '../../types/tutorial'

/** N10-T: Dで断て (D = d$) */
export const N10_T_TUTORIAL: Tutorial = {
  nodeId: 'N10',
  stageId: 'N10-T',
  steps: [
    {
      message: 'D を押せ。カーソルから行末まで一発で消える',
      expectedKey: 'D',
    },
    {
      message: 'D は d$ のショートカット。2行目も同じように消せ',
      expectedKey: null,
    },
  ],
}

/** N10-Ta: C/Sで書き換え */
export const N10_Ta_TUTORIAL: Tutorial = {
  nodeId: 'N10',
  stageId: 'N10-Ta',
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

/** N10-Tb: 行をつなげ (J) */
export const N10_Tb_TUTORIAL: Tutorial = {
  nodeId: 'N10',
  stageId: 'N10-Tb',
  steps: [
    {
      message: 'J を押せ。下の行を現在行にくっつける',
      expectedKey: 'J',
    },
    {
      message: 'J は行結合。残りも1行にまとめろ',
      expectedKey: null,
    },
  ],
}
