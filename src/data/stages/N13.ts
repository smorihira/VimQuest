import type { Stage } from '../../types/stage'

/**
 * N13: 折り返し行 (gj, gk)
 * Teach(T) = 1ステージ
 */
export const N13_STAGES: Stage[] = [
  // ── Teach: 表示行単位で移動 ──
  // opt = 2 (gj + gj)
  {
    id: 'N13-T',
    nodeId: 'N13',
    type: 'teach',
    title: '表示行を歩け',
    language: 'plaintext',
    initialText: 'first line\nsecond line\nthird line',
    goalText: 'first line\nsecond line\nthird line',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['h', 'l', 'w', 'b', 'e', 'gj', 'gk', 'x'],
    clearConditions: { cursor: { line: 2, col: 0 } },
    hints: [{ cost: 1, commands: ['gj', 'gj'] }],
    flavor: 'j は論理行で動く。gj なら表示行で移動できる。ここでは gj だけが使える',
  },
]
