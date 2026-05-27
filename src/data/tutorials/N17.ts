import type { Tutorial } from '../../types/tutorial'

/** N17-T: 中身を変えろ (ci") */
export const N17_T_TUTORIAL: Tutorial = {
  nodeId: 'N06',
  stageId: 'N17-T',
  newCommands: ['"'],
  steps: [
    {
      message: 'ci" と押せ。引用符の中身が消えて Insert に入る',
      expectedKey: 'ci"',
    },
    {
      message: 'blue と打て',
      expectedKey: 'b',
    },
    {
      message: 'l',
      expectedKey: 'l',
    },
    {
      message: 'u',
      expectedKey: 'u',
    },
    {
      message: 'e',
      expectedKey: 'e',
    },
    {
      message: 'Esc で確定',
      expectedKey: 'Esc',
    },
    {
      message: 'ci" でデリミタ内を一発置換。残りも直せ',
      expectedKey: null,
    },
  ],
}
