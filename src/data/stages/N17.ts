import type { Stage } from '../../types/stage'

/**
 * N17: 行末削除 (d$, d0)
 * Teach(T) = 1ステージ
 */
export const N17_STAGES: Stage[] = [
  // ── Teach: 行末まで削除 ──
  // opt = 3 (e + l + d$)
  {
    id: 'N17-T',
    nodeId: 'N17',
    type: 'teach',
    title: '末尾を切れ',
    language: 'javascript',
    initialText: 'return value; // temporary hack',
    goalText: 'return value;',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 6, 8],
    availableCommands: ['dd', 'd$', 'd0', 'dw', '0', '$'],
    hints: [{ cost: 1, commands: ['e', 'e', 'l', 'l', 'd$'] }],
    flavor: 'コメントを d$ で行末まで一気に削除せよ',
  },
]
