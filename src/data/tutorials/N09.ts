import type { Tutorial } from '../../types/tutorial'

/** N09-T: 単語を変えろ (cw の基本) */
export const N09_T_TUTORIAL: Tutorial = {
  nodeId: 'N09',
  stageId: 'N09-T',
  steps: [
    {
      message: 'cw を押せ。単語が消えて Insert モードに入る',
      expectedKey: 'cw',
    },
    {
      message: 'c は "change"。d + i を一発でやる技だ。残りも変えろ',
      expectedKey: null,
    },
  ],
}

/** N09-Ta: 行を書き換えろ (cc) */
export const N09_Ta_TUTORIAL: Tutorial = {
  nodeId: 'N09',
  stageId: 'N09-Ta',
  steps: [
    {
      message: 'cc を押せ。行まるごと消えて Insert に入る',
      expectedKey: 'cc',
    },
    {
      message: 'cc は行全体を書き換える。dd + O より一発で速い',
      expectedKey: null,
    },
  ],
}

/** N09-Tb: 末尾を変えろ (c$) */
export const N09_Tb_TUTORIAL: Tutorial = {
  nodeId: 'N09',
  stageId: 'N09-Tb',
  steps: [
    {
      message: 'c$ を押せ。カーソルから行末まで消えて Insert に入る',
      expectedKey: 'c$',
    },
    {
      message: 'c$ は行末まで変更。次の行も書き換えろ',
      expectedKey: null,
    },
  ],
}
