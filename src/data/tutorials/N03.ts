import type { Tutorial } from '../../types/tutorial'

/** N03-T: 行を足せ (o, O) */
export const N03_T_TUTORIAL: Tutorial = {
  nodeId: 'N03',
  stageId: 'N03-T',
  steps: [
    {
      message: 'O を押せ。カーソルの上に新行を作って Insert に入る',
      expectedKey: 'O',
    },
    {
      message: 'A と打て',
      expectedKey: 'A',
    },
    {
      message: 'Esc で NORMAL に戻れ',
      expectedKey: 'Esc',
    },
    {
      message: 'j で B に戻れ',
      expectedKey: 'j',
    },
    {
      message: 'o を押せ。今度は下に新行を作る',
      expectedKey: 'o',
    },
    {
      message: 'C と打て',
      expectedKey: 'C',
    },
    {
      message: 'Esc',
      expectedKey: 'Esc',
    },
    {
      message: 'O は上、o は下に新行。残りも追加しろ',
      expectedKey: null,
    },
  ],
}
