import type { Stage } from '../../types/stage'

/**
 * N02: Insertバリエーション (I, A, o, O, gi)
 */
export const N02_STAGES: Stage[] = [
  // ── Teach: /* */ で囲む (I で行頭、A で行末) ──
  // opt = 5 (I…Esc(1) + A…Esc(1) + j(1) + I…Esc(1) + A…Esc(1))
  {
    id: 'N02-T',
    nodeId: 'N02',
    type: 'teach',
    title: 'コメントで囲め',
    language: 'javascript',
    initialText: 'fix()\nrun()',
    goalText: '/* fix() */\n/* run() */',
    initialCursor: { line: 0, col: 2 },
    life: 11,
    stars: [5, 6, 8],
    availableCommands: ['I', 'A'],
    hints: [
      {
        cost: 1,
        commands: ['I', '/* ', 'Esc', 'A', ' */', 'Esc', 'j', 'I', '/* ', 'Esc', 'A', ' */', 'Esc'],
      },
    ],
    flavor: 'I で行頭、A で行末から Insert。両端から /* */ で囲め',
  },
  // ── Teach: 上下に行を追加 (O で上、o で下) ──
  // opt = 5 (O…Esc(1) + j(1) + o…Esc(1) + j(1) + o…Esc(1))
  {
    id: 'N02-Ta',
    nodeId: 'N02',
    type: 'teach',
    title: '行を足せ',
    language: 'plaintext',
    initialText: 'B\nD',
    goalText: 'A\nB\nC\nD\nE',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 6, 8],
    availableCommands: ['o', 'O', 'I', 'A'],
    hints: [
      {
        cost: 1,
        commands: ['O', 'A', 'Esc', 'j', 'o', 'C', 'Esc', 'j', 'o', 'E', 'Esc'],
      },
    ],
    flavor: 'O で上に、o で下に新行を作れ',
  },
]
