import type { Stage } from '../../types/stage'

/**
 * N21: Dショートカット (D)
 * D = d$ のショートカット
 * Teach(T) = 1ステージ
 */
export const N21_STAGES: Stage[] = [
  // ── Teach: D で行末を切る ──
  // opt = 1 (D) — cursor starts at cut point
  {
    id: 'N21-T',
    nodeId: 'N21',
    type: 'teach',
    title: 'Dで断て',
    language: 'javascript',
    initialText: 'return null; // FIXME: remove this',
    goalText: 'return null;',
    initialCursor: { line: 0, col: 12 },
    life: 7,
    stars: [1, 2, 4],
    availableCommands: [
      'h',
      'j',
      'k',
      'l',
      'w',
      'b',
      'e',
      '0',
      '$',
      'x',
      'dd',
      'd$',
      'd0',
      'D',
      'dw',
    ],
    hints: [{ cost: 1, commands: ['D'] }],
    flavor: 'd$ と同じことが D 一文字でできる',
  },
]
