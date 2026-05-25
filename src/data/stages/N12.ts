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
    nodeId: 'N12',
    type: 'teach',
    title: '狙い撃て',
    language: 'javascript',
    initialText: 'fn(a, b); fn(c, d);',
    goalText: 'fn(a, b); fn(c, d);',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['f', 't'],
    clearConditions: { cursor: { line: 0, col: 18 } },
    hints: [{ cost: 1, commands: ['f;', ';'] }],
    flavor: 'f で狙った文字に一瞬で飛べ。; で繰り返しだ',
  },

  // ── Practice: ; で f/t を繰り返す ──
  // opt = 3 (f/ + ; + ;) → third '/' in path
  {
    id: 'N12-P',
    nodeId: 'N12',
    type: 'practice',
    title: '繰り返し撃て',
    language: 'plaintext',
    initialText: 'path/to/the/file.txt',
    goalText: 'path/to/the/file.txt',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 5, 7],
    availableCommands: ['f', 't'],
    clearConditions: { cursor: { line: 0, col: 11 } },
    hints: [{ cost: 1, commands: ['f/', ';', ';'] }],
    flavor: 'f/ で最初の / へ。; で次の / に繰り返しジャンプだ',
  },

  // ── Challenge: f/t を使い分けて目標達成 ──
  // opt = 3 (fr + l + x)
  {
    id: 'N12-C',
    nodeId: 'N12',
    type: 'challenge',
    title: '精密射撃',
    language: 'css',
    initialText: 'style: rred;',
    goalText: 'style: red;',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [3, 6, 9],
    availableCommands: ['f', 't'],
    hints: [{ cost: 1, commands: ['fr', 'l', 'x'] }],
    flavor: 'f で素早く目標に接近し、余分な r を消せ',
  },
]
