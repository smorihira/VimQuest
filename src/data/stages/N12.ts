import type { Stage } from '../../types/stage'

/**
 * N12: 括弧ジャンプ (%)
 * Teach(T) = 1ステージ
 */
export const N12_STAGES: Stage[] = [
  // ── Teach: 対応する括弧へジャンプ (2行) ──
  // opt = 4 (f{ + % + j + %)
  {
    id: 'N12-T',
    nodeId: 'N12',
    type: 'teach',
    title: '対を見つけろ',
    language: 'javascript',
    initialText: 'if (a) { return x; }\nif (b) { return y; }',
    goalText: 'if (a) { return x; }\nif (b) { return y; }',
    initialCursor: { line: 0, col: 0 },
    life: 10,
    stars: [4, 5, 7],
    availableCommands: ['%', 'f', 't'],
    clearConditions: { cursor: { line: 1, col: 7 } },
    hints: [{ cost: 1, commands: ['f{', '%', 'j', '%'] }],
    flavor: '% で対応する括弧にジャンプ。{ から } へ一瞬で飛べる',
  },
]
