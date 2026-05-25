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
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['dd', 'd$', 'd0', 'D'],
    hints: [{ cost: 1, commands: ['D', 'j', 'l', 'D'] }],
    flavor: 'D は d$ のショートカット。行末まで一発で消せ',
  },

  // ── Practice: D の練習（2行のコメント削除） ──
  // opt = 4 (D+j+l+D) → ☆3=4, ☆2=6, ☆1=8, life=10
  {
    id: 'N13-P',
    nodeId: 'N13',
    type: 'practice',
    title: 'コメント除去',
    language: 'javascript',
    initialText: 'let x = 1; // debug\nlet y = 2; // temp',
    goalText: 'let x = 1;\nlet y = 2;',
    initialCursor: { line: 0, col: 10 },
    life: 10,
    stars: [4, 6, 8],
    availableCommands: ['dd', 'd$', 'd0', 'D'],
    hints: [{ cost: 1, commands: ['D', 'j', 'l', 'D'] }],
    flavor: '2行のコメントを D で除去せよ',
  },
]
