import type { Stage } from '../../types/stage'

/**
 * N03: 新行Insert (o, O)
 * Teach(T) = 1ステージ
 */
export const N03_STAGES: Stage[] = [
  // ── Teach: 新しい行を追加 ──
  // opt = 1 (o + type 'world' + Esc)
  {
    id: 'N03-T',
    nodeId: 'N03',
    type: 'teach',
    title: '行を足せ',
    language: 'plaintext',
    initialText: 'hello',
    goalText: 'hello\nworld',
    initialCursor: { line: 0, col: 0 },
    life: 7,
    stars: [1, 2, 4],
    availableCommands: ['o', 'O', 'I', 'A'],
    hints: [{ cost: 1, commands: ['o', 'world', 'Esc'] }],
    flavor: 'o で下に新しい行を作り world と入力せよ',
  },
]
