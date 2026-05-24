import type { Stage } from '../../types/stage'

/**
 * N20: 行内ジャンプ (f, t, ;, ,)
 * Teach(T) + Practice(P) + Challenge(C) = 3ステージ
 */
export const N20_STAGES: Stage[] = [
  // ── Teach: f で文字へジャンプ ──
  // opt = 1 (f()
  {
    id: 'N20-T',
    nodeId: 'N20',
    type: 'teach',
    title: '狙い撃て',
    language: 'javascript',
    initialText: 'const result = getValue(42);',
    goalText: 'const result = getValue(42);',
    initialCursor: { line: 0, col: 0 },
    life: 7,
    stars: [1, 2, 4],
    availableCommands: ['f', 't'],
    clearConditions: { cursor: { line: 0, col: 23 } },
    hints: [{ cost: 1, commands: ['f('] }],
    flavor: 'f( で ( まで一瞬でジャンプだ。www より速い',
  },

  // ── Practice: ; で f/t を繰り返す ──
  // opt = 3 (f/ + ; + ;) → third '/' in path
  {
    id: 'N20-P',
    nodeId: 'N20',
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
    id: 'N20-C',
    nodeId: 'N20',
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
