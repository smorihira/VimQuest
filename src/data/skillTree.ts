/**
 * Skill tree node definitions — static data for all 22 nodes.
 */

import type { SkillNodeDef, SkillTreeEdge } from '../types/game'

export const SKILL_NODES: SkillNodeDef[] = [
  {
    id: 'N01',
    name: '基礎訓練',
    commands: [
      'h',
      'j',
      'k',
      'l',
      'w',
      'b',
      'e',
      'W',
      'B',
      'E',
      '0',
      '^',
      '$',
      'gg',
      'G',
      'x',
      'i',
      'a',
      's',
    ],
    stageCount: 10,
    prerequisites: [],
  },
  {
    id: 'N02',
    name: 'Insertバリエーション',
    commands: ['I', 'A', 'o', 'O', 'gi'],
    stageCount: 2,
    prerequisites: ['N01'],
  },
  { id: 'N03', name: '1文字置換', commands: ['r', 'R'], stageCount: 1, prerequisites: ['N01'] },
  {
    id: 'N04',
    name: 'スクロール＆ジャンプ',
    commands: ['Ctrl+d', 'Ctrl+u', 'Ctrl+o', 'Ctrl+i'],
    stageCount: 1,
    prerequisites: ['N01'],
  },
  {
    id: 'N05',
    name: '画面位置操作',
    commands: ['zz', 'zt', 'zb', 'H', 'M', 'L', 'Ctrl+e', 'Ctrl+y'],
    stageCount: 1,
    prerequisites: ['N04'],
  },
  {
    id: 'N06',
    name: '検索',
    commands: ['/', 'n', 'N', '*', '#'],
    stageCount: 3,
    prerequisites: ['N04'],
  },
  {
    id: 'N07',
    name: 'dオペレータ',
    commands: ['dw', 'de', 'db', 'dd', 'd$', 'd0'],
    stageCount: 5,
    prerequisites: ['N01'],
  },
  {
    id: 'N08',
    name: 'cオペレータ',
    commands: ['cw', 'ce', 'cb', 'cc', 'c$', 'c0'],
    stageCount: 0,
    prerequisites: ['N07'],
  },
  {
    id: 'N09',
    name: '行操作ショートカット',
    commands: ['D', 'C', 'S', 'Y', 'J'],
    stageCount: 3,
    prerequisites: ['N07'],
  },
  {
    id: 'N10',
    name: 'ドットリピート',
    commands: ['.'],
    stageCount: 3,
    prerequisites: ['N09', 'N02'],
  },
  {
    id: 'N11',
    name: '行内ジャンプ',
    commands: ['f', 't', ';', ','],
    stageCount: 3,
    prerequisites: ['N01'],
  },
  {
    id: 'N12',
    name: '構造ジャンプ',
    commands: ['%', '{', '}'],
    stageCount: 1,
    prerequisites: ['N11'],
  },
  {
    id: 'N13',
    name: 'operator+f/t',
    commands: ['df', 'dt', 'cf', 'ct'],
    stageCount: 3,
    prerequisites: ['N11', 'N07'],
  },
  {
    id: 'N14',
    name: '数値操作',
    commands: ['Ctrl+a', 'Ctrl+x'],
    stageCount: 0,
    prerequisites: ['N01'],
  },
  {
    id: 'N15',
    name: '単語TextObj',
    commands: ['iw', 'aw'],
    stageCount: 2,
    prerequisites: ['N13'],
  },
  {
    id: 'N16',
    name: 'デリミタTextObj',
    commands: ['i"', 'a"', "i'", "a'", 'i(', 'a(', 'i{', 'a{', 'i[', 'a[', 'i<', 'a<', 'it', 'at'],
    stageCount: 2,
    prerequisites: ['N15'],
  },
  {
    id: 'N17',
    name: 'operator+TextObj',
    commands: ['diw', 'daw', 'ciw', 'caw', 'di"', 'ci"', 'da(', 'ca('],
    stageCount: 5,
    prerequisites: ['N16', 'N07'],
  },
  {
    id: 'N18',
    name: '大小文字操作',
    commands: ['~', 'gu', 'gU'],
    stageCount: 2,
    prerequisites: ['N17'],
  },
  { id: 'N19', name: 'インデント', commands: ['>>', '<<'], stageCount: 1, prerequisites: ['N17'] },
  {
    id: 'N20',
    name: 'Visualモード',
    commands: ['v', 'V', 'Ctrl+v', 'o', 'gv'],
    stageCount: 4,
    prerequisites: ['N17'],
  },
  {
    id: 'N21',
    name: 'ヤンク＆ペースト',
    commands: ['y', 'yy', 'yw', 'ye', 'y$', 'p', 'P'],
    stageCount: 3,
    prerequisites: ['N20'],
  },
  {
    id: 'N22',
    name: 'レジスタ',
    commands: ['"a', '"0'],
    stageCount: 2,
    prerequisites: ['N21', 'N02'],
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
