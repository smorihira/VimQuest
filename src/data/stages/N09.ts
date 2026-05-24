import type { Stage } from '../../types/stage'

/**
 * N9: カーソル下検索 (*, #)
 * Teach(T) = 1ステージ
 */
export const N09_STAGES: Stage[] = [
  // ── Teach: カーソル下の単語を検索 (5行、最後の foo へ) ──
  // opt = 2 (* + *)
  {
    id: 'N09-T',
    nodeId: 'N09',
    type: 'teach',
    title: '同じ奴を探せ',
    language: 'javascript',
    initialText:
      'let foo = 1;\n' + 'let bar = 2;\n' + 'let foo = 3;\n' + 'let baz = 4;\n' + 'let foo = 5;',
    goalText:
      'let foo = 1;\n' + 'let bar = 2;\n' + 'let foo = 3;\n' + 'let baz = 4;\n' + 'let foo = 5;',
    initialCursor: { line: 0, col: 4 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['*', '#', '/'],
    clearConditions: { cursor: { line: 4, col: 4 } },
    hints: [{ cost: 1, commands: ['*', '*'] }],
    flavor: '* でカーソル下の単語を即検索。最後の foo を見つけ出せ',
  },
]
