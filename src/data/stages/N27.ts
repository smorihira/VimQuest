import type { Stage } from '../../types/stage'

/**
 * N27: Visualモード (v, V)
 * Teach(T) + Practice(P) = 2ステージ
 */
export const N27_STAGES: Stage[] = [
  // ── Teach: V で行選択して削除 ──
  // opt = 2 (j + Vd)
  {
    id: 'N27-T',
    nodeId: 'N27',
    type: 'teach',
    title: '選んで消せ',
    language: 'javascript',
    initialText: 'keep this\nremove this\nkeep this too',
    goalText: 'keep this\nkeep this too',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['v', 'V', 'f', 't'],
    visualCommands: ['d'],
    hints: [{ cost: 1, commands: ['j', 'V', 'd'] }],
    flavor: 'V で行を選択、d で削除。Visual モードの基本だ',
  },

  // ── Practice: v で範囲選択して削除 ──
  // opt = 3 (f<+v(free)+f>+d)
  {
    id: 'N27-P',
    nodeId: 'N27',
    type: 'practice',
    title: '範囲狙撃',
    language: 'html',
    initialText: 'Hello <World> end',
    goalText: 'Hello  end',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 5, 7],
    availableCommands: ['v', 'V', 'f', 't'],
    visualCommands: ['d'],
    hints: [{ cost: 1, commands: ['f<', 'v', 'f>', 'd'] }],
    flavor: 'v で選択開始し、f でタグの終わりまで選択して d で消せ',
  },
]
