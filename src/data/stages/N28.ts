import type { Stage } from '../../types/stage'

/**
 * N28: 矩形選択 (Ctrl+v)
 * Teach(T) + Practice(P) = 2ステージ
 */
export const N28_STAGES: Stage[] = [
  // ── Teach: 矩形選択で列を削除 ──
  // ── Teach: 矩形選択で列削除 ──
  // opt = 3 (Ctrl+v(0)+j(1)+j(1)+d(1)) → ☆3=3, ☆2=4, ☆1=6, life=9
  {
    id: 'N28-T',
    nodeId: 'N28',
    type: 'teach',
    title: '矩形で切れ',
    language: 'plaintext',
    initialText: 'X hello\nX world\nX test',
    goalText: ' hello\n world\n test',
    initialCursor: { line: 0, col: 0 },
    life: 9,
    stars: [3, 4, 6],
    availableCommands: ['v', 'V', 'Ctrl+v'],
    visualCommands: ['d'],
    hints: [{ cost: 1, commands: ['Ctrl+v', 'j', 'j', 'd'] }],
    flavor: 'Ctrl+v で矩形選択。縦1列をまとめて消せる',
  },

  // ── Practice: 矩形選択で接頭辞を除去 ──
  // opt = 5 (Ctrl+v + jjj + ll + d)
  {
    id: 'N28-P',
    nodeId: 'N28',
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
