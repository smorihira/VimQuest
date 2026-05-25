import type { Tutorial } from '../../types/tutorial'

/** N28-T: 矩形で切れ (Ctrl+v) */
export const N28_T_TUTORIAL: Tutorial = {
  nodeId: 'N28',
  stageId: 'N28-T',
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
      message: 'もう一度 j で3行目まで選択',
      expectedKey: 'j',
    },
    {
      message: 'd で選択範囲を削除',
      expectedKey: 'd',
    },
    {
      message: 'Ctrl+v で矩形選択 → j で範囲拡大 → d で削除。残りの3行も同じ要領で消せ',
      expectedKey: null,
    },
  ],
}
