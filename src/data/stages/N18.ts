import type { Stage } from '../../types/stage'

/**
 * N18: Dショートカット (D)
 * D = d$ のショートカット
 * Teach(T) = 1ステージ
 */
export const N18_STAGES: Stage[] = [
  // ── Teach: D で行末を切る ──
  // opt = 1 (D) — cursor starts at cut point
  {
    id: 'N18-T',
    nodeId: 'N18',
    type: 'teach',
    title: 'Dで断て',
    language: 'javascript',
    initialText: 'return null; // FIXME: remove this',
    goalText: 'return null;',
    initialCursor: { line: 0, col: 12 },
    life: 7,
    stars: [1, 2, 4],
    availableCommands: ['dd', 'd$', 'd0', 'D', 'dw', '0', '$'],
    hints: [{ cost: 1, commands: ['D'] }],
    flavor: 'd$ と同じことが D 一文字でできる',
  },
]
