import type { Tutorial } from '../../types/tutorial'

/** N20-T: 文字を選べ (v + d) */
export const N20_T_TUTORIAL: Tutorial = {
  nodeId: 'N20',
  stageId: 'N20-T',
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
      message: 'v で文字選択 → f で範囲指定 → d で削除。残りの <Foo> も同じ要領で消せ',
      expectedKey: null,
    },
  ],
}

/** N20-Ta: 行を選べ (V + d) */
export const N20_Ta_TUTORIAL: Tutorial = {
  nodeId: 'N20',
  stageId: 'N20-Ta',
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

/** N20-Tb: 矩形で切れ (Ctrl+v + d) */
export const N20_Tb_TUTORIAL: Tutorial = {
  nodeId: 'N20',
  stageId: 'N20-Tb',
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
