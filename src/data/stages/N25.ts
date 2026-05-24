import type { Stage } from '../../types/stage'

/**
 * N25: 大小文字変換 (gu, gU)
 * Teach(T) = 1ステージ
 */
export const N25_STAGES: Stage[] = [
  // ── Teach: gu / gU で大小文字変換 ──
  // opt = 5 (guiw + w + gUiw + w + guiw)
  {
    id: 'N25-T',
    nodeId: 'N25',
    type: 'teach',
    title: '大文字にしろ',
    language: 'javascript',
    initialText: 'HELLO world BYE',
    goalText: 'hello WORLD bye',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 6, 8],
    availableCommands: ['gu', 'gU', 'f', 't'],
    hints: [{ cost: 1, commands: ['guiw', 'w', 'gUiw', 'w', 'guiw'] }],
    flavor: 'gu で小文字、gU で大文字。TextObj と組み合わせろ',
  },
]
