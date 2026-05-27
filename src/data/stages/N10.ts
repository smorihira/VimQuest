import type { Stage } from '../../types/stage'

/**
 * N10: 行操作ショートカット (D, C, S, J)
 */
export const N10_STAGES: Stage[] = [
  // ── Teach: D で行末を切る（2行） ──
  // opt = 3 (自力: j+l+D) → ☆3=3, ☆2=4, ☆1=6, life=9
  {
    id: 'N10-T',
    nodeId: 'N11',
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
    id: 'N10-Ta',
    nodeId: 'N11',
    type: 'teach',
    title: 'C/Sで書き換え',
    language: 'javascript',
    initialText: 'let x = bad;\nold line',
    goalText: 'let x = ok;\nnew',
    initialCursor: { line: 0, col: 8 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['D', 'C', 'S'],
    hints: [{ cost: 1, commands: ['C', 'ok;', 'Esc', 'j', 'S', 'new', 'Esc'] }],
    flavor: 'C は行末まで変更、S は行全体を変更するショートカットだ',
  },
  // ── Teach: 複数行を1行に結合 ──
  // opt = 2 (J + J)
  {
    id: 'N10-Tb',
    nodeId: 'N11',
    type: 'teach',
    title: '行をつなげ',
    language: 'plaintext',
    initialText: 'hello\nbeautiful\nworld',
    goalText: 'hello beautiful world',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['dd', 'J'],
    hints: [{ cost: 1, commands: ['J', 'J'] }],
    flavor: 'J で下の行を現在行に結合できる',
  },
]
