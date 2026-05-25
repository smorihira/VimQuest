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
      message: 'Esc で選択を解除',
      expectedKey: 'Esc',
    },
    {
      message: 'Ctrl+v で矩形選択、j で範囲拡大、d で削除。全3行の X を一度に消せ',
      expectedKey: null,
    },
  ],
}
