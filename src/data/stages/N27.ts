import type { Stage } from '../../types/stage'

/**
 * N27: Visualモード (v, V, Ctrl+v)
 * Teach×3 + Practice = 4ステージ
 */
export const N27_STAGES: Stage[] = [
  // ── Teach 1: v で文字選択して削除 ──
  // opt = 6 (f<(1)+v(0)+f>(1)+d(1) + f<(1)+v(0)+f>(1)+d(1)) → ☆3=6, ☆2=7, ☆1=9, life=12
  {
    id: 'N27-T',
    nodeId: 'N27',
    type: 'teach',
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
  },

  // ── Teach 2: V で行選択して削除 ──
  // opt = 4 (j(1)+V(0)+j(1)+d(1) + V(0)+d(1)) → ☆3=4, ☆2=5, ☆1=7, life=10
  {
    id: 'N27-Ta',
    nodeId: 'N27',
    type: 'teach',
    title: '行を選べ',
    language: 'javascript',
    initialText: 'keep\nremove A\nremove B\nremove C\nalso keep',
    goalText: 'keep\nalso keep',
    initialCursor: { line: 0, col: 0 },
    life: 10,
    stars: [4, 5, 7],
    availableCommands: ['v', 'V', 'Ctrl+v', 'f', 't'],
    visualCommands: ['d'],
    hints: [{ cost: 1, commands: ['j', 'V', 'j', 'd', 'V', 'd'] }],
    flavor: 'V で行全体を選択。j/k で範囲を広げて d で消せ',
  },

  // ── Teach 3: Ctrl+v で矩形選択して削除 ──
  // opt = 6 (Ctrl+v(0)+j(1)+d(1) + jj(2)+Ctrl+v(0)+j(1)+d(1)) → ☆3=6, ☆2=7, ☆1=9, life=12
  {
    id: 'N27-Tb',
    nodeId: 'N27',
    type: 'teach',
    title: '矩形で切れ',
    language: 'plaintext',
    initialText: 'X hello\nX world\nX alpha\nX beta',
    goalText: ' hello\n world\n alpha\n beta',
    initialCursor: { line: 0, col: 0 },
    life: 12,
    stars: [6, 7, 9],
    availableCommands: ['v', 'V', 'Ctrl+v'],
    visualCommands: ['d'],
    hints: [{ cost: 1, commands: ['Ctrl+v', 'j', 'd', 'j', 'j', 'Ctrl+v', 'j', 'd'] }],
    flavor: 'Ctrl+v で矩形選択。縦1列をまとめて消せる',
  },

  // ── Practice: 矩形選択で接頭辞を除去 ──
  // opt = 5 (Ctrl+v(0) + jjj(3) + l(1) + d(1))
  {
    id: 'N27-P',
    nodeId: 'N27',
    type: 'practice',
    title: '列を消せ',
    language: 'plaintext',
    initialText: '-- alpha\n-- beta\n-- gamma\n-- delta',
    goalText: ' alpha\n beta\n gamma\n delta',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 7, 9],
    availableCommands: ['v', 'V', 'Ctrl+v'],
    visualCommands: ['d'],
    hints: [{ cost: 1, commands: ['Ctrl+v', 'j', 'j', 'j', 'l', 'd'] }],
    flavor: '全行の -- を矩形選択で一括削除せよ',
  },
]
