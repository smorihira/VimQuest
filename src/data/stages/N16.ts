import type { Stage } from '../../types/stage'

/**
 * N16: 基本TextObj (iw, aw)
 * Teach(T) + Practice(P) = 2ステージ
 */
export const N16_STAGES: Stage[] = [
  // ── Teach: diw vs daw の違いを体験 ──
  // opt = 3 (w + daw + daw)
  {
    id: 'N16-T',
    nodeId: 'N16',
    type: 'teach',
    title: '単語を掴め',
    language: 'plaintext',
    initialText: 'hello nice ugly world',
    goalText: 'hello world',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['dw', 'de', 'db', 'diw', 'daw', 'f', 't'],
    hints: [{ cost: 1, commands: ['w', 'daw', 'daw'] }],
    flavor: 'daw で空白ごと単語を消せる。diw との違いを感じろ',
  },

  // ── Practice: 複数単語削除 ──
  // opt = 3 (w + daw + daw)
  {
    id: 'N16-P',
    nodeId: 'N16',
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
