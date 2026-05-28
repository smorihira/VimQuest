import type { Stage } from '../../types/stage'

/**
 * N20: インデント (>>, <<)
 * Teach(T) = 1ステージ
 */
export const N20_STAGES: Stage[] = [
  // ── Teach: >> と << でインデント調整 ──
  // opt = 6 (j + >> + j + >> + j + <<)
  {
    id: 'N20-T',
    nodeId: 'N13',
    type: 'tutorial',
    title: 'インデントせよ',
    language: 'python',
    initialText: 'def greet():\nprint("hi")\nprint("bye")\n  return None',
    goalText: 'def greet():\n  print("hi")\n  print("bye")\nreturn None',
    initialCursor: { line: 0, col: 0 },
    life: 12,
    stars: [6, 7, 9],
    availableCommands: ['>', '<'],
    hints: [
      {
        cost: 1,
        commands: ['j', '>>', 'j', '>>', 'j', '<<'],
      },
    ],
    flavor: '>> でインデント追加、<< で削除。Python の構造を直せ',
    newCommands: ['>', '<'],
    tutorial: [
      {
        message: 'j で print の行に移動しろ',
        expectedKey: 'j',
      },
      {
        message: '>> と押せ。インデントを追加する',
        expectedKey: '>>',
      },
      {
        message: 'j を2回押して return の行に移動しろ',
        expectedKey: 'j',
      },
      {
        message: 'もう一回 j',
        expectedKey: 'j',
      },
      {
        message: '<< と押せ。今度はインデントを削除する',
        expectedKey: '<<',
      },
      {
        message: '>> で追加、<< で削除。残りの行も直せ',
        expectedKey: null,
      },
    ],
  },
]
