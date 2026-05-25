import type { Stage } from '../../types/stage'

/**
 * N30: ペースト (p, P)
 * Teach(T) = 1ステージ
 */
export const N30_STAGES: Stage[] = [
  // ── Teach: p/P の違いを体験（4行並び替え） ──
  // opt = 4 (自力: j+j+dd+p) → ☆3=4, ☆2=5, ☆1=7, life=10
  {
    id: 'N30-T',
    nodeId: 'N30',
    type: 'teach',
    title: '並び替えろ',
    language: 'plaintext',
    initialText: 'B\nA\nD\nC',
    goalText: 'A\nB\nC\nD',
    initialCursor: { line: 0, col: 0 },
    life: 10,
    stars: [4, 5, 7],
    availableCommands: ['y', 'yy', 'dd', 'p', 'P'],
    hints: [{ cost: 1, commands: ['j', 'dd', 'P', 'j', 'j', 'dd', 'p'] }],
    flavor: 'dd で切り取り、P は上、p は下にペースト。使い分けろ',
  },
]
