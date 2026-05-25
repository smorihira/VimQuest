import type { Stage } from '../../types/stage'

/**
 * N15: 数値操作 (Ctrl+a, Ctrl+x)
 */
export const N15_STAGES: Stage[] = [
  // ── Teach: Ctrl+a で数値を増やす ──
  // opt = 3 (Ctrl+a=1, j=1, Ctrl+a=1) → ☆3=3, ☆2=4, ☆1=6, life=9
  {
    id: 'N15-T',
    nodeId: 'N15',
    type: 'teach',
    title: '数値を増やせ',
    language: 'javascript',
    initialText: 'a = 0;\nb = 0;',
    goalText: 'a = 1;\nb = 1;',
    initialCursor: { line: 0, col: 4 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['Ctrl+a'],
    hints: [{ cost: 1, commands: ['Ctrl+a', 'j', 'Ctrl+a'] }],
    flavor: 'Ctrl+a でカーソル上の数値を +1 できる',
  },

  // ── Teach: Ctrl+x で数値を減らす ──
  // opt = 3 (Ctrl+x=1, j=1, Ctrl+x=1) → ☆3=3, ☆2=4, ☆1=6, life=9
  {
    id: 'N15-Ta',
    nodeId: 'N15',
    type: 'teach',
    title: '数値を減らせ',
    language: 'javascript',
    initialText: 'x = 10;\ny = 10;',
    goalText: 'x = 9;\ny = 9;',
    initialCursor: { line: 0, col: 4 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['Ctrl+x'],
    hints: [{ cost: 1, commands: ['Ctrl+x', 'j', 'Ctrl+x'] }],
    flavor: 'Ctrl+x で数値を -1 する。Ctrl+a の逆だ',
  },

  // ── Practice: Ctrl+a と Ctrl+x を混ぜて使う ──
  // opt = 5 (Ctrl+a, j, Ctrl+x, j, Ctrl+a) → ☆3=5, ☆2=7, ☆1=9, life=11
  {
    id: 'N15-P',
    nodeId: 'N15',
    type: 'practice',
    title: '数値調整',
    language: 'javascript',
    initialText: 'r = 0;\ng = 255;\nb = 128;',
    goalText: 'r = 1;\ng = 254;\nb = 129;',
    initialCursor: { line: 0, col: 4 },
    life: 11,
    stars: [5, 7, 9],
    availableCommands: ['Ctrl+a', 'Ctrl+x'],
    hints: [{ cost: 1, commands: ['Ctrl+a', 'j', 'Ctrl+x', 'j', 'Ctrl+a'] }],
    flavor: 'RGB値を Ctrl+a / Ctrl+x で微調整せよ',
  },
]
