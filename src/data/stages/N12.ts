import type { Stage } from '../../types/stage'

/**
 * N12: 行末削除 (d$, d0)
 * Teach(T) = 1ステージ
 */
export const N12_STAGES: Stage[] = [
  // ── Teach: 行末まで削除 ──
  // opt = 3 (e + l + d$)
  // ── Teach: d0 と d$ の両方を体験 ──
  // opt = 3 (自力: w+l+d$) → ☆3=3, ☆2=4, ☆1=6, life=9
  {
    id: 'N12-T',
    nodeId: 'N12',
    type: 'teach',
    title: '末尾を切れ',
    language: 'javascript',
    initialText: '// temp value; // hack',
    goalText: 'value;',
    initialCursor: { line: 0, col: 8 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['dd', 'd$', 'd0'],
    hints: [{ cost: 1, commands: ['d0', 'w', 'l', 'd$'] }],
    flavor: 'd0 で行頭まで、d$ で行末まで一気に削除せよ',
  },
]
