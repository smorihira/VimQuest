import type { Stage } from '../../types/stage'

/**
 * N25: 発展モーション W/B/E (nodeId: N14)
 * Teach + Practice + Challenge = 3ステージ
 */
export const N25_STAGES: Stage[] = [
  // ── Teach: W で WORD 単位移動 ──
  // opt = 3 (W + W + W)
  {
    id: 'N25-T',
    nodeId: 'N14',
    type: 'teach',
    title: 'WORDで飛べ',
    language: 'javascript',
    initialText: 'a.b c.d e.f g.h',
    goalText: 'a.b c.d e.f g.h',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['W', 'B', 'E'],
    clearConditions: { cursor: { line: 0, col: 12 } },
    hints: [{ cost: 1, commands: ['W', 'W', 'W'] }],
    flavor: 'W は記号を含む WORD 単位で移動。w より大股で飛べる',
  },

  // ── Practice: B で WORD 逆走 ──
  // opt = 2 (B + B)
  {
    id: 'N25-P',
    nodeId: 'N14',
    type: 'practice',
    title: 'WORD逆走',
    language: 'javascript',
    initialText: 'std::cout << obj.val;',
    goalText: 'std::cout << obj.val;',
    initialCursor: { line: 0, col: 13 },
    life: 8,
    stars: [2, 4, 6],
    availableCommands: ['W', 'B', 'E'],
    clearConditions: { cursor: { line: 0, col: 0 } },
    hints: [{ cost: 1, commands: ['B', 'B'] }],
    flavor: 'B は W の逆。記号を飛ばして前の WORD へ一気に戻れ',
  },

  // ── Challenge: W 高速移動 ──
  // opt = 4 (W × 4)
  {
    id: 'N25-C',
    nodeId: 'N14',
    type: 'challenge',
    title: 'WORD総合',
    language: 'javascript',
    initialText: 'a.b c.d e.f g.h i.j',
    goalText: 'a.b c.d e.f g.h i.j',
    initialCursor: { line: 0, col: 0 },
    life: 12,
    stars: [4, 7, 10],
    availableCommands: ['W', 'B', 'E'],
    clearConditions: { cursor: { line: 0, col: 16 } },
    hints: [{ cost: 1, commands: ['W', 'W', 'W', 'W'] }],
    flavor: 'w だと . で止まるが、W なら一気に飛べる',
  },
]
