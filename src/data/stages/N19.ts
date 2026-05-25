import type { Stage } from '../../types/stage'

/**
 * N19: 大小文字操作 (~, gu, gU)
 */
export const N19_STAGES: Stage[] = [
  // ── Teach: 2箇所の大小を直す ──
  // opt = 3 (~ + w + ~)
  {
    id: 'N19-T',
    nodeId: 'N19',
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
  // ── Teach: gu / gU で大小文字変換 ──
  // opt = 5 (guiw + w + gUiw + w + guiw)
  {
    id: 'N19-Ta',
    nodeId: 'N19',
    type: 'teach',
    title: '大文字にしろ',
    language: 'javascript',
    initialText: 'HELLO world BYE',
    goalText: 'hello WORLD bye',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 6, 8],
    availableCommands: ['gu', 'gU', 'f', 't'],
    hints: [{ cost: 1, commands: ['guiw', 'w', 'gUiw', 'w', 'guiw'] }],
    flavor: 'gu で小文字、gU で大文字。TextObj と組み合わせろ',
  },
]
