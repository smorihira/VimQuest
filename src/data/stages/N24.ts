import type { Stage } from '../../types/stage'

/**
 * N24: f/t繰り返し (;, ,)
 * Teach(T) = 1ステージ
 */
export const N24_STAGES: Stage[] = [
  // ── Teach: ; でf/tを繰り返す ──
  // opt = 3 (f/ + ; + ;) → third '/' in path
  {
    id: 'N24-T',
    nodeId: 'N24',
    type: 'teach',
    title: '繰り返し撃て',
    language: 'plaintext',
    initialText: 'path/to/the/file.txt',
    goalText: 'path/to/the/file.txt',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', 'f', 't', ';', ',', 'x', 'u'],
    clearConditions: { cursor: { line: 0, col: 11 } },
    hints: [{ cost: 1, commands: ['f/', ';', ';'] }],
    flavor: 'f/ で最初の / へ。; で次の / に繰り返しジャンプだ',
  },
]
