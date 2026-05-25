import type { Stage } from '../../types/stage'

/**
 * N06: 検索 (/, n, N, *, #)
 */
export const N06_STAGES: Stage[] = [
  // ── Teach: 検索でジャンプ ──
  // opt = 3 (/bug Enter + n + n)
  {
    id: 'N06-T',
    nodeId: 'N06',
    type: 'teach',
    title: '検索せよ',
    language: 'javascript',
    initialText:
      'const x = 1;\n' +
      '// bug: fix later\n' +
      'const y = 2;\n' +
      '// bug: needs review\n' +
      'const z = 3;\n' +
      '// bug: critical',
    goalText:
      'const x = 1;\n' +
      '// bug: fix later\n' +
      'const y = 2;\n' +
      '// bug: needs review\n' +
      'const z = 3;\n' +
      '// bug: critical',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['/'],
    clearConditions: { cursor: { line: 5, col: 3 } },
    hints: [{ cost: 1, commands: ['/bug', 'Enter', 'n', 'n'] }],
    flavor: '/ で検索開始。bug を全部見つけろ',
  },

  // ── Practice: 検索 + n で次へ ──
  // opt = 3 (/TODO + Enter, n, n)
  {
    id: 'N06-P',
    nodeId: 'N06',
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
  // ── Teach: カーソル下の単語を検索 (5行、最後の foo へ) ──
  // opt = 2 (* + *)
  {
    id: 'N06-Ta',
    nodeId: 'N06',
    type: 'teach',
    title: '同じ奴を探せ',
    language: 'javascript',
    initialText:
      'let foo = 1;\n' + 'let bar = 2;\n' + 'let foo = 3;\n' + 'let baz = 4;\n' + 'let foo = 5;',
    goalText:
      'let foo = 1;\n' + 'let bar = 2;\n' + 'let foo = 3;\n' + 'let baz = 4;\n' + 'let foo = 5;',
    initialCursor: { line: 0, col: 4 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['*', '#', '/'],
    clearConditions: { cursor: { line: 4, col: 4 } },
    hints: [{ cost: 1, commands: ['*', '*'] }],
    flavor: '* でカーソル下の単語を即検索。最後の foo を見つけ出せ',
  },
]
