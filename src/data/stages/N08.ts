import type { Stage } from '../../types/stage'

/**
 * N08: 非空白行頭 (^)
 * 渇望→報酬サイクル #3: 0+www → ^ 一発
 * Teach(T) = 1ステージ
 */
export const N08_STAGES: Stage[] = [
  // ── Teach: インデント先頭へジャンプ ──
  // opt = 1 (^)
  {
    id: 'N08-T',
    nodeId: 'N08',
    type: 'teach',
    title: 'コードの頭へ',
    language: 'javascript',
    initialText: '    const x = 42;',
    goalText: '    const x = 42;',
    initialCursor: { line: 0, col: 15 },
    life: 7,
    stars: [1, 2, 4],
    availableCommands: ['^', '0', '$'],
    clearConditions: { cursor: { line: 0, col: 4 } },
    hints: [{ cost: 1, commands: ['^'] }],
    flavor: '0 だと空白の前に行く。^ ならコードの先頭に飛べる',
  },
]
