import type { Tutorial } from '../../types/tutorial'

/** N15-T: 数値を増やせ (Ctrl+a) */
export const N15_T_TUTORIAL: Tutorial = {
  nodeId: 'N15',
  stageId: 'N15-T',
  newCommands: ['Ctrl+a'],
  steps: [
    {
      message: 'Ctrl+a を押せ。カーソル上の数値が +1 される',
      expectedKey: 'Ctrl+a',
    },
    {
      message: 'Ctrl+a はカーソル位置以降の数値を増やす。次の行もやれ',
      expectedKey: null,
    },
  ],
}

/** N15-Ta: 数値を減らせ (Ctrl+x) */
export const N15_Ta_TUTORIAL: Tutorial = {
  nodeId: 'N15',
  stageId: 'N15-Ta',
  newCommands: ['Ctrl+x'],
  steps: [
    {
      message: 'Ctrl+x を押せ。カーソル上の数値が -1 される',
      expectedKey: 'Ctrl+x',
    },
    {
      message: 'Ctrl+x で数値を減らせる。残りも減らせ',
      expectedKey: null,
    },
  ],
}
