import type { Stage } from '../../types/stage'

/**
 * N19: 基本TextObj (iw, aw)
 * Teach(T) + Practice(P) = 2ステージ
 */
export const N19_STAGES: Stage[] = [
  // ── Teach: daw で単語ごと削除 ──
  // opt = 2 (w + daw)
  {
    id: 'N19-T',
    nodeId: 'N19',
    type: 'teach',
    title: '単語を掴め',
    language: 'plaintext',
    initialText: 'hello nice world',
    goalText: 'hello world',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['dw', 'de', 'db', 'diw', 'daw', 'f', 't'],
    hints: [{ cost: 1, commands: ['w', 'daw'] }],
    flavor: 'daw で周囲の空白ごと単語を消せる。dw より正確だ',
  },

  // ── Practice: 複数単語削除 ──
  // opt = 3 (w + daw + daw)
  {
    id: 'N19-P',
    nodeId: 'N19',
    type: 'practice',
    title: '不要語削除',
    language: 'plaintext',
    initialText: 'remove bad ugly text here',
    goalText: 'remove text here',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 5, 7],
    availableCommands: ['dw', 'de', 'db', 'diw', 'daw', 'f', 't'],
    hints: [{ cost: 1, commands: ['w', 'daw', 'daw'] }],
    flavor: '不要な形容詞を daw で消し去れ',
  },
]
