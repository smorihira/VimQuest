import type { Stage } from '../../types/stage'

/**
 * N20: デリミタTextObj (i", a", i', a', i(, a(, etc.)
 * Teach(T) + Practice(P) = 2ステージ
 */
export const N20_STAGES: Stage[] = [
  // ── Teach: 引用符の中身を変更 ──
  // opt = 2 (ci"(1) + Esc(ceil(4/5)=1))
  {
    id: 'N20-T',
    nodeId: 'N20',
    type: 'teach',
    title: '中身を変えろ',
    language: 'json',
    initialText: '{ "color": "red" }',
    goalText: '{ "color": "blue" }',
    initialCursor: { line: 0, col: 14 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['diw', 'daw', 'di"', 'da"', 'ci"', 'f', 't'],
    hints: [{ cost: 1, commands: ['ci"', 'blue', 'Esc'] }],
    flavor: 'ci" で引用符の中身だけを書き換えられる',
  },

  // ── Practice: 括弧・引用符を使い分け ──
  // opt = 6 (ci"(1)+Esc(1) + f((1)+l(1) + ci((1)+Esc(1))
  {
    id: 'N20-P',
    nodeId: 'N20',
    type: 'practice',
    title: '中身総入替',
    language: 'javascript',
    initialText: 'log("old", getValue(x))',
    goalText: 'log("new", getValue(y))',
    initialCursor: { line: 0, col: 0 },
    life: 12,
    stars: [6, 8, 10],
    availableCommands: ['diw', 'daw', 'di"', 'da"', 'ci"', 'di(', 'da(', 'ci(', 'f', 't'],
    hints: [{ cost: 1, commands: ['ci"', 'new', 'Esc', 'f(', 'l', 'ci(', 'y', 'Esc'] }],
    flavor: '引用符の中と括弧の中、両方書き換えろ',
  },
]
