import type { Stage } from '../../types/stage'

/**
 * N13: ショートカット (D, C, S)
 * D = d$, C = c$, S = cc
 * Teach(T) + Practice(P) = 2ステージ
 */
export const N13_STAGES: Stage[] = [
  // ── Teach: D で行末を切る ──
  // opt = 1 (D) — cursor starts at cut point
  {
    id: 'N13-T',
    nodeId: 'N13',
    type: 'teach',
    title: 'Dで断て',
    language: 'javascript',
    initialText: 'return null; // FIXME: remove this',
    goalText: 'return null;',
    initialCursor: { line: 0, col: 12 },
    life: 7,
    stars: [1, 2, 4],
    availableCommands: ['dd', 'd$', 'd0', 'D', 'dw'],
    hints: [{ cost: 1, commands: ['D'] }],
    flavor: 'd$ と同じことが D 一文字でできる',
  },

  // ── Practice: S/C で行全体/行末を書き換え ──
  {
    id: 'N13-P',
    nodeId: 'N13',
    type: 'teach',
    title: 'ショートカット',
    language: 'javascript',
    initialText: 'const result = null;',
    goalText: 'const Result = null;',
    initialCursor: { line: 0, col: 6 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['ciw', 'S', 'C', 'f', 't'],
    hints: [{ cost: 1, commands: ['s', 'R', 'Esc'] }],
    flavor: 'C は c$ 、S は cc と同じ。ショートカットを使いこなせ',
  },
]
