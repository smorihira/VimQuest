import type { Stage } from '../../types/stage'

/**
 * N02: 1文字削除 (x) + undo (u)
 * xの痛みを体験させ、後のdwへの渇望を生む。
 * Teach(T) + Practice(P) = 2ステージ
 */

export const N02_STAGES: Stage[] = [
  // ── Teach: 余分な文字を x で消す ──
  // opt = 3 (llx) → ☆3=3, ☆2=4, ☆1=6, life=9
  {
    id: 'N02-T',
    nodeId: 'N02',
    type: 'teach',
    title: '一文字消せ',
    language: 'plaintext',
    initialText: 'helllo',
    goalText: 'hello',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['h', 'j', 'k', 'l', 'x'],
    hints: [{ cost: 1, commands: ['l', 'l', 'x'] }],
    flavor: '余分な l を x で消せ',
  },

  // ── Practice: x連打の苦痛を味わう（dw渇望ステージ） ──
  // opt = 12 (llllllxxxxxx) → ☆3=12, ☆2=14, ☆1=16, life=18
  {
    id: 'N02-P',
    nodeId: 'N02',
    type: 'practice',
    title: '消しまくれ',
    language: 'plaintext',
    initialText: 'hello XXXXX world',
    goalText: 'hello world',
    initialCursor: { line: 0, col: 0 },
    life: 18,
    stars: [12, 14, 16],
    availableCommands: ['h', 'j', 'k', 'l', 'x'],
    hints: [{ cost: 1, commands: ['l', 'l', 'l', 'l', 'l', 'l', 'x', 'x', 'x', 'x', 'x', 'x'] }],
    flavor: 'XXXXXを消せ。…もっと良い方法があればいいのに',
  },
]
