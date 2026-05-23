import type { Stage } from '../../types/stage'

/**
 * N19: 行削除 (dd)
 * ALL合流ノード: N11(^) + N18(dw)
 * Teach(T) = 1ステージ
 */
export const N19_STAGES: Stage[] = [
  // ── Teach: 不要な行を削除 ──
  // opt = 2 (j + dd)
  {
    id: 'N19-T',
    nodeId: 'N19',
    type: 'teach',
    title: '行を消せ',
    language: 'javascript',
    initialText: 'const a = 1;\nconsole.log("debug");\nconst b = 2;',
    goalText: 'const a = 1;\nconst b = 2;',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    baseCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', '^', 'x'],
    availableCommands: ['dw', 'de', 'db', 'dd'],
    hints: [{ cost: 1, commands: ['j', 'dd'] }],
    flavor: 'デバッグ行をまるごと消せ。dd で一行削除だ',
  },
]
