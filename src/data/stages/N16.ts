import type { Stage } from '../../types/stage'

/**
 * N16: 括弧ジャンプ (%)
 * Teach(T) = 1ステージ
 */
export const N16_STAGES: Stage[] = [
  // ── Teach: 対応する括弧へジャンプ (2行) ──
  // opt = 3 (f{ + % + j)
  {
    id: 'N16-T',
    nodeId: 'N16',
    type: 'teach',
    title: '対を見つけろ',
    language: 'javascript',
    initialText: 'if (a) { return x; }\nif (b) { return y; }',
    goalText: 'if (a) { return x; }\nif (b) { return y; }',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['%', 'f', 't'],
    clearConditions: { cursor: { line: 1, col: 19 } },
    hints: [{ cost: 1, commands: ['f{', '%', 'j'] }],
    flavor: '% で対応する括弧にジャンプ。{ から } へ一瞬で飛べる',
  },
]
