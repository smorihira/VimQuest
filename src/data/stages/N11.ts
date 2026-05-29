import type { Stage } from '../../types/stage'
import { NodeId } from '../../types/nodeId'

/**
 * shortcut: ドットリピート (.)
 * Teach(T) のみ残存
 */
export const N11_STAGES: Stage[] = [
  // ── Teach: I で行頭挿入 → . で繰り返し ──
  // opt = 7 (I + '* ' + Esc + j + . + j + .)
  {
    id: 'edit-repeat',
    nodeId: NodeId.Edit,
    type: 'tutorial',
    title: 'リピートせよ',
    language: 'plaintext',
    initialText: 'apple\nbanana\ncherry',
    goalText: '* apple\n* banana\n* cherry',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 6, 8],
    availableCommands: [],
    hints: [{ cost: 1, commands: ['I', '* ', 'Esc', 'j', '.', 'j', '.'] }],
    flavor: 'I で行頭に挿入。. で同じ操作を次の行にも一発リピート',
    newCommands: ['.'],
    tutorial: [
      {
        message: 'I で行頭に移動し Insert モードに入れ',
        expectedKey: 'I',
      },
      {
        message: '* (アスタリスク+スペース) と打て',
        expectedKey: '*',
      },
      {
        message: 'スペースを打て',
        expectedKey: ' ',
      },
      {
        message: 'Esc で Normal に戻れ',
        expectedKey: 'Esc',
      },
      {
        message: 'j で次の行へ',
        expectedKey: 'j',
      },
      {
        message: '. を押せ。直前の I + "* " が一発で繰り返される',
        expectedKey: '.',
      },
      {
        message: '. は直前の変更操作を丸ごと繰り返す。Vim の奥義だ。j + . で最後の行も片付けろ',
        expectedKey: null,
      },
    ],
  },
]
