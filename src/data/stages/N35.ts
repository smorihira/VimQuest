import type { Stage } from '../../types/stage'

/**
 * N35: 大小文字変換 (gu, gU)
 * Teach(T) = 1ステージ
 */
export const N35_STAGES: Stage[] = [
  // ── Teach: gU + TextObj で大文字化 ──
  // opt = 2 (w + gUiw)
  {
    id: 'N35-T',
    nodeId: 'N35',
    type: 'teach',
    title: '大文字にしろ',
    language: 'javascript',
    initialText: 'const max_size = 100;',
    goalText: 'const MAX_SIZE = 100;',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['diw', 'di"', 'gu', 'gU', 'f', 't'],
    hints: [{ cost: 1, commands: ['w', 'gUiw'] }],
    flavor: 'gU + TextObj で単語を大文字に変換できる',
  },
]
