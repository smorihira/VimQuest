import type { Stage } from '../../types/stage'

/**
 * N20: デリミタTextObj (i", a", i', a', i(, a(, etc.)
 * Teach(T) + Practice(P) = 2ステージ
 */
export const N20_STAGES: Stage[] = [
  // ── Teach: 引用符の中身を変更 ──
  // opt = 1 (ci" + type 'blue' + Esc) — from anywhere in line
  {
    id: 'N20-T',
    nodeId: 'N20',
    type: 'teach',
    title: '中身を変えろ',
    language: 'json',
    initialText: '{ "color": "red" }',
    goalText: '{ "color": "blue" }',
    initialCursor: { line: 0, col: 14 },
    life: 7,
    stars: [1, 2, 4],
    availableCommands: ['diw', 'daw', 'di"', 'da"', 'ci"', 'f', 't'],
    hints: [{ cost: 1, commands: ['ci"', 'blue', 'Esc'] }],
    flavor: 'ci" で引用符の中身だけを書き換えられる',
  },

  // ── Practice: 括弧・引用符を使い分け ──
  // opt = 4 (ci"+new+Esc, w+ci(+y+Esc)
  {
    id: 'N20-P',
    nodeId: 'N20',
    type: 'practice',
    title: '中身総入替',
    language: 'javascript',
    initialText: 'log("old", getValue(x))',
    goalText: 'log("new", getValue(y))',
    initialCursor: { line: 0, col: 0 },
    life: 10,
    stars: [4, 6, 8],
    availableCommands: ['diw', 'daw', 'di"', 'da"', 'ci"', 'di(', 'da(', 'ci(', 'f', 't'],
    hints: [{ cost: 1, commands: ['ci"', 'new', 'Esc', 'f(', 'l', 'ci(', 'y', 'Esc'] }],
    flavor: '引用符の中と括弧の中、両方書き換えろ',
  },
]
