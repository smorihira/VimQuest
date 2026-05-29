import type { Stage } from '../../types/stage'
import { NodeId } from '../../types/nodeId'

/** 検索 — /, ?, *, # */
export const SEARCH_STAGES: Stage[] = [
  // ── Teach: 検索でジャンプ ──
  // opt = 3 (/bug Enter + n + n)
  {
    id: 'search-find',
    nodeId: NodeId.Search,
    type: 'tutorial',
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
    availableCommands: ['/', '?'],
    clearConditions: { cursor: { line: 5, col: 3 } },
    hints: [{ cost: 1, commands: ['/bug', 'Enter', 'n', 'n'] }],
    flavor: '/ で検索開始。bug を全部見つけろ',
    newCommands: ['/', '?', 'n', 'N'],
    tutorial: [
      {
        message: '/ を押して bug と入力し Enter で検索しろ',
        expectedKey: null,
        type: 'search',
        searchCommand: '/bug',
      },
      {
        message: 'n を押せ。次のマッチにジャンプする',
        expectedKey: 'n',
      },
      {
        message: 'N を押せ。前のマッチに戻れる',
        expectedKey: 'N',
      },
      {
        message: '/ で検索、n で次、N で前。最後の bug まで行け',
        expectedKey: null,
      },
    ],
  },
  // ── Teach: カーソル下の単語を検索 (5行、最後の foo へ) ──
  // opt = 2 (* + *)
  {
    id: 'search-star',
    nodeId: NodeId.Search,
    type: 'tutorial',
    title: '同じ奴を探せ',
    language: 'javascript',
    initialText:
      'let foo = 1;\n' + 'let bar = 2;\n' + 'let foo = 3;\n' + 'let baz = 4;\n' + 'let foo = 5;',
    goalText:
      'let foo = 1;\n' + 'let bar = 2;\n' + 'let foo = 3;\n' + 'let baz = 4;\n' + 'let foo = 5;',
    initialCursor: { line: 0, col: 4 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['*', '#'],
    clearConditions: { cursor: { line: 4, col: 4 } },
    hints: [{ cost: 1, commands: ['*', '*'] }],
    flavor: '* でカーソル下の単語を即検索。最後の foo を見つけ出せ',
    newCommands: ['*', '#'],
    tutorial: [
      {
        message: '* を押せ。カーソル下の foo を前方検索して次に飛ぶ',
        expectedKey: '*',
      },
      {
        message: '# を押せ。今度は後方に戻る',
        expectedKey: '#',
      },
      {
        message: '* で前方、# で後方。最後の foo まで飛べ',
        expectedKey: null,
      },
    ],
  },
  // ── 🆕 Practice: 検索総合 ──
  {
    id: 'search-practice',
    nodeId: NodeId.Search,
    type: 'practice' as const,
    title: '検索総合',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['/', '?', '*', '#'],
    hints: [],
    flavor: 'TODO',
    newCommands: [],
  },
]
