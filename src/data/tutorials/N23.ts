import type { Tutorial } from '../../types/tutorial'

export const N23_T_TUTORIAL: Tutorial = {
  nodeId: 'N03',
  stageId: 'N23-T',
  steps: [
    { message: 'v を押せ。Visual モードに入るぞ', expectedKey: 'v' },
    { message: 'f] で ] まで選択範囲を広げろ', expectedKey: 'f]' },
    { message: 'x で選択範囲を削除だ', expectedKey: 'x' },
  ],
}

export const N23_Ta_TUTORIAL: Tutorial = {
  nodeId: 'N03',
  stageId: 'N23-Ta',
  steps: [
    { message: 'R を押せ。上書き（Replace）モードに入る', expectedKey: 'R' },
    { message: 'そのまま xyz と打て。1文字ずつ上書きされる', expectedKey: null },
    {
      message: 'Esc でノーマルに戻ったら fg でジャンプし、もう一度 R で書き換えろ',
      expectedKey: null,
    },
  ],
}
