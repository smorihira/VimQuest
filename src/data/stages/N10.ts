import type { Stage } from '../../types/stage'

/**
 * N10: ドットリピート (.)
 * ★★★ 最高峰ノード — Vim の真髄
 * 渇望→報酬サイクル #5: 手動繰り返し → . 一発
 * Teach(T) + Practice(P) + Challenge(C) = 3ステージ
 */
export const N10_STAGES: Stage[] = [
  // ── Teach: I で行頭挿入 → . で繰り返し ──
  // opt = 7 (I + '* ' + Esc + j + . + j + .)
  {
    id: 'N10-T',
    nodeId: 'N10',
    type: 'teach',
    title: 'リピートせよ',
    language: 'plaintext',
    initialText: 'apple\nbanana\ncherry',
    goalText: '* apple\n* banana\n* cherry',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 6, 8],
    availableCommands: ['I', 'A', '.'],
    hints: [{ cost: 1, commands: ['I', '* ', 'Esc', 'j', '.', 'j', '.'] }],
    flavor: 'I で行頭に挿入。. で同じ操作を次の行にも一発リピート',
  },

  // ── Practice: A で行末追加 → . で繰り返し ──
  // opt = 7 (A + ';' + Esc + j + . + j + .)
  {
    id: 'N10-P',
    nodeId: 'N10',
    type: 'practice',
    title: '一括追加',
    language: 'css',
    initialText: 'width: 100px\nheight: 50px\ncolor: red',
    goalText: 'width: 100px;\nheight: 50px;\ncolor: red;',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 7, 9],
    availableCommands: ['I', 'A', '.'],
    hints: [{ cost: 1, commands: ['A', ';', 'Esc', 'j', '.', 'j', '.'] }],
    flavor: 'A で行末にセミコロンを追加、. で残りも一発だ',
  },

  // ── Challenge: dd + . でデバッグ行を一掃 ──
  // opt = 7 (dd + j + . + j + . + j + .)
  {
    id: 'N10-C',
    nodeId: 'N10',
    type: 'challenge',
    title: 'デバッグ一掃',
    language: 'javascript',
    initialText:
      '// debug\n' +
      'const a = 1;\n' +
      '// debug\n' +
      'const b = 2;\n' +
      '// debug\n' +
      'const c = 3;\n' +
      '// debug',
    goalText: 'const a = 1;\nconst b = 2;\nconst c = 3;',
    initialCursor: { line: 0, col: 0 },
    life: 15,
    stars: [7, 10, 13],
    availableCommands: ['dd', '.'],
    hints: [{ cost: 1, commands: ['dd', 'j', '.', 'j', '.', 'j', '.'] }],
    flavor: 'dd でデバッグ行を消し、j で飛ばして . で繰り返せ',
  },
]
