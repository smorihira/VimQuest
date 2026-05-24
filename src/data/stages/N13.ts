import type { Stage } from '../../types/stage'

/**
 * N13: カーソル下検索 (*, #)
 * Teach(T) = 1ステージ
 */
export const N13_STAGES: Stage[] = [
  // ── Teach: カーソル下の単語を検索 ──
  // opt = 1 (*)
  {
    id: 'N13-T',
    nodeId: 'N13',
    type: 'teach',
    title: '同じ奴を探せ',
    language: 'javascript',
    initialText: 'let foo = 1;\nlet bar = 2;\nlet foo = 3;',
    goalText: 'let foo = 1;\nlet bar = 2;\nlet foo = 3;',
    initialCursor: { line: 0, col: 4 },
    life: 7,
    stars: [1, 2, 4],
    availableCommands: ['*', '#', '/'],
    clearConditions: { cursor: { line: 2, col: 4 } },
    hints: [{ cost: 1, commands: ['*'] }],
    flavor: '* でカーソル下の単語を即検索。foo を見つけ出せ',
  },
]
