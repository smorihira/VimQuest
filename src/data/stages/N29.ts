import type { Stage } from '../../types/stage'

/**
 * N29: ヤンク＆ペースト (y + motion/textobj, p, P)
 * Teach(T) + Practice(P) + Challenge(C) = 3ステージ
 */
export const N29_STAGES: Stage[] = [
  // ── Teach: yiw でコピー → p でペースト（2行） ──
  // opt = 2 (自力: $+p) → ☆3=2, ☆2=3, ☆1=5, life=8
  {
    id: 'N29-T',
    nodeId: 'N29',
    type: 'teach',
    title: 'コピーせよ',
    language: 'plaintext',
    initialText: 'hello world\nfoo bar',
    goalText: 'hello worldhello\nfoo barfoo',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['yiw', 'v', 'p', 'f', 't'],
    hints: [{ cost: 1, commands: ['yiw', '$', 'p', 'j', '0', 'yiw', '$', 'p'] }],
    flavor: 'yiw で単語をヤンク（コピー）し、p でペーストだ',
  },

  // ── Practice: yy で行コピー、p でペースト ──
  // opt = 3 (j + yy + p)
  {
    id: 'N29-P',
    nodeId: 'N29',
    type: 'practice',
    title: '行を複製',
    language: 'javascript',
    initialText: 'const a = 1;\nconst b = 2;',
    goalText: 'const a = 1;\nconst b = 2;\nconst b = 2;',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 5, 7],
    availableCommands: ['y', 'yy', 'v', 'V', 'p', 'P'],
    hints: [{ cost: 1, commands: ['j', 'yy', 'p'] }],
    flavor: 'yy で行全体をヤンクし、p で下に複製せよ',
  },

  // ── Challenge: dd + P で行を移動 ──
  // opt = 3 (jj + dd + P)
  {
    id: 'N29-C',
    nodeId: 'N29',
    type: 'challenge',
    title: '切り貼りせよ',
    language: 'plaintext',
    initialText: 'first\nthird\nsecond',
    goalText: 'first\nsecond\nthird',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [3, 6, 9],
    availableCommands: ['y', 'yy', 'dd', 'p', 'P'],
    hints: [{ cost: 1, commands: ['j', 'j', 'dd', 'P'] }],
    flavor: 'dd で行を切り取り、P でカーソルの上にペーストだ',
  },
]
