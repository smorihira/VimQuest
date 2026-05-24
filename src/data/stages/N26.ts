import type { Stage } from '../../types/stage'

/**
 * N26: インデント (>>, <<)
 * Teach(T) = 1ステージ
 */
export const N26_STAGES: Stage[] = [
  // ── Teach: >> でインデント追加 ──
  // opt = 2 (j + >>)
  {
    id: 'N26-T',
    nodeId: 'N26',
    type: 'teach',
    title: 'インデントせよ',
    language: 'python',
    initialText: 'if True:\nprint("hello")',
    goalText: 'if True:\n  print("hello")',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['>>', '<<'],
    hints: [{ cost: 1, commands: ['j', '>>'] }],
    flavor: '>> で行をインデント。Python のブロック構造を直せ',
  },
]
