import type { Stage } from '../../types/stage'

/**
 * N12: ファイル移動 (gg, G)
 * Teach(T) = 1ステージ
 */
export const N12_STAGES: Stage[] = [
  // ── Teach: ファイル末尾へジャンプ ──
  // opt = 1 (G) → cursor at last line
  {
    id: 'N12-T',
    nodeId: 'N12',
    type: 'teach',
    title: '末尾へ飛べ',
    language: 'javascript',
    initialText: 'line 1\nline 2\nline 3\nline 4\n// ERROR: fix here',
    goalText: 'line 1\nline 2\nline 3\nline 4\n// ERROR: fix here',
    initialCursor: { line: 0, col: 0 },
    life: 7,
    stars: [1, 2, 4],
    availableCommands: ['gg', 'G', '0', '$'],
    clearConditions: { cursor: { line: 4, col: 0 } },
    hints: [{ cost: 1, commands: ['G'] }],
    flavor: 'G でファイル末尾に一気にジャンプだ',
  },
]
