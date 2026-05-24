import type { Stage } from '../../types/stage'

/**
 * N04: 1文字置換 (r)
 * 渇望→報酬サイクル #2: x+i → r 一発
 * Teach(T) = 1ステージ
 */
export const N04_STAGES: Stage[] = [
  // ── Teach: typo を直す (2行分) ──
  // opt = 4 (l + re + j + ro)
  {
    id: 'N04-T',
    nodeId: 'N04',
    type: 'teach',
    title: '一文字直せ',
    language: 'plaintext',
    initialText: 'hallo\nwarld',
    goalText: 'hello\nworld',
    initialCursor: { line: 0, col: 0 },
    life: 10,
    stars: [4, 5, 7],
    availableCommands: ['r'],
    hints: [{ cost: 1, commands: ['l', 're', 'j', 'ro'] }],
    flavor: 'r で 1 文字だけ置換。x+i より速いぞ',
  },
]
