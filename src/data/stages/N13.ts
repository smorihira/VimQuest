import type { Stage } from '../../types/stage'

/**
 * N13: 括弧ジャンプ (%)
 * Teach(T) = 1ステージ
 */
export const N13_STAGES: Stage[] = [
  // ── Teach: 対応する括弧へジャンプ (2行) ──
  // opt = 4 (f{ + % + j + %)
  {
    id: 'N13-T',
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

  // ── Practice: % で括弧ジャンプ ──
  // opt = 1: %(1)
  {
    id: 'N13-P',
    nodeId: 'N12',
    type: 'practice',
    title: '括弧を飛べ',
    language: 'javascript',
    initialText: 'if (ok) {\n  return 1;\n}',
    goalText: 'if (ok) {\n  return 1;\n}',
    initialCursor: { line: 0, col: 8 },
    life: 7,
    stars: [1, 3, 5],
    availableCommands: ['%', 'f', 't'],
    clearConditions: { cursor: { line: 2, col: 0 } },
    hints: [{ cost: 1, commands: ['%'] }],
    flavor: '{ から } へ一発でジャンプせよ',
  },

  // ── Challenge: % 連続ジャンプ ──
  // opt = 3: %(1)+j(1)+%(1)
  {
    id: 'N13-C',
    nodeId: 'N12',
    type: 'challenge',
    title: '括弧ジャンプ総合',
    language: 'javascript',
    initialText: '((a))\n{\n  ok;\n}',
    goalText: '((a))\n{\n  ok;\n}',
    initialCursor: { line: 0, col: 1 },
    life: 11,
    stars: [3, 6, 9],
    availableCommands: ['%', 'f', 't'],
    clearConditions: { cursor: { line: 3, col: 0 } },
    hints: [{ cost: 1, commands: ['%', 'j', '%'] }],
    flavor: '% で括弧を渡り歩き、ゴールへ向かえ',
  },
]
