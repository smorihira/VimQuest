import type { Stage } from '../../types/stage'

/**
 * N16: 行削除 (dd)
 * ALL合流ノード: N08(^) + N15(dw)
 * Teach(T) = 1ステージ
 */
export const N16_STAGES: Stage[] = [
  // ── Teach: 不要な行を削除 ──
  // opt = 2 (j + dd)
  {
    id: 'N16-T',
    nodeId: 'N16',
    type: 'teach',
    title: '行を消せ',
    language: 'javascript',
    initialText: 'const a = 1;\nconsole.log("debug");\nconst b = 2;',
    goalText: 'const a = 1;\nconst b = 2;',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['dw', 'de', 'db', 'dd', '0', '$', '^'],
    hints: [{ cost: 1, commands: ['j', 'dd'] }],
    flavor: 'デバッグ行をまるごと消せ。dd で一行削除だ',
  },
]
