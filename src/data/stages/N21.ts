import type { Stage } from '../../types/stage'

/**
 * N21: d+TextObj (diw, di", da()
 * ALL合流ノード: N25(delim) + N15(dw)
 * 渇望→報酬サイクル #6: v+移動+d → diw 一発
 * Teach(T) + Practice(P) = 2ステージ
 */
export const N21_STAGES: Stage[] = [
  // ── Teach: diw で単語をピンポイント削除 ──
  // opt = 2 (w + diw)
  {
    id: 'N21-T',
    nodeId: 'N21',
    type: 'teach',
    title: '精密除去',
    language: 'javascript',
    initialText: 'const temp = 42;',
    goalText: 'const  = 42;',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['dw', 'de', 'db', 'diw', 'f', 't'],
    hints: [{ cost: 1, commands: ['w', 'diw'] }],
    flavor: 'diw は単語だけを正確に消す。前後の空白は残る',
  },

  // ── Practice: 括弧内・引用符内の削除 ──
  // opt = 2 (f"+di")
  {
    id: 'N21-P',
    nodeId: 'N21',
    type: 'practice',
    title: '外科手術',
    language: 'javascript',
    initialText: 'alert("error: " + value);',
    goalText: 'alert("" + value);',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 4, 6],
    availableCommands: ['dw', 'de', 'db', 'diw', 'di"', 'f', 't'],
    hints: [{ cost: 1, commands: ['f"', 'di"'] }],
    flavor: '引用符の中身だけを di" で消せ。外側は残る',
  },
]
