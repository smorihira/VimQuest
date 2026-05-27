import type { Stage } from '../../types/stage'

/**
 * N19: 大小文字操作 (~, gu, gU)
 */
export const N19_STAGES: Stage[] = [
  // ── Teach: 2箇所の大小を直す ──
  // opt = 3 (~ + w + ~)
  {
    id: 'N19-T',
    nodeId: 'N13',
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
    nodeId: 'N13',
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

  // ── Practice: ~ + >> + << + gu/gU ──
  // opt = 5: <<(1)+guiw(1)+j(1)+>>(1)+gUiw(1)
  {
    id: 'N19-P',
    nodeId: 'N13',
    type: 'practice',
    title: '大小文字とインデント',
    language: 'plaintext',
    initialText: '  HELLO\nworld',
    goalText: 'hello\n  WORLD',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 7, 9],
    availableCommands: ['~', 'gu', 'gU', '>>', '<<'],
    hints: [{ cost: 1, commands: ['<<', 'guiw', 'j', '>>', 'gUiw'] }],
    flavor: '<< でインデント削除、gu/gU で大小変換。組み合わせろ',
  },

  // ── Challenge: 変換総合 ──
  // opt = 6: guiw(1)+j(1)+<<(1)+j(1)+>>(1)+gUiw(1)
  {
    id: 'N19-C',
    nodeId: 'N13',
    type: 'challenge',
    title: '変換総合',
    language: 'plaintext',
    initialText: 'HELLO\n  world\nhey',
    goalText: 'hello\nworld\n  HEY',
    initialCursor: { line: 0, col: 0 },
    life: 14,
    stars: [6, 9, 12],
    availableCommands: ['~', 'gu', 'gU', '>>', '<<'],
    hints: [{ cost: 1, commands: ['guiw', 'j', '<<', 'j', '>>', 'gUiw'] }],
    flavor: '大小変換とインデントを使いこなせ',
  },
]
