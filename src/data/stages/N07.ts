import type { Stage } from '../../types/stage'

/**
 * N07: 大小切替 (~)
 * Teach(T) = 1ステージ
 */
export const N07_STAGES: Stage[] = [
  // ── Teach: 先頭を大文字に ──
  // opt = 1 (~)
  {
    id: 'N07-T',
    nodeId: 'N07',
    type: 'teach',
    title: 'トグルせよ',
    language: 'plaintext',
    initialText: 'hello World',
    goalText: 'Hello World',
    initialCursor: { line: 0, col: 0 },
    life: 7,
    stars: [1, 2, 4],
    availableCommands: ['h', 'j', 'k', 'l', 'x', 'u', '~'],
    hints: [{ cost: 1, commands: ['~'] }],
    flavor: 'h を H に変えろ。~ で大小文字を切り替えられる',
  },
]
