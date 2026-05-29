import type { Stage } from '../../types/stage'
import { NodeId } from '../../types/nodeId'

/** Visual応用 — gn/gN, o/O, gv, 矩形操作 */
export const VISUAL_ADV_STAGES: Stage[] = [
  // ─── Teach: gn (select next search match) ─────────────────────
  {
    id: 'visual-adv-cgn',
    nodeId: NodeId.VisualAdv,
    type: 'tutorial',
    title: '検索マッチを選べ',
    language: 'javascript',
    initialText: 'let foo = 1;\nlet bar = foo;',
    goalText: 'let baz = 1;\nlet bar = baz;',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 6, 8],
    availableCommands: ['/', '?', 'y', 'd', 'c'],
    hints: [
      {
        cost: 1,
        commands: ['/foo', 'Enter', 'gn', 'c', 'baz', 'Esc', 'gn', 'c', 'baz', 'Esc'],
      },
    ],
    flavor: '/で検索してからgnで次のマッチをVisual選択。cで書き換えろ',
    newCommands: ['gn', 'gN'],
    tutorial: [
      {
        message: 'まず /foo Enter で "foo" を検索しろ',
        type: 'search',
        searchCommand: '/foo',
        expectedKey: null,
      },
      {
        message: 'gn を押せ。次の検索マッチが Visual 選択される',
        expectedKey: 'gn',
      },
      {
        message: 'c で選択範囲を変更だ。baz と打って Esc',
        expectedKey: 'c',
      },
      {
        message: 'もう一度 gn → c で次の foo も書き換えろ',
        expectedKey: null,
      },
    ],
  },
  // ── 🆕 Teach: 選択を操れ ──
  {
    id: 'visual-adv-select',
    nodeId: NodeId.VisualAdv,
    type: 'tutorial' as const,
    title: '選択を操れ',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['v', 'V', 'Ctrl+v'],
    visualCommands: ['y', 'd', 'c', 'o', 'O', 'gv'],
    hints: [],
    flavor: 'TODO',
    newCommands: ['o', 'O', 'gv'],
  },
  // ── 🆕 Teach: 矩形コメント ──
  {
    id: 'visual-adv-block',
    nodeId: NodeId.VisualAdv,
    type: 'tutorial' as const,
    title: '矩形コメント',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['v', 'V', 'Ctrl+v'],
    hints: [],
    flavor: 'TODO',
    newCommands: [],
  },
  // ── 🆕 Teach: 連続置換 ──
  {
    id: 'visual-adv-replace',
    nodeId: NodeId.VisualAdv,
    type: 'tutorial' as const,
    title: '連続置換',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['/', '?', '*', '#', 'y', 'd', 'c'],
    visualCommands: ['y', 'd', 'c'],
    hints: [],
    flavor: 'TODO',
    newCommands: ['cgn', 'dgn'],
  },
  // ── 🆕 Practice: Visual応用 総合 ──
  {
    id: 'visual-adv-practice',
    nodeId: NodeId.VisualAdv,
    type: 'practice' as const,
    title: 'Visual応用 総合',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: [],
    hints: [],
    flavor: 'TODO',
    newCommands: [],
  },
]
