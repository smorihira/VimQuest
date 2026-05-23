import type { Stage } from '../../types/stage'

/**
 * N17: カーソル下検索 (*, #)
 * Teach(T) = 1ステージ
 */
export const N17_STAGES: Stage[] = [
  // ── Teach: カーソル下の単語を検索 ──
  // opt = 1 (*)
  {
    id: 'N17-T',
    nodeId: 'N17',
    type: 'teach',
    title: '同じ奴を探せ',
    language: 'javascript',
    initialText: 'let foo = 1;\nlet bar = 2;\nlet foo = 3;',
    goalText: 'let foo = 1;\nlet bar = 2;\nlet foo = 3;',
    initialCursor: { line: 0, col: 4 },
    life: 7,
    stars: [1, 2, 4],
    baseCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', '/', 'n', 'N', 'x'],
    availableCommands: ['*', '#'],
    clearConditions: { cursor: { line: 2, col: 4 } },
    hints: [{ cost: 1, commands: ['*'] }],
    flavor: '* でカーソル下の単語を即検索。foo を見つけ出せ',
  },
]
