import type { Tutorial } from '../../types/tutorial'

/** N18-T: 精密除去 (diw) */
export const N18_T_TUTORIAL: Tutorial = {
  nodeId: 'N06',
  stageId: 'N18-T',
  newCommands: [],
  steps: [
    {
      message: 'w で "temp" に移動しろ',
      expectedKey: 'w',
    },
    {
      message: 'diw と押せ。単語だけ消えて空白は残る',
      expectedKey: 'diw',
    },
    {
      message: 'diw は空白を残して単語だけ消す。残りも消せ',
      expectedKey: null,
    },
  ],
}

/** N18-Ta: 単語を変えろ (ciw) */
export const N18_Ta_TUTORIAL: Tutorial = {
  nodeId: 'N06',
  stageId: 'N18-Ta',
  newCommands: [],
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
