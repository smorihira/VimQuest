import type { Stage } from '../../types/stage'

/**
 * N6: 半ページ移動 (Ctrl+d, Ctrl+u)
 * Teach(T) = 1ステージ
 */
export const N04_STAGES: Stage[] = [
  // ── Teach: 半ページジャンプ ──
  // opt = 2 (Ctrl+d + Ctrl+d)
  {
    id: 'N04-T',
    nodeId: 'N04',
    type: 'teach',
    title: 'ページを飛べ',
    language: 'javascript',
    initialText:
      'function setup() {\n' +
      '  const a = 1;\n' +
      '  const b = 2;\n' +
      '  const c = 3;\n' +
      '  const d = 4;\n' +
      '  const e = 5;\n' +
      '  const f = 6;\n' +
      '  const g = 7;\n' +
      '  const h = 8;\n' +
      '  const i = 9;\n' +
      '  const j = 10;\n' +
      '  const k = 11;\n' +
      '  const l = 12;\n' +
      '  const m = 13;\n' +
      '  const n = 14;\n' +
      '  const o = 15;\n' +
      '  const p = 16;\n' +
      '  const q = 17;\n' +
      '  const r = 18;\n' +
      '  const s = 19;\n' +
      '  const t = 20;\n' +
      '  return [a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t];\n' +
      '}',
    goalText:
      'function setup() {\n' +
      '  const a = 1;\n' +
      '  const b = 2;\n' +
      '  const c = 3;\n' +
      '  const d = 4;\n' +
      '  const e = 5;\n' +
      '  const f = 6;\n' +
      '  const g = 7;\n' +
      '  const h = 8;\n' +
      '  const i = 9;\n' +
      '  const j = 10;\n' +
      '  const k = 11;\n' +
      '  const l = 12;\n' +
      '  const m = 13;\n' +
      '  const n = 14;\n' +
      '  const o = 15;\n' +
      '  const p = 16;\n' +
      '  const q = 17;\n' +
      '  const r = 18;\n' +
      '  const s = 19;\n' +
      '  const t = 20;\n' +
      '  return [a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t];\n' +
      '}',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['Ctrl+d', 'Ctrl+u'],
    clearConditions: { cursor: { line: 16, col: 0 } },
    hints: [{ cost: 1, commands: ['Ctrl+d', 'Ctrl+d'] }],
    flavor: 'j 連打より Ctrl+d で半ページ分ジャンプだ',
  },
]
