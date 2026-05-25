import type { Stage } from '../../types/stage'

/**
 * N13: ショートカット (D, C, S)
 * D = d$, C = c$, S = cc
 * Teach(T) + Practice(P) = 2ステージ
 */
export const N13_STAGES: Stage[] = [
  // ── Teach: D で行末を切る（2行） ──
  // opt = 3 (自力: j+l+D) → ☆3=3, ☆2=4, ☆1=6, life=9
  {
    id: 'N13-T',
    nodeId: 'N13',
    type: 'teach',
    title: 'Dで断て',
    language: 'javascript',
    initialText: 'let a = 1; // fixme\nlet b = 2; // todo',
    goalText: 'let a = 1;\nlet b = 2;',
    initialCursor: { line: 0, col: 10 },
    life: 10,
    stars: [4, 5, 7],
    availableCommands: ['dd', 'd$', 'd0', 'D'],
    hints: [{ cost: 1, commands: ['D', 'j', 'l', 'D'] }],
    flavor: 'D は d$ のショートカット。行末まで一発で消せ',
  },

  // ── Teach a: C/S を体験（2行） ──
  // opt = 3 (C+ok;+Esc+j+S+new+Esc) → ☆3=3, ☆2=4, ☆1=6, life=9
  {
    id: 'N13-Ta',
    nodeId: 'N13',
    type: 'teach',
    title: 'C/Sで書き換え',
    language: 'javascript',
    initialText: 'let x = bad;\nold line',
    goalText: 'let x = ok;\nnew',
    initialCursor: { line: 0, col: 8 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['D', 'C', 'S', 'f', 't'],
    hints: [{ cost: 1, commands: ['C', 'ok;', 'Esc', 'j', 'S', 'new', 'Esc'] }],
    flavor: 'C は行末まで変更、S は行全体を変更するショートカットだ',
  },
]
