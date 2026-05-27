import type { Tutorial } from '../../types/tutorial'

/** N08-T: 単語を消せ (dw/de の違い) */
export const N08_T_TUTORIAL: Tutorial = {
  nodeId: 'N05',
  stageId: 'N08-T',
  newCommands: ['d'],
  steps: [
    {
      message: 'w で "this" に移動しろ',
      expectedKey: 'w',
    },
    {
      message: 'de と押せ。単語だけ消える…が空白が残る',
      expectedKey: 'de',
    },
    {
      message: 'u で元に戻せ。今度は dw を試そう',
      expectedKey: 'u',
    },
    {
      message: 'dw と押せ。空白ごとスッキリ消える',
      expectedKey: 'dw',
    },
    {
      message: 'dw は空白ごと、de は単語だけ。残りの不要語も消せ',
      expectedKey: null,
    },
  ],
}

/** N08-Ta: 行を消せ (dd) */
export const N08_Ta_TUTORIAL: Tutorial = {
  nodeId: 'N05',
  stageId: 'N08-Ta',
  newCommands: [],
  steps: [
    {
      message: 'j でデバッグ行に移動しろ',
      expectedKey: 'j',
    },
    {
      message: 'dd を押せ。行まるごと消える',
      expectedKey: 'dd',
    },
    {
      message: 'dd は行削除。もう1本のデバッグ行も消せ',
      expectedKey: null,
    },
  ],
}

/** N08-Tb: 末尾を切れ (d0, d$) */
export const N08_Tb_TUTORIAL: Tutorial = {
  nodeId: 'N05',
  stageId: 'N08-Tb',
  newCommands: [],
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
