import type { Stage } from '../../types/stage'

/**
 * N06: 1文字置換 (r)
 * 渇望→報酬サイクル #2: x+i → r 一発
 * Teach(T) = 1ステージ
 */
export const N06_STAGES: Stage[] = [
  // ── Teach: 1文字を置換 ──
  // opt = 2 (l + re)
  {
    id: 'N06-T',
    nodeId: 'N06',
    type: 'teach',
    title: '一文字直せ',
    language: 'plaintext',
    initialText: 'hallo',
    goalText: 'hello',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['h', 'j', 'k', 'l', 'x', 'r'],
    hints: [{ cost: 1, commands: ['l', 're'] }],
    flavor: 'a を e に置き換えろ。x で消して i で打ち直す？ r なら一発だ',
  },
]
