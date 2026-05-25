import type { Stage } from '../../types/stage'

/**
 * N19: インデント (>>, <<)
 * Teach(T) = 1ステージ
 */
export const N19_STAGES: Stage[] = [
  // ── Teach: >> と << でインデント調整 ──
  // opt = 6 (j + >> + j + >> + j + <<)
  {
    id: 'N19-T',
    nodeId: 'N19',
    type: 'teach',
    title: 'インデントせよ',
    language: 'python',
    initialText: 'def greet():\nprint("hi")\nprint("bye")\n  return None',
    goalText: 'def greet():\n  print("hi")\n  print("bye")\nreturn None',
    initialCursor: { line: 0, col: 0 },
    life: 12,
    stars: [6, 7, 9],
    availableCommands: ['>>', '<<'],
    hints: [
      {
        cost: 1,
        commands: ['j', '>>', 'j', '>>', 'j', '<<'],
      },
    ],
    flavor: '>> でインデント追加、<< で削除。Python の構造を直せ',
  },
]
