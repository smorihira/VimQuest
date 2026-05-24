import type { Stage } from '../../types/stage'

/**
 * N05: 大小切替 (~)
 * Teach(T) = 1ステージ
 */
export const N05_STAGES: Stage[] = [
  // ── Teach: 2箇所の大小を直す ──
  // opt = 3 (~ + w + ~)
  {
    id: 'N05-T',
    nodeId: 'N05',
    type: 'teach',
    title: 'トグルせよ',
    language: 'plaintext',
    initialText: 'hello World',
    goalText: 'Hello world',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['~'],
    hints: [{ cost: 1, commands: ['~', 'w', '~'] }],
    flavor: '~ で大小文字をトグル。カーソルも自動で進むぞ',
  },
]
