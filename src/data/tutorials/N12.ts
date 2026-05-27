import type { Tutorial } from '../../types/tutorial'

/** N12-T: 狙い撃て (f, t, ;, ,) */
export const N12_T_TUTORIAL: Tutorial = {
  nodeId: 'N01',
  stageId: 'N12-T',
  newCommands: ['f', 't', ';', ','],
  steps: [
    {
      message: 'f( と押せ。行内の ( に一瞬でジャンプ',
      expectedKey: 'f(',
    },
    {
      message: '; を押せ。直前の f を繰り返す',
      expectedKey: ';',
    },
    {
      message: ', を押せ。逆方向に繰り返す',
      expectedKey: ',',
    },
    {
      message: 't) と押せ。) の1文字手前に止まる',
      expectedKey: 't)',
    },
    {
      message: 'f で直接、t で手前。; で繰り返し、, で逆方向だ',
      expectedKey: null,
    },
  ],
}
