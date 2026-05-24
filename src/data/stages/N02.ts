import type { Stage } from '../../types/stage'

/**
 * N02: 行頭/末Insert (I, A)
 * Teach(T) = 1ステージ
 */
export const N02_STAGES: Stage[] = [
  // ── Teach: /* */ で囲む (I で行頭、A で行末) ──
  // opt = 9 (I(1)+Esc(1) + A(1)+Esc(1) + j(1) + I(1)+Esc(1) + A(1)+Esc(1))
  {
    id: 'N02-T',
    nodeId: 'N02',
    type: 'teach',
    title: 'コメントで囲め',
    language: 'javascript',
    initialText: 'fix()\nrun()',
    goalText: '/* fix() */\n/* run() */',
    initialCursor: { line: 0, col: 2 },
    life: 15,
    stars: [9, 10, 12],
    availableCommands: ['I', 'A'],
    hints: [
      {
        cost: 1,
        commands: ['I', '/* ', 'Esc', 'A', ' */', 'Esc', 'j', 'I', '/* ', 'Esc', 'A', ' */', 'Esc'],
      },
    ],
    flavor: 'I で行頭、A で行末から Insert。両端から /* */ で囲め',
  },
]
