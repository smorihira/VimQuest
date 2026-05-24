import type { Stage } from '../../types/stage'

/**
 * N11: 行削除 (dd)
 * ALL合流ノード: N08(^) + N15(dw)
 * Teach(T) = 1ステージ
 */
export const N11_STAGES: Stage[] = [
  // ── Teach: 不要な行を削除 (2本) ──
  // opt = 4 (j + dd + j + dd)
  {
    id: 'N11-T',
    nodeId: 'N11',
    type: 'teach',
    title: '行を消せ',
    language: 'javascript',
    initialText:
      'const a = 1;\n' +
      'console.log("debug1");\n' +
      'const b = 2;\n' +
      'console.log("debug2");\n' +
      'const c = 3;',
    goalText: 'const a = 1;\nconst b = 2;\nconst c = 3;',
    initialCursor: { line: 0, col: 0 },
    life: 10,
    stars: [4, 5, 7],
    availableCommands: ['dd'],
    hints: [{ cost: 1, commands: ['j', 'dd', 'j', 'dd'] }],
    flavor: 'デバッグ行をまるごと消せ。dd で一行削除だ',
  },
]
