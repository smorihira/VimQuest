import type { Stage } from '../../types/stage'

export const N23_STAGES: Stage[] = [
  // ─── Teach: v (visual select) ──────────────────────────────────
  {
    id: 'N23-T',
    nodeId: 'N03',
    type: 'teach',
    title: '選んで消せ',
    language: 'plaintext',
    initialText: 'keep[trash]save',
    goalText: 'keepsave',
    initialCursor: { line: 0, col: 4 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['v'],
    hints: [{ cost: 1, commands: ['v', 'f]', 'x'] }],
    flavor: 'v で Visual モードに入り、範囲を選んで x で消せ',
  },

  // ─── Teach: R (replace mode) ──────────────────────────────────
  {
    id: 'N23-Ta',
    nodeId: 'N03',
    type: 'teach',
    title: '上書きモード',
    language: 'plaintext',
    initialText: 'abc def ghi',
    goalText: 'xyz def mno',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['R'],
    hints: [{ cost: 1, commands: ['R', 'xyz', 'Esc', 'fg', 'R', 'mno', 'Esc'] }],
    flavor: 'R で上書きモードに入る。連続する文字を一気に書き換えろ',
  },

  // ─── Challenge: v + R combined ─────────────────────────────────
  {
    id: 'N23-C',
    nodeId: 'N03',
    type: 'challenge',
    title: 'モード総合',
    language: 'javascript',
    initialText: 'keep [REMOVE] rest\naaa fghij zzz',
    goalText: 'keep rest\naaa klmno zzz',
    initialCursor: { line: 0, col: 5 },
    life: 14,
    stars: [6, 9, 12],
    availableCommands: ['v', 'R'],
    hints: [
      {
        cost: 1,
        commands: ['v', 'f]', 'l', 'x', 'j', 'b', 'R', 'klmno', 'Esc'],
      },
    ],
    flavor: 'Visual で消し、Replace で上書き。モードを使い分けろ',
  },
]
