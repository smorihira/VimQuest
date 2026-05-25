import type { Stage } from '../../types/stage'

/**
 * N17: デリミタTextObj (i", a", i', a', i(, a(, etc.)
 * Teach(T) + Practice(P) = 2ステージ
 */
export const N17_STAGES: Stage[] = [
  // ── Teach: ci" で引用符の中身を変更（2箇所） ──
  // opt = 2 (自力: f"+ci"…large…Esc) → ☆3=2, ☆2=3, ☆1=5, life=8
  {
    id: 'N17-T',
    nodeId: 'N17',
    type: 'teach',
    title: '中身を変えろ',
    language: 'json',
    initialText: '{ "color": "red" }\n{ "size": "small" }',
    goalText: '{ "color": "blue" }\n{ "size": "large" }',
    initialCursor: { line: 0, col: 12 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['di"', 'da"', 'ci"', 'f', 't'],
    hints: [{ cost: 1, commands: ['ci"', 'blue', 'Esc', 'j', 'ci"', 'large', 'Esc'] }],
    flavor: 'ci" で引用符の中身だけを書き換えられる',
  },

  // ── Practice: 括弧・引用符を使い分け ──
  // opt = 4 (ci"…new…Esc(1) + f((1)+l(1) + ci(…y…Esc(1))
  {
    id: 'N17-P',
    nodeId: 'N17',
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
