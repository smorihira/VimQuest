import type { Stage } from '../../types/stage'

/**
 * N32: 矩形選択 (Ctrl+v)
 * Teach(T) + Practice(P) = 2ステージ
 */
export const N32_STAGES: Stage[] = [
  // ── Teach: 矩形選択で列を削除 ──
  // opt = 3 (Ctrl+v + jj + d)
  {
    id: 'N32-T',
    nodeId: 'N32',
    type: 'teach',
    title: '矩形で切れ',
    language: 'plaintext',
    initialText: 'X hello\nX world\nX test',
    goalText: ' hello\n world\n test',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['v', 'V', 'Ctrl+v', '0', '$'],
    visualCommands: ['d'],
    hints: [{ cost: 1, commands: ['Ctrl+v', 'j', 'j', 'd'] }],
    flavor: 'Ctrl+v で矩形選択。縦1列をまとめて消せる',
  },

  // ── Practice: 矩形選択で接頭辞を除去 ──
  // opt = 5 (Ctrl+v + jjj + ll + d)
  {
    id: 'N32-P',
    nodeId: 'N32',
    type: 'practice',
    title: '列を消せ',
    language: 'plaintext',
    initialText: '-- alpha\n-- beta\n-- gamma\n-- delta',
    goalText: ' alpha\n beta\n gamma\n delta',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 7, 9],
    availableCommands: ['v', 'V', 'Ctrl+v', '0', '$'],
    visualCommands: ['d'],
    hints: [{ cost: 1, commands: ['Ctrl+v', 'j', 'j', 'j', 'l', 'd'] }],
    flavor: '全行の -- を矩形選択で一括削除せよ',
  },
]
