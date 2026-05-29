import type { Stage } from '../../types/stage'
import { NodeId } from '../../types/nodeId'

export const N23_STAGES: Stage[] = [
  // ─── Teach: v (visual select) ──────────────────────────────────
  {
    id: 'mode-visual-delete',
    nodeId: NodeId.Mode,
    type: 'tutorial',
    title: '選んで消せ',
    language: 'plaintext',
    initialText: 'keep[trash]save',
    goalText: 'keepsave',
    initialCursor: { line: 0, col: 4 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['v'],
    hints: [{ cost: 1, commands: ['v', 'f]', 'x'] }],
    flavor: 'v で Visual モードに入り、範囲を選んで x で消せ',
    newCommands: ['v'],
    tutorial: [
      {
        message: 'v を押せ。Visual モードに入るぞ',
        expectedKey: 'v',
      },
      {
        message: 'f] で ] まで選択範囲を広げろ',
        expectedKey: 'f]',
      },
      {
        message: 'x で選択範囲を削除だ',
        expectedKey: 'x',
      },
    ],
  },

  // ─── Teach: R (replace mode) ──────────────────────────────────
  {
    id: 'mode-overwrite',
    nodeId: NodeId.Mode,
    type: 'tutorial',
    title: '上書きモード',
    language: 'plaintext',
    initialText: 'abc def ghi',
    goalText: 'xyz def mno',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['R'],
    hints: [{ cost: 1, commands: ['R', 'xyz', 'Esc', 'fg', 'R', 'mno', 'Esc'] }],
    flavor: 'R で上書きモードに入る。連続する文字を一気に書き換えろ',
    newCommands: ['R'],
    tutorial: [
      {
        message: 'R を押せ。上書き（Replace）モードに入る',
        expectedKey: 'R',
      },
      {
        message: 'そのまま xyz と打て。1文字ずつ上書きされる',
        expectedKey: null,
      },
      {
        message: 'Esc でノーマルに戻ったら fg でジャンプし、もう一度 R で書き換えろ',
        expectedKey: null,
      },
    ],
  },

  // ── 🆕 Teach: 置換コマンド ──
  {
    id: 'mode-substitute',
    nodeId: NodeId.Mode,
    type: 'tutorial' as const,
    title: '置換コマンド',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: [],
    hints: [],
    flavor: 'TODO',
    newCommands: [':s'],
  },

  // ─── Practice: v + R combined (旧 N23-C) ─────────────────────────────────
  {
    id: 'mode-practice',
    nodeId: NodeId.Mode,
    type: 'practice',
    title: 'モード総合',
    language: 'javascript',
    initialText: 'keep [REMOVE] rest\naaa fghij zzz',
    goalText: 'keep rest\naaa klmno zzz',
    initialCursor: { line: 0, col: 5 },
    life: 12,
    stars: [6, 8, 10],
    availableCommands: ['v', 'R'],
    hints: [
      {
        cost: 1,
        commands: ['v', 'f]', 'l', 'x', 'j', 'b', 'R', 'klmno', 'Esc'],
      },
    ],
    flavor: 'Visual で消し、Replace で上書き。モードを使い分けろ',
    newCommands: [],
  },
]
