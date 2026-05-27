import type { Stage } from '../../types/stage'

/**
 * N11: ドットリピート (.)
 * ★★★ 最高峰ノード — Vim の真髄
 * 渇望→報酬サイクル #5: 手動繰り返し → . 一発
 * Teach(T) + Practice(P) + Challenge(C) = 3ステージ
 */
export const N11_STAGES: Stage[] = [
  // ── Teach: I で行頭挿入 → . で繰り返し ──
  // opt = 7 (I + '* ' + Esc + j + . + j + .)
  {
    id: 'N11-T',
    nodeId: 'N02',
    type: 'teach',
    title: 'リピートせよ',
    language: 'plaintext',
    initialText: 'apple\nbanana\ncherry',
    goalText: '* apple\n* banana\n* cherry',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 6, 8],
    availableCommands: ['I', 'A'],
    hints: [{ cost: 1, commands: ['I', '* ', 'Esc', 'j', '.', 'j', '.'] }],
    flavor: 'I で行頭に挿入。. で同じ操作を次の行にも一発リピート',
  },

  // ── Practice: A で行末追加 → . で繰り返し ──
  // opt = 7 (A + ';' + Esc + j + . + j + .)
  {
    id: 'N11-P',
    nodeId: 'N02',
    type: 'practice',
    title: '一括追加',
    language: 'css',
    initialText: 'width: 100px\nheight: 50px\ncolor: red',
    goalText: 'width: 100px;\nheight: 50px;\ncolor: red;',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 7, 9],
    availableCommands: ['I', 'A'],
    hints: [{ cost: 1, commands: ['A', ';', 'Esc', 'j', '.', 'j', '.'] }],
    flavor: 'A で行末にセミコロンを追加、. で残りも一発だ',
  },

  // ── N07 Teach: dd で行削除 ──
  // opt = 1 (dd)
  {
    id: 'N11-Ta',
    nodeId: 'N07',
    type: 'teach',
    title: 'dd で行削除',
    language: 'plaintext',
    initialText: 'keep this\ndelete me\nkeep this too',
    goalText: 'keep this\nkeep this too',
    initialCursor: { line: 1, col: 0 },
    life: 7,
    stars: [1, 2, 4],
    availableCommands: ['dd'],
    hints: [{ cost: 1, commands: ['dd'] }],
    flavor: 'dd は行ごと削除する。カーソルのある行が丸ごと消える',
  },

  // ── N07 Teach: cc で行書き換え ──
  // opt = 1: cc(0) + "new"+Esc(insertSession(3)=1)
  {
    id: 'N11-Tb',
    nodeId: 'N07',
    type: 'teach',
    title: 'cc で行書き換え',
    language: 'plaintext',
    initialText: 'hello\nold\nworld',
    goalText: 'hello\nnew\nworld',
    initialCursor: { line: 1, col: 0 },
    life: 7,
    stars: [1, 2, 4],
    availableCommands: ['cc'],
    hints: [{ cost: 1, commands: ['cc', 'new', 'Esc'] }],
    flavor: 'cc は行を消して入力モードに入る。一行丸ごと書き換えよう',
  },

  // ── N07 Practice: dd + . で不要行を連続削除 ──
  // opt = 5: dd(1) + j(1) + .(1) + j(1) + .(1)
  {
    id: 'N11-Tc',
    nodeId: 'N07',
    type: 'practice',
    title: '不要行の削除',
    language: 'plaintext',
    initialText: 'line 1\nDEL\nline 3\nDEL\nline 5\nDEL\nline 7',
    goalText: 'line 1\nline 3\nline 5\nline 7',
    initialCursor: { line: 1, col: 0 },
    life: 11,
    stars: [5, 7, 9],
    availableCommands: ['dd'],
    hints: [{ cost: 1, commands: ['dd', 'j', '.', 'j', '.'] }],
    flavor: 'dd で消して j で飛ばし . で繰り返す。リズムをつかめ',
  },

  // ── Challenge: dd + . でデバッグ行を一掃 ──
  // opt = 7 (dd + j + . + j + . + j + .)
  {
    id: 'N11-C',
    nodeId: 'N07',
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
    availableCommands: ['dd'],
    hints: [{ cost: 1, commands: ['dd', 'j', '.', 'j', '.', 'j', '.'] }],
    flavor: 'dd でデバッグ行を消し、j で飛ばして . で繰り返せ',
  },
]
