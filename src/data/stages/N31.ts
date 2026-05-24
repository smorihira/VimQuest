import type { Stage } from '../../types/stage'

/**
 * N31: レジスタ ("a〜"z, "0)
 * Teach(T) + Practice(P) = 2ステージ
 */
export const N31_STAGES: Stage[] = [
  // ── Teach: 名前付きレジスタに保存 ──
  // opt = 3 ("ayiw + w + "ap)
  {
    id: 'N31-T',
    nodeId: 'N31',
    type: 'teach',
    title: 'レジスタ入門',
    language: 'plaintext',
    initialText: 'hello world',
    goalText: 'hello worldhello',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['y', 'p', 'P', '"a', '"0'],
    clearConditions: {
      registers: { a: 'hello' },
    },
    hints: [{ cost: 1, commands: ['"ayiw', '$', '"ap'] }],
    flavor: '"a で名前付きレジスタに保存。後から正確に貼り付けられる',
  },

  // ── Practice: 複数レジスタの使い分け ──
  // opt = 6 ("ayiw + w + "byiw + A + "ap + ' ' + "bp + Esc)
  {
    id: 'N31-P',
    nodeId: 'N31',
    type: 'practice',
    title: 'レジスタ活用',
    language: 'plaintext',
    initialText: 'foo bar\nbaz',
    goalText: 'foo bar\nbaz foo bar',
    initialCursor: { line: 0, col: 0 },
    life: 12,
    stars: [6, 8, 10],
    availableCommands: ['y', 'p', 'P', '"a', '"b', '"0', 'A'],
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
