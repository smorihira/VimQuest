import type { Stage } from '../../types/stage'

/**
 * N20: 括弧ジャンプ (%)
 * Teach(T) = 1ステージ
 */
export const N20_STAGES: Stage[] = [
  // ── Teach: 対応する括弧へジャンプ ──
  // opt = 2 (f{ + %)
  {
    id: 'N20-T',
    nodeId: 'N20',
    type: 'teach',
    title: '対を見つけろ',
    language: 'javascript',
    initialText: 'if (x > 0) { return x; }',
    goalText: 'if (x > 0) { return x; }',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['%', 'f', 't'],
    clearConditions: { cursor: { line: 0, col: 23 } },
    hints: [{ cost: 1, commands: ['f{', '%'] }],
    flavor: '% で対応する括弧にジャンプ。{ から } へ一瞬で飛べる',
  },
]
