/**
 * Skill tree node definitions — static data for all 17 nodes.
 *
 * Design doc: docs/reviews/NODE-REDESIGN-V2.md
 *
 * Dependency graph:
 *   N01→N02→N03→N04 (一本道: motion→編集→モード→検索)
 *     ├→ N15 数値操作
 *     ├→ N16 スクロール+マーク → N17 画面操作
 *     └→ N05→N06→N07→N08 (一本道: operator→TextObj→行単位→Visual)
 *                       ├→ N09 Visual応用
 *                       ├→ N10 レジスタ
 *                       ├→ N11 ショートカット
 *                       ├→ N12 構造ジャンプ
 *                       ├→ N13 発展オペレータ
 *                       └→ N14 その他モーション
 */

import type { SkillNodeDef, SkillTreeEdge } from '../types/game'

export const SKILL_NODES: SkillNodeDef[] = [
  {
    id: 'N01',
    name: 'モーション基礎',
    commands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '^', '$', 'gg', 'G', 'f', 't', ';', ','],
    stageCount: 9,
    prerequisites: [],
  },
  {
    id: 'N02',
    name: '編集基礎',
    commands: ['x', 'X', 'r', 'i', 'a', 'I', 'A', 'o', 'O'],
    stageCount: 7,
    prerequisites: ['N01'],
  },
  {
    id: 'N03',
    name: 'モード概念',
    commands: ['v', 'R'],
    stageCount: 3,
    prerequisites: ['N02'],
  },
  {
    id: 'N04',
    name: '検索',
    commands: ['/', '?', 'n', 'N', '*', '#'],
    stageCount: 3,
    prerequisites: ['N03'],
  },
  {
    id: 'N05',
    name: 'オペレータ基礎',
    commands: [
      'dw',
      'de',
      'db',
      'd$',
      'd0',
      'cw',
      'ce',
      'cb',
      'c$',
      'c0',
      'yw',
      'ye',
      'yb',
      'y$',
      'y0',
      'df',
      'dt',
      'cf',
      'ct',
      'yf',
      'yt',
      'p',
      'P',
    ],
    stageCount: 16,
    prerequisites: ['N04'],
  },
  {
    id: 'N06',
    name: 'TextObj',
    commands: [
      'iw',
      'aw',
      'is',
      'as',
      'ip',
      'ap',
      'i"',
      'a"',
      "i'",
      "a'",
      'i(',
      'a(',
      'i{',
      'a{',
      'i[',
      'a[',
      'i<',
      'a<',
      'diw',
      'daw',
      'ciw',
      'caw',
      'yiw',
      'yaw',
      'di"',
      'ci"',
      'da(',
      'ca(',
    ],
    stageCount: 9,
    prerequisites: ['N05'],
  },
  {
    id: 'N07',
    name: '行単位操作',
    commands: ['dd', 'cc', 'yy'],
    stageCount: 1,
    prerequisites: ['N06'],
  },
  {
    id: 'N08',
    name: 'Visual基礎',
    commands: ['v', 'V', 'Ctrl+v', 'o'],
    stageCount: 4,
    prerequisites: ['N07'],
  },
  {
    id: 'N09',
    name: 'Visual応用',
    commands: ['gn'],
    stageCount: 2,
    prerequisites: ['N08'],
  },
  {
    id: 'N10',
    name: 'レジスタ',
    commands: ['"a', '"0', '"+'],
    stageCount: 2,
    prerequisites: ['N08'],
  },
  {
    id: 'N11',
    name: 'ショートカット',
    commands: ['D', 'C', 'Y', 'S', 's', 'J'],
    stageCount: 4,
    prerequisites: ['N08'],
  },
  {
    id: 'N12',
    name: '発展モーション（構造ジャンプ）',
    commands: ['%', '(', ')', '{', '}', '[[', ']]'],
    stageCount: 1,
    prerequisites: ['N08'],
  },
  {
    id: 'N13',
    name: '発展オペレータ',
    commands: ['>>', '<<', 'gu', 'gU', 'g~', '~'],
    stageCount: 3,
    prerequisites: ['N08'],
  },
  {
    id: 'N14',
    name: '発展モーション（その他）',
    commands: ['W', 'B', 'E', 'F', 'T', 'H', 'M', 'L'],
    stageCount: 1,
    prerequisites: ['N08'],
  },
  {
    id: 'N15',
    name: '数値操作',
    commands: ['Ctrl+a', 'Ctrl+x'],
    stageCount: 3,
    prerequisites: ['N04'],
  },
  {
    id: 'N16',
    name: 'スクロール＋マーク',
    commands: ['Ctrl+d', 'Ctrl+u', 'Ctrl+f', 'Ctrl+b', 'm', "'", '`', 'gi'],
    stageCount: 1,
    prerequisites: ['N04'],
  },
  {
    id: 'N17',
    name: '画面操作',
    commands: ['zz', 'zt', 'zb', 'Ctrl+e', 'Ctrl+y'],
    stageCount: 1,
    prerequisites: ['N16'],
  },
]

/** All edges derived from prerequisites */
export const SKILL_EDGES: SkillTreeEdge[] = SKILL_NODES.flatMap((node) =>
  node.prerequisites.map((prereq: string) => ({ source: prereq, target: node.id })),
)

/** Node lookup by ID */
export const SKILL_NODE_MAP: Record<string, SkillNodeDef> = Object.fromEntries(
  SKILL_NODES.map((n) => [n.id, n]),
)

/** Get node by ID */
export function getSkillNode(id: string): SkillNodeDef | undefined {
  return SKILL_NODE_MAP[id]
}
