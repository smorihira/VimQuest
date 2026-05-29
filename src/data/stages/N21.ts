import type { Stage } from '../../types/stage'
import { NodeId } from '../../types/nodeId'

/**
 * N21: Visualモード (v, V, Ctrl+v)
 * Teach×3 + Practice = 4ステージ
 */
export const N21_STAGES: Stage[] = [
  // ── Teach 1: v で文字選択して削除 ──
  // opt = 6 (f<(1)+v(0)+f>(1)+d(1) + f<(1)+v(0)+f>(1)+d(1)) → ☆3=6, ☆2=7, ☆1=9, life=12
  {
    id: 'visual-char',
    nodeId: NodeId.Visual,
    type: 'tutorial',
    title: '文字を選べ',
    language: 'html',
    initialText: 'Hello <World> and <Foo> end',
    goalText: 'Hello  and  end',
    initialCursor: { line: 0, col: 0 },
    life: 12,
    stars: [6, 7, 9],
    availableCommands: ['v', 'V', 'Ctrl+v', 'f', 't'],
    visualCommands: ['d'],
    hints: [{ cost: 1, commands: ['f<', 'v', 'f>', 'd', 'f<', 'v', 'f>', 'd'] }],
    flavor: 'v で選択開始。カーソルを動かして範囲を決め、d で消せ',
    newCommands: ['v'],
    tutorial: [
      {
        message: 'f< で < に移動',
        expectedKey: 'f<',
      },
      {
        message: 'v を押せ。文字単位の選択モードに入る',
        expectedKey: 'v',
      },
      {
        message: 'f> で > まで選択範囲を広げろ',
        expectedKey: 'f>',
      },
      {
        message: 'd で選択範囲を削除',
        expectedKey: 'd',
      },
      {
        message: 'v で文字選択 → f で範囲指定 → d で削除。残りの <Foo> も同じ要領で消せ',
        expectedKey: null,
      },
    ],
  },

  // ── Teach 2: V で行選択して削除 ──
  // opt = 4 (j(1)+V(0)+j(1)+d(1) + V(0)+d(1)) → ☆3=4, ☆2=5, ☆1=7, life=10
  {
    id: 'visual-line',
    nodeId: NodeId.Visual,
    type: 'tutorial',
    title: '行を選べ',
    language: 'javascript',
    initialText: 'keep\nremove A\nremove B\nremove C\nalso keep',
    goalText: 'keep\nalso keep',
    initialCursor: { line: 0, col: 0 },
    life: 10,
    stars: [4, 5, 7],
    availableCommands: ['V'],
    visualCommands: ['y', 'd', 'c'],
    hints: [{ cost: 1, commands: ['j', 'V', 'j', 'd', 'V', 'd'] }],
    flavor: 'V で行全体を選択。j/k で範囲を広げて d で消せ',
    newCommands: ['V'],
    tutorial: [
      {
        message: 'j で削除対象の行に移動',
        expectedKey: 'j',
      },
      {
        message: 'V を押せ。行全体が選択される',
        expectedKey: 'V',
      },
      {
        message: 'j でもう1行下まで選択を広げろ',
        expectedKey: 'j',
      },
      {
        message: 'd で選択した行を削除',
        expectedKey: 'd',
      },
      {
        message: 'V で行選択。残りの不要行も V+d で消せ',
        expectedKey: null,
      },
    ],
  },

  // ── Teach 3: Ctrl+v で矩形選択して削除 ──
  // opt = 6 (Ctrl+v(0)+j(1)+d(1) + jj(2)+Ctrl+v(0)+j(1)+d(1)) → ☆3=6, ☆2=7, ☆1=9, life=12
  {
    id: 'visual-block',
    nodeId: NodeId.Visual,
    type: 'tutorial',
    title: '矩形で切れ',
    language: 'plaintext',
    initialText: 'X hello\nX world\nX alpha\nX beta',
    goalText: ' hello\n world\n alpha\n beta',
    initialCursor: { line: 0, col: 0 },
    life: 12,
    stars: [6, 7, 9],
    availableCommands: ['Ctrl+v'],
    visualCommands: ['y', 'd', 'c'],
    hints: [{ cost: 1, commands: ['Ctrl+v', 'j', 'd', 'j', 'j', 'Ctrl+v', 'j', 'd'] }],
    flavor: 'Ctrl+v で矩形選択。縦1列をまとめて消せる',
    newCommands: ['Ctrl+v'],
    tutorial: [
      {
        message: 'Ctrl+v を押せ。矩形選択モードに入る',
        expectedKey: 'Ctrl+v',
      },
      {
        message: 'j で下に選択範囲を広げろ',
        expectedKey: 'j',
      },
      {
        message: 'd で選択範囲を削除',
        expectedKey: 'd',
      },
      {
        message: 'Ctrl+v で矩形選択 → j で範囲拡大 → d で削除。残りも同じ要領で消せ',
        expectedKey: null,
      },
    ],
  },

  // ── 🆕 Practice: Visual 総合 ──
  {
    id: 'visual-practice',
    nodeId: NodeId.Visual,
    type: 'practice' as const,
    title: 'Visual 総合',
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
]
