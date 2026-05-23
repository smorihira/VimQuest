import type { Stage } from '../../types/stage'

/**
 * N31: d+TextObj (diw, di", da()
 * ALL合流ノード: N30(delim) + N18(dw)
 * 渇望→報酬サイクル #6: v+移動+d → diw 一発
 * Teach(T) + Practice(P) = 2ステージ
 */
export const N31_STAGES: Stage[] = [
  // ── Teach: diw で単語をピンポイント削除 ──
  // opt = 2 (w + diw)
  {
    id: 'N31-T',
    nodeId: 'N31',
    type: 'teach',
    title: '精密除去',
    language: 'javascript',
    initialText: 'const temp = 42;',
    goalText: 'const  = 42;',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    baseCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', 'f', 't', '0', '$', 'x'],
    availableCommands: ['dw', 'de', 'db', 'diw', 'di"', 'da('],
    hints: [{ cost: 1, commands: ['w', 'diw'] }],
    flavor: 'diw は単語だけを正確に消す。前後の空白は残る',
  },

  // ── Practice: 括弧内・引用符内の削除 ──
  // opt = 4 (fv+diw, f"+di")
  {
    id: 'N31-P',
    nodeId: 'N31',
    type: 'practice',
    title: '外科手術',
    language: 'javascript',
    initialText: 'alert("error: " + value);',
    goalText: 'alert("" + value);',
    initialCursor: { line: 0, col: 0 },
    life: 10,
    stars: [4, 6, 8],
    baseCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', 'f', 't', '0', '$', 'x'],
    availableCommands: ['dw', 'de', 'db', 'diw', 'di"', 'da('],
    hints: [{ cost: 1, commands: ['f"', 'di"'] }],
    flavor: '引用符の中身だけを di" で消せ。外側は残る',
  },
]
