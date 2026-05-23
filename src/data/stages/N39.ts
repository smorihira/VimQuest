import type { Stage } from '../../types/stage'

/**
 * N39: ヤンク (y + motion/textobj)
 * Teach(T) + Practice(P) = 2ステージ
 */
export const N39_STAGES: Stage[] = [
  // ── Teach: yiw でコピー → p でペースト ──
  // opt = 3 (yiw + $ + p)
  {
    id: 'N39-T',
    nodeId: 'N39',
    type: 'teach',
    title: 'コピーせよ',
    language: 'plaintext',
    initialText: 'hello world',
    goalText: 'hello worldhello',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: [
      'h',
      'j',
      'k',
      'l',
      'w',
      'b',
      'e',
      'f',
      't',
      '0',
      '$',
      'x',
      'diw',
      'y',
      'v',
      'p',
    ],
    hints: [{ cost: 1, commands: ['yiw', '$', 'p'] }],
    flavor: 'yiw で単語をヤンク（コピー）し、p でペーストだ',
  },

  // ── Practice: yy で行コピー、p でペースト ──
  // opt = 3 (j + yy + p)
  {
    id: 'N39-P',
    nodeId: 'N39',
    type: 'practice',
    title: '行を複製',
    language: 'javascript',
    initialText: 'const a = 1;\nconst b = 2;',
    goalText: 'const a = 1;\nconst b = 2;\nconst b = 2;',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 5, 7],
    availableCommands: [
      'h',
      'j',
      'k',
      'l',
      'w',
      'b',
      'e',
      '0',
      '$',
      'x',
      'y',
      'yy',
      'v',
      'V',
      'p',
      'P',
    ],
    hints: [{ cost: 1, commands: ['j', 'yy', 'p'] }],
    flavor: 'yy で行全体をヤンクし、p で下に複製せよ',
  },
]
