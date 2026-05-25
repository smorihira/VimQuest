import type { Stage } from '../../types/stage'

/**
 * N08: dオペレータ (dw, de, db, dd, d$, d0)
 */
export const N08_STAGES: Stage[] = [
  // ── Teach: dw/de の違いを体験 ──
  // opt = 2 (自力: dw×2) → ☆3=2, ☆2=3, ☆1=5, life=8
  {
    id: 'N08-T',
    nodeId: 'N08',
    type: 'teach',
    title: '単語を消せ',
    language: 'plaintext',
    initialText: 'delete this ugly old word',
    goalText: 'delete word',
    initialCursor: { line: 0, col: 0 },
    life: 10,
    stars: [4, 5, 7],
    availableCommands: ['dw', 'de', 'db'],
    hints: [{ cost: 1, commands: ['w', 'dw', 'dw', 'dw'] }],
    flavor: '不要な単語を dw で消せ',
  },

  // ── Practice: 複数単語を効率的に消す ──
  // opt = 4 (wdwwdw等) → ☆3=4, ☆2=6, ☆1=8, life=10
  {
    id: 'N08-P',
    nodeId: 'N08',
    type: 'practice',
    title: '連続削除',
    language: 'javascript',
    initialText: 'const very extremely important value = 42',
    goalText: 'const value = 42',
    initialCursor: { line: 0, col: 0 },
    life: 10,
    stars: [4, 6, 8],
    availableCommands: ['dw', 'de', 'db'],
    hints: [{ cost: 1, commands: ['w', 'dw', 'dw', 'dw'] }],
    flavor: '余計な修飾語を dw で消し去れ',
  },

  // ── Challenge: 複数行で dw/de/db を使い分け ──
  // opt = 5 → ☆3=5, ☆2=8, ☆1=11, life=13
  {
    id: 'N08-C',
    nodeId: 'N08',
    type: 'challenge',
    title: '精密削除',
    language: 'css',
    initialText: 'body {\n  color: dark red;\n  background: light blue;\n}',
    goalText: 'body {\n  color: red;\n  background: blue;\n}',
    initialCursor: { line: 0, col: 0 },
    life: 18,
    stars: [10, 13, 16],
    availableCommands: ['dw', 'de', 'db'],
    hints: [{ cost: 1, commands: ['j', 'w', 'w', 'w', 'dw', 'j', 'b', 'w', 'w', 'dw'] }],
    flavor: 'dark と light の接頭辞だけを正確に削れ',
  },
  // ── Teach: 不要な行を削除 (2本) ──
  // opt = 4 (j + dd + j + dd)
  {
    id: 'N08-Ta',
    nodeId: 'N08',
    type: 'teach',
    title: '行を消せ',
    language: 'javascript',
    initialText:
      'const a = 1;\n' +
      'console.log("debug1");\n' +
      'const b = 2;\n' +
      'console.log("debug2");\n' +
      'const c = 3;',
    goalText: 'const a = 1;\nconst b = 2;\nconst c = 3;',
    initialCursor: { line: 0, col: 0 },
    life: 10,
    stars: [4, 5, 7],
    availableCommands: ['dd'],
    hints: [{ cost: 1, commands: ['j', 'dd', 'j', 'dd'] }],
    flavor: 'デバッグ行をまるごと消せ。dd で一行削除だ',
  },
  // ── Teach: 行末まで削除 ──
  // opt = 3 (e + l + d$)
  // ── Teach: d0 と d$ の両方を体験 ──
  // opt = 3 (自力: w+l+d$) → ☆3=3, ☆2=4, ☆1=6, life=9
  {
    id: 'N08-Tb',
    nodeId: 'N08',
    type: 'teach',
    title: '末尾を切れ',
    language: 'javascript',
    initialText: '// temp value; // hack',
    goalText: 'value;',
    initialCursor: { line: 0, col: 8 },
    life: 10,
    stars: [4, 5, 7],
    availableCommands: ['dd', 'd$', 'd0'],
    hints: [{ cost: 1, commands: ['d0', 'w', 'l', 'd$'] }],
    flavor: 'd0 で行頭まで、d$ で行末まで一気に削除せよ',
  },
]
