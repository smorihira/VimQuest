import type { Stage } from '../../types/stage'

/**
 * N17: d+f/t (df, dt)
 * ALL合流ノード: N20(f/t) + N15(dw)
 * Teach(T) = 1ステージ
 */
export const N17_STAGES: Stage[] = [
  // ── Teach: dt で指定文字の手前まで削除（2箇所修正） ──
  // opt = 2 (自力: w+dt2) → ☆3=2, ☆2=3, ☆1=5, life=8
  {
    id: 'N17-T',
    nodeId: 'N17',
    type: 'teach',
    title: '範囲を断て',
    language: 'css',
    initialText: 'padding: 0px10px 0px20px;',
    goalText: 'padding: 10px 20px;',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 6, 8],
    availableCommands: ['dw', 'de', 'db', 'df', 'dt', 'f', 't'],
    hints: [{ cost: 1, commands: ['w', 'w', 'dt1', 'w', 'dt2'] }],
    flavor: 'dt で指定文字の手前まで削除。余分な部分だけ消せ',
  },
]
