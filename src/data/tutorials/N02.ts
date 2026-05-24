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
