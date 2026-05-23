import type { Stage } from '../../types/stage'

/**
 * N20: 行末削除 (d$, d0)
 * Teach(T) = 1ステージ
 */
export const N20_STAGES: Stage[] = [
  // ── Teach: 行末まで削除 ──
  // opt = 3 (e + l + d$)
  {
    id: 'N20-T',
    nodeId: 'N20',
    type: 'teach',
    title: '末尾を切れ',
    language: 'javascript',
    initialText: 'return value; // temporary hack',
    goalText: 'return value;',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 6, 8],
    availableCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', 'x', 'dd', 'd$', 'd0', 'dw'],
    hints: [{ cost: 1, commands: ['e', 'e', 'l', 'l', 'd$'] }],
    flavor: 'コメントを d$ で行末まで一気に削除せよ',
  },
]
