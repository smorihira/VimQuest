import type { Stage } from '../../types/stage'

/**
 * N07: y オペレータ (yw, ye, yb, yy, y$, y0, p, P)
 * Teach(T) + Practice(P) + Challenge(C) = 3ステージ
 */
export const N07_STAGES: Stage[] = [
  // ── Teach: yw でコピー → p でペースト ──
  // opt = 3 (yw + $ + p) → ☆3=3, ☆2=4, ☆1=6, life=9
  {
    id: 'N07-T',
    nodeId: 'N05',
    type: 'teach',
    title: 'コピーせよ',
    language: 'plaintext',
    initialText: 'hello world',
    goalText: 'hello worldhello ',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['yw', 'ye', 'p', 'P'],
    hints: [{ cost: 1, commands: ['yw', '$', 'p'] }],
    flavor: 'yw で単語をヤンク（コピー）し、p でペーストだ',
  },

  // ── Practice: yy で行コピー、p でペースト ──
  // opt = 3 (j + yy + p) → ☆3=3, ☆2=5, ☆1=7, life=9
  {
    id: 'N07-P',
    nodeId: 'N05',
    type: 'practice',
    title: '行を複製',
    language: 'javascript',
    initialText: 'const a = 1;\nconst b = 2;',
    goalText: 'const a = 1;\nconst b = 2;\nconst b = 2;',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 5, 7],
    availableCommands: ['yy', 'yw', 'ye', 'p', 'P'],
    hints: [{ cost: 1, commands: ['j', 'yy', 'p'] }],
    flavor: 'yy で行全体をヤンクし、p で下に複製せよ',
  },

  // ── Challenge: y$ + P で末尾コピー ──
  // opt = 5 (w + y$ + j + 0 + P) → ☆3=5, ☆2=8, ☆1=11, life=13
  {
    id: 'N07-C',
    nodeId: 'N05',
    type: 'challenge',
    title: 'ヤンク＆ペースト',
    language: 'plaintext',
    initialText: 'foo bar baz\nhello',
    goalText: 'foo bar baz\nbar bazhello',
    initialCursor: { line: 0, col: 0 },
    life: 13,
    stars: [5, 8, 11],
    availableCommands: ['yw', 'ye', 'yb', 'yy', 'y$', 'y0', 'p', 'P'],
    hints: [{ cost: 1, commands: ['w', 'y$', 'j', '0', 'P'] }],
    flavor: 'y$ で行末までヤンクし、P でカーソルの前にペーストだ',
  },
]
