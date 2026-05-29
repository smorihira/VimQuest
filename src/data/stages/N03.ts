import type { Stage } from '../../types/stage'
import { NodeId } from '../../types/nodeId'

/**
 * mode: 1文字置換 (r)
 * 渇望→報酬サイクル #2: x+i → r 一発
 * Teach(T) = 1ステージ
 */
export const N03_STAGES: Stage[] = [
  // ── Teach: typo を直す (2行分) ──
  // opt = 4 (l + re + j + ro)
  {
    id: 'edit-replace',
    nodeId: NodeId.Edit,
    type: 'tutorial',
    title: '一文字直せ',
    language: 'plaintext',
    initialText: 'hallo\nwarld',
    goalText: 'hello\nworld',
    initialCursor: { line: 0, col: 0 },
    life: 10,
    stars: [4, 5, 7],
    availableCommands: ['x', 'X', 'i', 'a', 'I', 'A', 'o', 'O', 'r'],
    hints: [{ cost: 1, commands: ['l', 're', 'j', 'ro'] }],
    flavor: 'r で 1 文字だけ置換。x+i より速いぞ',
    newCommands: ['r'],
    tutorial: [
      {
        message: 'l で a の上にカーソルを移動しろ',
        expectedKey: 'l',
      },
      {
        message: 'r を押してから e と打て。1文字だけ入れ替える',
        expectedKey: 're',
      },
      {
        message: 'r は Insert に入らず1文字置換。2行目の typo も直せ',
        expectedKey: null,
      },
    ],
  },
]
