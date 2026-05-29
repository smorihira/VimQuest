import type { Stage } from '../../types/stage'
import { NodeId } from '../../types/nodeId'

/**
 * N19: 大小文字操作 (~, gu, gU)
 */
export const N19_STAGES: Stage[] = [
  // ── Teach: 2箇所の大小を直す ──
  // opt = 3 (~ + w + ~)
  {
    id: 'operator-adv-tilde',
    nodeId: NodeId.OperatorAdv,
    type: 'tutorial',
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
    newCommands: ['~'],
    tutorial: [
      {
        message: '~ を押せ。大文字と小文字を入れ替えるぞ',
        expectedKey: '~',
      },
      {
        message: '~ は大小トグル+カーソル前進。W も小文字に直せ',
        expectedKey: null,
      },
    ],
  },
  // ── Teach: gu / gU で大小文字変換 ──
  // opt = 5 (guiw + w + gUiw + w + guiw)
  {
    id: 'operator-adv-case',
    nodeId: NodeId.OperatorAdv,
    type: 'tutorial',
    title: '大文字にしろ',
    language: 'javascript',
    initialText: 'HELLO world BYE',
    goalText: 'hello WORLD bye',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 6, 8],
    availableCommands: ['gu', 'gU', 'g~'],
    hints: [{ cost: 1, commands: ['guiw', 'w', 'gUiw', 'w', 'guiw'] }],
    flavor: 'gu で小文字、gU で大文字。TextObj と組み合わせろ',
    newCommands: ['gu', 'gU', 'g~'],
    tutorial: [
      {
        message: 'guiw と押せ。カーソル下の単語が小文字になる',
        expectedKey: 'guiw',
      },
      {
        message: 'w で次の単語へ',
        expectedKey: 'w',
      },
      {
        message: 'gUiw と押せ。今度は大文字になる',
        expectedKey: 'gUiw',
      },
      {
        message: 'gu で小文字、gU で大文字。残りも直せ',
        expectedKey: null,
      },
    ],
  },

  // ── 🆕 Practice: 発展オペレータ総合 ──
  {
    id: 'operator-adv-practice',
    nodeId: NodeId.OperatorAdv,
    type: 'practice' as const,
    title: '発展オペレータ総合',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['~', 'gu', 'gU', 'g~', '>', '<'],
    hints: [],
    flavor: 'TODO',
    newCommands: [],
  },
]
