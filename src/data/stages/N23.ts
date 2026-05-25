import type { Stage } from '../../types/stage'

/**
 * N23: 変更ショート (s, S, C)
 * s = cl, S = cc, C = c$
 * Teach(T) = 1ステージ
 */
export const N23_STAGES: Stage[] = [
  // ── Teach: s/S/C を体験（3行） ──
  // opt = 4 (自力: j+f=+l+C…good;…Esc) → ☆3=4, ☆2=5, ☆1=7, life=10
  {
    id: 'N23-T',
    nodeId: 'N23',
    type: 'teach',
    title: 'ショートカット',
    language: 'javascript',
    initialText: 'let x = 0;\nold line;\nlet z = bad;',
    goalText: 'let y = 0;\nnew code;\nlet z = good;',
    initialCursor: { line: 0, col: 4 },
    life: 10,
    stars: [4, 5, 7],
    availableCommands: ['ciw', 'S', 'C', 'f', 't'],
    hints: [
      {
        cost: 1,
        commands: [
          's',
          'y',
          'Esc',
          'j',
          'S',
          'new code;',
          'Esc',
          'j',
          'f=',
          'l',
          'C',
          'good;',
          'Esc',
        ],
      },
    ],
    flavor: 's は1文字、S は行全体、C は行末まで変更するショートカットだ',
  },
]
