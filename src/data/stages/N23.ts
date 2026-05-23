import type { Stage } from '../../types/stage'

/**
 * N23: 行内ジャンプ (f, t)
 * Teach(T) + Practice(P) = 2ステージ
 */
export const N23_STAGES: Stage[] = [
  // ── Teach: f で文字へジャンプ ──
  // opt = 1 (f()
  {
    id: 'N23-T',
    nodeId: 'N23',
    type: 'teach',
    title: '狙い撃て',
    language: 'javascript',
    initialText: 'const result = getValue(42);',
    goalText: 'const result = getValue(42);',
    initialCursor: { line: 0, col: 0 },
    life: 7,
    stars: [1, 2, 4],
    baseCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', 'x'],
    availableCommands: ['f', 't'],
    clearConditions: { cursor: { line: 0, col: 23 } },
    hints: [{ cost: 1, commands: ['f('] }],
    flavor: 'f( で ( まで一瞬でジャンプだ。www より速い',
  },

  // ── Practice: f/t を使い分けて複数目標 ──
  // opt = 3 (f= + x + f; で = を消して ; に到達)
  {
    id: 'N23-P',
    nodeId: 'N23',
    type: 'practice',
    title: '精密射撃',
    language: 'css',
    initialText: 'style: rred;',
    goalText: 'style: red;',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 5, 7],
    baseCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', 'x'],
    availableCommands: ['f', 't'],
    hints: [{ cost: 1, commands: ['fr', 'l', 'x'] }],
    flavor: 'f で素早く目標に接近し、余分な r を消せ',
  },
]
