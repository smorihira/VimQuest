import type { Stage } from '../../types/stage'

/**
 * N22: レジスタ ("a〜"z, "0)
 * Teach(T) + Practice(P) = 2ステージ
 */
export const N22_STAGES: Stage[] = [
  // ── Teach: 名前付きレジスタ（2行でヤンク→ペースト全フロー） ──
  // opt = 4 (自力: j+"byiw+$+"bp) → ☆3=4, ☆2=5, ☆1=7, life=10
  {
    id: 'N22-T',
    nodeId: 'N22',
    type: 'teach',
    title: 'レジスタ入門',
    language: 'plaintext',
    initialText: 'hello world\nfoo bar',
    goalText: 'hello worldhello\nfoo barfoo',
    initialCursor: { line: 0, col: 0 },
    life: 14,
    stars: [8, 9, 11],
    availableCommands: ['y', 'p', 'P', '"a', '"b', '"0'],
    clearConditions: {
      registers: { a: 'hello', b: 'foo' },
    },
    hints: [{ cost: 1, commands: ['"ayiw', '$', '"ap', 'j', '0', '"byiw', '$', '"bp'] }],
    flavor: '"a で名前付きレジスタに保存。後から正確に貼り付けられる',
  },

  // ── Practice: 複数レジスタの使い分け ──
  // opt = 9 ("ayiw(1)+w(1)+"byiw(1)+j(1)+$(1)+a+Esc(1)+"ap(1)+a+Esc(1)+"bp(1))
  {
    id: 'N22-P',
    nodeId: 'N22',
    type: 'practice',
    title: 'レジスタ活用',
    language: 'plaintext',
    initialText: 'foo bar\nbaz',
    goalText: 'foo bar\nbaz foo bar',
    initialCursor: { line: 0, col: 0 },
    life: 15,
    stars: [9, 11, 13],
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
