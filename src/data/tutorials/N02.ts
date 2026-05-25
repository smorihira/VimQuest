import type { Tutorial } from '../../types/tutorial'

/** N02-T: コメントで囲め (I, A) */
export const N02_T_TUTORIAL: Tutorial = {
  nodeId: 'N02',
  stageId: 'N02-T',
  steps: [
    {
      message: 'I を押せ。カーソルがどこにいても行頭で Insert に入る',
      expectedKey: 'I',
    },
    {
      message: '/* と打て。まず /',
      expectedKey: '/',
    },
    {
      message: '*',
      expectedKey: '*',
    },
    {
      message: 'Space',
      expectedKey: ' ',
    },
    {
      message: 'Esc で確定',
      expectedKey: 'Esc',
    },
    {
      message: 'A を押せ。今度は行末に飛んで Insert に入る',
      expectedKey: 'A',
    },
    {
      message: '*/ と打て。まず Space',
      expectedKey: ' ',
    },
    {
      message: '*',
      expectedKey: '*',
    },
    {
      message: '/',
      expectedKey: '/',
    },
    {
      message: 'Esc で確定',
      expectedKey: 'Esc',
    },
    {
      message: 'I は行頭、A は行末から Insert。2行目も同じように囲め',
      expectedKey: null,
    },
  ],
}

/** N02-Ta: 行を足せ (o, O) */
export const N02_Ta_TUTORIAL: Tutorial = {
  nodeId: 'N02',
  stageId: 'N02-Ta',
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
