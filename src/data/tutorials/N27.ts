import type { Tutorial } from '../../types/tutorial'

/** N27-1: 文字を選べ (v + d) */
export const N27_1_TUTORIAL: Tutorial = {
  nodeId: 'N27',
  stageId: 'N27-1',
  steps: [
    {
      message: 'f< で < に移動',
      expectedKey: 'f<',
    },
    {
      message: 'v を押せ。文字単位の選択モードに入る',
      expectedKey: 'v',
    },
    {
      message: 'f> で > まで選択範囲を広げろ',
      expectedKey: 'f>',
    },
    {
      message: 'd で選択範囲を削除',
      expectedKey: 'd',
    },
    {
      message: 'v で文字選択 → カーソル移動で範囲指定 → d で削除。これが Visual char だ',
      expectedKey: null,
    },
  ],
}

/** N27-2: 行を選べ (V + d) */
export const N27_2_TUTORIAL: Tutorial = {
  nodeId: 'N27',
  stageId: 'N27-2',
  steps: [
    {
      message: 'j で削除対象の行に移動',
      expectedKey: 'j',
    },
    {
      message: 'V を押せ。行全体が選択される',
      expectedKey: 'V',
    },
    {
      message: 'j でもう1行下まで選択を広げろ',
      expectedKey: 'j',
    },
    {
      message: 'd で選択した行を削除',
      expectedKey: 'd',
    },
    {
      message: 'V で行選択。残りの不要行も V+d で消せ',
      expectedKey: null,
    },
  ],
}

/** N27-3: 矩形で切れ (Ctrl+v + d) */
export const N27_3_TUTORIAL: Tutorial = {
  nodeId: 'N27',
  stageId: 'N27-3',
  steps: [
    {
      message: 'Ctrl+v を押せ。矩形選択モードに入る',
      expectedKey: 'Ctrl+v',
    },
    {
      message: 'j で下に選択範囲を広げろ',
      expectedKey: 'j',
    },
    {
      message: 'd で選択範囲を削除',
      expectedKey: 'd',
    },
    {
      message: 'Ctrl+v で矩形選択 → j で範囲拡大 → d で削除。残りも同じ要領で消せ',
      expectedKey: null,
    },
  ],
}
