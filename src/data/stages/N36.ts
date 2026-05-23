import type { Stage } from '../../types/stage'

/**
 * N36: インデント (>>, <<)
 * Teach(T) = 1ステージ
 */
export const N36_STAGES: Stage[] = [
  // ── Teach: >> でインデント追加 ──
  // opt = 2 (j + >>)
  {
    id: 'N36-T',
    nodeId: 'N36',
    type: 'teach',
    title: 'インデントせよ',
    language: 'python',
    initialText: 'if True:\nprint("hello")',
    goalText: 'if True:\n  print("hello")',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', 'x', '>>', '<<'],
    hints: [{ cost: 1, commands: ['j', '>>'] }],
    flavor: '>> で行をインデント。Python のブロック構造を直せ',
  },
]
