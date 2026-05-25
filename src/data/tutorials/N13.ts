import type { Tutorial } from '../../types/tutorial'

/** N13-T: Dで断て (D = d$) */
export const N13_T_TUTORIAL: Tutorial = {
  nodeId: 'N13',
  stageId: 'N13-T',
  steps: [
    {
      message: 'D を押せ。カーソルから行末まで一発で消える',
      expectedKey: 'D',
    },
    {
      message: 'D は d$ のショートカット。2行目も同じように消せ',
      expectedKey: null,
    },
  ],
}
