import type { Stage } from '../../types/stage'

/**
 * N28: 変更ショート (s, S, C)
 * s = cl, S = cc, C = c$
 * Teach(T) = 1ステージ
 */
export const N28_STAGES: Stage[] = [
  // ── Teach: s で1文字置換＋Insert ──
  // opt = 2 (fs + s + 'S' + Esc)
  {
    id: 'N28-T',
    nodeId: 'N28',
    type: 'teach',
    title: 'ショートカット',
    language: 'javascript',
    initialText: 'const result = null;',
    goalText: 'const Result = null;',
    initialCursor: { line: 0, col: 6 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['ciw', 's', 'S', 'C', 'f', 't', '0', '$'],
    hints: [{ cost: 1, commands: ['s', 'R', 'Esc'] }],
    flavor: 's で1文字消してすぐ入力。r より柔軟だ',
  },
]
