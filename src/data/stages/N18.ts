import type { Stage } from '../../types/stage'

/**
 * N18: オペレータ+モーション (dw/de/db)
 * Vim文法の核心「動詞+対象」を初体験。
 * Teach(T) + Practice(P) + Challenge(C) = 3ステージ
 */

export const N18_STAGES: Stage[] = [
  // ── Teach: dw で単語1つ消す ──
  // opt = 2 (wdw等) → ☆3=2, ☆2=3, ☆1=5, life=8
  {
    id: 'N18-T',
    nodeId: 'N18',
    type: 'teach',
    title: '単語を消せ',
    language: 'plaintext',
    initialText: 'delete this word',
    goalText: 'delete word',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', 'x', 'dw', 'de', 'db'],
    hints: [{ cost: 1, commands: ['w', 'dw'] }],
    flavor: '"this " を dw で一撃で消せ',
  },

  // ── Practice: 複数単語を効率的に消す ──
  // opt = 4 (wdwwdw等) → ☆3=4, ☆2=6, ☆1=8, life=10
  {
    id: 'N18-P',
    nodeId: 'N18',
    type: 'practice',
    title: '連続削除',
    language: 'javascript',
    initialText: 'const very extremely important value = 42',
    goalText: 'const value = 42',
    initialCursor: { line: 0, col: 0 },
    life: 10,
    stars: [4, 6, 8],
    availableCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', 'x', 'dw', 'de', 'db'],
    hints: [{ cost: 1, commands: ['w', 'dw', 'dw', 'dw'] }],
    flavor: '余計な修飾語を dw で消し去れ',
  },

  // ── Challenge: 複数行で dw/de/db を使い分け ──
  // opt = 5 → ☆3=5, ☆2=8, ☆1=11, life=13
  {
    id: 'N18-C',
    nodeId: 'N18',
    type: 'challenge',
    title: '精密削除',
    language: 'css',
    initialText: 'body {\n  color: dark red;\n  background: light blue;\n}',
    goalText: 'body {\n  color: red;\n  background: blue;\n}',
    initialCursor: { line: 0, col: 0 },
    life: 18,
    stars: [10, 13, 16],
    availableCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', 'x', 'dw', 'de', 'db'],
    hints: [{ cost: 1, commands: ['j', 'w', 'w', 'w', 'dw', 'j', 'b', 'w', 'w', 'dw'] }],
    flavor: 'dark と light の接頭辞だけを正確に削れ',
  },
]
