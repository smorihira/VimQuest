import type { Stage } from '../../types/stage'

/**
 * N12: 行内ジャンプ (f, t, ;, ,)
 * Teach(T) + Practice(P) + Challenge(C) = 3ステージ
 */
export const N12_STAGES: Stage[] = [
  // ── Teach: f/t/;/, で行内ジャンプ ──
  // opt = 2 (f; + ;)
  {
    id: 'N12-T',
    nodeId: 'N01',
    type: 'tutorial',
    title: '狙い撃て',
    language: 'javascript',
    initialText: 'fn(a, b); fn(c, d);',
    goalText: 'fn(a, b); fn(c, d);',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '^', '$', 'gg', 'G', 'f', 't'],
    clearConditions: { cursor: { line: 0, col: 18 } },
    hints: [{ cost: 1, commands: ['f;', ';'] }],
    flavor: 'f で狙った文字に一瞬で飛べ。; で繰り返しだ',
    newCommands: ['f', 't', ';', ','],
    tutorial: [
      {
        message: 'f( と押せ。行内の ( に一瞬でジャンプ',
        expectedKey: 'f(',
      },
      {
        message: '; を押せ。直前の f を繰り返す',
        expectedKey: ';',
      },
      {
        message: ', を押せ。逆方向に繰り返す',
        expectedKey: ',',
      },
      {
        message: 't) と押せ。) の1文字手前に止まる',
        expectedKey: 't)',
      },
      {
        message: 'f で直接、t で手前。; で繰り返し、, で逆方向だ',
        expectedKey: null,
      },
    ],
  },
]
