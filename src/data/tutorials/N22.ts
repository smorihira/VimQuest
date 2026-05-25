import type { Tutorial } from '../../types/tutorial'

/** N22-T: 単語を変えろ (ciw) */
export const N22_T_TUTORIAL: Tutorial = {
  nodeId: 'N22',
  stageId: 'N22-T',
  steps: [
    {
      message: 'w で "value" に移動しろ',
      expectedKey: 'w',
    },
    {
      message: 'ciw と押せ。単語が消えて Insert に入る',
      expectedKey: 'ciw',
    },
    {
      message: 'count と打て',
      expectedKey: 'c',
    },
    {
      message: 'o',
      expectedKey: 'o',
    },
    {
      message: 'u',
      expectedKey: 'u',
    },
    {
      message: 'n',
      expectedKey: 'n',
    },
    {
      message: 't',
      expectedKey: 't',
    },
    {
      message: 'Esc で確定',
      expectedKey: 'Esc',
    },
    {
      message: 'ciw で単語をそのまま置換。残りも直せ',
      expectedKey: null,
    },
  ],
}
