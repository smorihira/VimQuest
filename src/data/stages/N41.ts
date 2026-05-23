import type { Stage } from '../../types/stage'

/**
 * N41: レジスタ ("a〜"z, "0)
 * Teach(T) + Practice(P) = 2ステージ
 */
export const N41_STAGES: Stage[] = [
  // ── Teach: 名前付きレジスタに保存 ──
  // opt = 3 ("ayiw + w + "ap)
  {
    id: 'N41-T',
    nodeId: 'N41',
    type: 'teach',
    title: 'レジスタ入門',
    language: 'plaintext',
    initialText: 'hello world',
    goalText: 'hello worldhello',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 4, 6],
    baseCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', 'x'],
    availableCommands: ['y', 'p', 'P', '"a', '"0'],
    hints: [{ cost: 1, commands: ['"ayiw', '$', '"ap'] }],
    flavor: '"a で名前付きレジスタに保存。後から正確に貼り付けられる',
  },

  // ── Practice: 複数レジスタの使い分け ──
  // opt = 6 ("ayiw + w + "byiw + A + "ap + ' ' + "bp + Esc)
  {
    id: 'N41-P',
    nodeId: 'N41',
    type: 'practice',
    title: 'レジスタ活用',
    language: 'plaintext',
    initialText: 'foo bar\nbaz',
    goalText: 'foo bar\nbaz foo bar',
    initialCursor: { line: 0, col: 0 },
    life: 12,
    stars: [6, 8, 10],
    baseCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', 'x', 'i', 'a', 'A'],
    availableCommands: ['y', 'p', 'P', '"a', '"b', '"0'],
    clearConditions: {
      registers: { a: 'foo', b: 'bar' },
    },
    hints: [
      {
        cost: 1,
        commands: ['"ayiw', 'w', '"byiw', 'j', '$', 'a', ' ', 'Esc', '"ap', 'a', ' ', 'Esc', '"bp'],
      },
    ],
    flavor: '"a と "b に別々の単語を保存し、組み合わせてペーストせよ',
  },
]
