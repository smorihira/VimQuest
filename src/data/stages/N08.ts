import type { Stage } from '../../types/stage'

/**
 * N8: 検索 (/, n, N)
 * Teach(T) + Practice(P) = 2ステージ
 */
export const N08_STAGES: Stage[] = [
  // ── Teach: 検索でジャンプ ──
  // opt = 1 (/error + Enter)
  {
    id: 'N08-T',
    nodeId: 'N08',
    type: 'teach',
    title: '検索せよ',
    language: 'javascript',
    initialText: 'const a = 1;\nconst b = 2;\nconst error = null;\nconst d = 4;',
    goalText: 'const a = 1;\nconst b = 2;\nconst error = null;\nconst d = 4;',
    initialCursor: { line: 0, col: 0 },
    life: 7,
    stars: [1, 2, 4],
    availableCommands: ['/'],
    clearConditions: { cursor: { line: 2, col: 6 } },
    hints: [{ cost: 1, commands: ['/error', 'Enter'] }],
    flavor: '/ で検索開始。error を探し出せ',
  },

  // ── Practice: 検索 + n で次へ ──
  // opt = 3 (/TODO + Enter, n, n)
  {
    id: 'N08-P',
    nodeId: 'N08',
    type: 'practice',
    title: '全部見つけろ',
    language: 'javascript',
    initialText:
      '// TODO: fix auth\n' +
      'function login() {}\n' +
      '// TODO: add validation\n' +
      'function save() {}\n' +
      '// TODO: write tests',
    goalText:
      '// TODO: fix auth\n' +
      'function login() {}\n' +
      '// TODO: add validation\n' +
      'function save() {}\n' +
      '// TODO: write tests',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 5, 7],
    availableCommands: ['/'],
    clearConditions: { cursor: { line: 4, col: 3 } },
    hints: [{ cost: 1, commands: ['/TODO', 'Enter', 'n', 'n'] }],
    flavor: '/TODO で検索して n で次のマッチへ。全3箇所の最後まで行け',
  },
]
