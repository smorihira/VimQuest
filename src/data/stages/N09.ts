import type { Stage } from '../../types/stage'

/**
 * N09: cオペレータ (cw, ce, cb, cc, c$, c0)
 */
export const N09_STAGES: Stage[] = [
  // ── Teach: cw で単語を変える ──
  // opt = 4 (cw+Esc=1, w=1, w=1, cw+Esc=1) → ☆3=4, ☆2=5, ☆1=7, life=10
  {
    id: 'N09-T',
    nodeId: 'N05',
    type: 'teach',
    title: '単語を変えろ',
    language: 'javascript',
    initialText: 'log(old, bad)',
    goalText: 'log(new, good)',
    initialCursor: { line: 0, col: 4 },
    life: 10,
    stars: [4, 5, 7],
    availableCommands: ['cw', 'ce', 'cb'],
    hints: [{ cost: 1, commands: ['cw', 'new', 'Esc', 'w', 'w', 'cw', 'good', 'Esc'] }],
    flavor: 'c は "change"。d のように消して即 Insert に入る',
  },

  // ── Teach: cc で行まるごと書き換え ──
  // opt = 3 (cc + '// done'(7chars→1+2=3) + Esc) → ☆3=3, ☆2=4, ☆1=6, life=9
  {
    id: 'N09-Ta',
    nodeId: 'N05',
    type: 'teach',
    title: '行を書き換えろ',
    language: 'javascript',
    initialText: 'TODO: fix\nreturn ok;',
    goalText: '// done\nreturn ok;',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['cc'],
    hints: [{ cost: 1, commands: ['cc', '// done', 'Esc'] }],
    flavor: 'cc で行ごと書き換え。dd + O + i より一発で済む',
  },

  // ── Teach: c$ で行末まで変更 ──
  // opt = 4 (c$+Esc=1, j=1, b=1, c$+Esc=1) → ☆3=4, ☆2=5, ☆1=7, life=10
  {
    id: 'N09-Tb',
    nodeId: 'N05',
    type: 'teach',
    title: '末尾を変えろ',
    language: 'javascript',
    initialText: 'let a = bad;\nlet b = old;',
    goalText: 'let a = ok;\nlet b = 42;',
    initialCursor: { line: 0, col: 8 },
    life: 10,
    stars: [4, 5, 7],
    availableCommands: ['c$', 'c0'],
    hints: [{ cost: 1, commands: ['c$', 'ok;', 'Esc', 'j', 'b', 'c$', '42;', 'Esc'] }],
    flavor: 'c$ でカーソルから行末まで一気に書き換えろ',
  },

  // ── Practice: 複数行の単語書き換え ──
  // opt = 4 (cw+Esc=1, j=1, b=1, cw+Esc=1) → ☆3=4, ☆2=6, ☆1=8, life=10
  {
    id: 'N09-P',
    nodeId: 'N05',
    type: 'practice',
    title: '書き換え連打',
    language: 'css',
    initialText: 'color: red;\nsize: big;',
    goalText: 'color: blue;\nsize: small;',
    initialCursor: { line: 0, col: 7 },
    life: 10,
    stars: [4, 6, 8],
    availableCommands: ['cw', 'ce', 'cb'],
    hints: [{ cost: 1, commands: ['cw', 'blue', 'Esc', 'j', 'b', 'cw', 'small', 'Esc'] }],
    flavor: 'CSS の値を cw で素早く書き換えろ',
  },

  // ── Challenge: cw + cc + c$ を組み合わせ ──
  // opt = 6 (cw+Esc=1, j=1, cc+Esc=1, j=1, w=1, cw+Esc=1) → ☆3=6, ☆2=9, ☆1=12, life=14
  {
    id: 'N09-C',
    nodeId: 'N05',
    type: 'challenge',
    title: '全面書き換え',
    language: 'javascript',
    initialText: 'const x = old;\nTODO\nreturn bad;',
    goalText: 'const x = new;\n// ok\nreturn good;',
    initialCursor: { line: 0, col: 10 },
    life: 14,
    stars: [6, 9, 12],
    availableCommands: ['cw', 'ce', 'cb', 'cc', 'c$', 'c0'],
    hints: [
      {
        cost: 1,
        commands: ['cw', 'new', 'Esc', 'j', 'cc', '// ok', 'Esc', 'j', 'w', 'cw', 'good', 'Esc'],
      },
    ],
    flavor: 'cw, cc を使い分けてコードを修正せよ',
  },
]
