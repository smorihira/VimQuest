import type { Stage } from '../../types/stage'

/**
 * N04: 行頭/末Insert (I, A)
 * Teach(T) = 1ステージ
 */
export const N04_STAGES: Stage[] = [
  // ── Teach: 行頭にコメント記号を追加 ──
  // opt = 1 (I + type '// ' + Esc)
  {
    id: 'N04-T',
    nodeId: 'N04',
    type: 'teach',
    title: 'コメントアウト',
    language: 'javascript',
    initialText: 'fixBug()',
    goalText: '// fixBug()',
    initialCursor: { line: 0, col: 3 },
    life: 7,
    stars: [1, 2, 4],
    availableCommands: ['h', 'j', 'k', 'l', 'x', 'i', 'a', 'I', 'A'],
    hints: [{ cost: 1, commands: ['I', '// ', 'Esc'] }],
    flavor: 'I で行頭に移動して // を挿入せよ',
  },
]
