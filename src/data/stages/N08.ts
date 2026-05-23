import type { Stage } from '../../types/stage'

/**
 * N08: 単語移動 (w, b, e)
 * Teach(T) + Practice(P) = 2ステージ
 */
export const N08_STAGES: Stage[] = [
  // ── Teach: 単語単位でカーソル移動 ──
  // opt = 3 (www) → cursor at 'fox'
  {
    id: 'N08-T',
    nodeId: 'N08',
    type: 'teach',
    title: '単語を飛べ',
    language: 'plaintext',
    initialText: 'the quick brown fox',
    goalText: 'the quick brown fox',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', 'x'],
    clearConditions: { cursor: { line: 0, col: 16 } },
    hints: [{ cost: 1, commands: ['w', 'w', 'w'] }],
    flavor: 'w で単語単位にジャンプ。fox までたどり着け',
  },

  // ── Practice: 複数行を単語移動で踏破 ──
  // opt = 5 (wwwww) → cursor at 'world' on line 1
  {
    id: 'N08-P',
    nodeId: 'N08',
    type: 'practice',
    title: '単語ラリー',
    language: 'plaintext',
    initialText: 'foo bar baz qux\nhello world',
    goalText: 'foo bar baz qux\nhello world',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 7, 9],
    availableCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', 'x'],
    clearConditions: { cursor: { line: 1, col: 6 } },
    hints: [{ cost: 1, commands: ['w', 'w', 'w', 'w', 'w'] }],
    flavor: '2行目の world まで w で飛んでいけ',
  },
]
