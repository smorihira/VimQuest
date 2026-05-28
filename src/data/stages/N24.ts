import type { Stage } from '../../types/stage'

export const N24_STAGES: Stage[] = [
  // ─── Teach: gn (select next search match) ─────────────────────
  {
    id: 'N24-T',
    nodeId: 'N09',
    type: 'teach',
    title: '検索マッチを選べ',
    language: 'javascript',
    initialText: 'let foo = 1;\nlet bar = foo;',
    goalText: 'let baz = 1;\nlet bar = baz;',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 6, 8],
    availableCommands: ['/', 'c'],
    hints: [
      {
        cost: 1,
        commands: ['/foo', 'Enter', 'gn', 'c', 'baz', 'Esc', 'gn', 'c', 'baz', 'Esc'],
      },
    ],
    flavor: '/で検索してからgnで次のマッチをVisual選択。cで書き換えろ',
  },

  // ─── Practice: cgn workflow ───────────────────────────────────
  {
    id: 'N24-P',
    nodeId: 'N09',
    type: 'practice',
    title: 'cgn 連続置換',
    language: 'javascript',
    initialText: 'old + old + old',
    goalText: 'new + new + new',
    initialCursor: { line: 0, col: 0 },
    life: 10,
    stars: [4, 6, 8],
    availableCommands: ['/', 'c', 'cgn'],
    hints: [
      {
        cost: 1,
        commands: ['/old', 'Enter', 'cgn', 'new', 'Esc', '.', '.'],
      },
    ],
    flavor: 'cgn で検索マッチを一発変更。. で次々と繰り返せ',
  },

  // ── Challenge: cgn 一括置換（2パターン） ──
  // opt = 6: /TODO(1)+cgn(0)+DONE+Esc(1)+.(1)+/old(1)+cgn(0)+new+Esc(1)+.(1)
  {
    id: 'N24-C',
    nodeId: 'N09',
    type: 'challenge',
    title: 'cgn 一括置換',
    language: 'plaintext',
    initialText: 'TODO fix old\nTODO fix old',
    goalText: 'DONE fix new\nDONE fix new',
    initialCursor: { line: 0, col: 0 },
    life: 14,
    stars: [6, 9, 12],
    availableCommands: ['/', 'c', 'cgn'],
    hints: [
      {
        cost: 1,
        commands: [
          '/TODO',
          'Enter',
          'cgn',
          'DONE',
          'Esc',
          '.',
          '/old',
          'Enter',
          'cgn',
          'new',
          'Esc',
          '.',
        ],
      },
    ],
    flavor: '2種類の単語を cgn + . で一括置換せよ',
  },
]
