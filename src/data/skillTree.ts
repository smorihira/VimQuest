/**
 * Skill tree node definitions — static data for all 17 nodes.
 *
 * Design doc: docs/reviews/NODE-REDESIGN-V2.md
 *
 * Dependency graph:
 *   motion→edit→mode→search (一本道: モーション→編集→モード→検索)
 *     ├→ number 数値操作
 *     ├→ scroll-mark スクロール+マーク → screen 画面操作
 *     └→ operator→textobj→linewise→visual (一本道: オペレータ→TextObj→行単位→Visual)
 *                       ├→ visual-adv Visual応用
 *                       ├→ register レジスタ
 *                       ├→ shortcut ショートカット
 *                       ├→ struct-jump 構造ジャンプ
 *                       ├→ operator-adv 発展オペレータ
 *                       └→ motion-adv その他モーション
 */

import type { SkillNodeDef, SkillTreeEdge } from '../types/game'
import { NodeId } from '../types/nodeId'

export const SKILL_NODES: SkillNodeDef[] = [
  {
    id: NodeId.Motion,
    name: 'モーション基礎',
    commands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '^', '$', 'gg', 'G', 'f', 't', ';', ','],
    stageCount: 7,
    prerequisites: [],
  },
  {
    id: NodeId.Edit,
    name: '編集基礎',
    commands: ['x', 'X', 'r', 'i', 'a', 'I', 'A', 'o', 'O'],
    stageCount: 7,
    prerequisites: [NodeId.Motion],
  },
  {
    id: NodeId.Mode,
    name: 'モード概念',
    commands: ['v', 'R', ':s'],
    stageCount: 4,
    prerequisites: [NodeId.Edit],
  },
  {
    id: NodeId.Search,
    name: '検索',
    commands: ['/', '?', 'n', 'N', '*', '#'],
    stageCount: 3,
    prerequisites: [NodeId.Mode],
  },
  {
    id: NodeId.Operator,
    name: 'オペレータ基礎',
    commands: ['d', 'c', 'y', 'p', 'P'],
    stageCount: 4,
    prerequisites: [NodeId.Search],
  },
  {
    id: NodeId.TextObj,
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
    ],
    stageCount: 3,
    prerequisites: [NodeId.Operator],
  },
  {
    id: NodeId.Linewise,
    name: '行単位操作',
    commands: ['dd', 'cc', 'yy'],
    stageCount: 2,
    prerequisites: [NodeId.TextObj],
  },
  {
    id: NodeId.Visual,
    name: 'Visual基礎',
    commands: ['v', 'V', 'Ctrl+v', 'o'],
    stageCount: 4,
    prerequisites: [NodeId.Linewise],
  },
  {
    id: NodeId.VisualAdv,
    name: 'Visual応用',
    commands: ['o', 'O', 'gv', 'gn', 'gN'],
    stageCount: 5,
    prerequisites: [NodeId.Visual],
  },
  {
    id: NodeId.Register,
    name: 'レジスタ',
    commands: ['"', '+'],
    stageCount: 3,
    prerequisites: [NodeId.Visual],
  },
  {
    id: NodeId.Shortcut,
    name: 'ショートカット',
    commands: ['D', 'C', 'Y', 'S', 's', 'J'],
    stageCount: 4,
    prerequisites: [NodeId.Visual],
  },
  {
    id: NodeId.StructJump,
    name: '発展モーション（構造ジャンプ）',
    commands: ['%', '(', ')', '{', '}', '[[', ']]'],
    stageCount: 3,
    prerequisites: [NodeId.Visual],
  },
  {
    id: NodeId.MotionAdv,
    name: '発展モーション（その他）',
    commands: ['W', 'B', 'E', 'F', 'T', 'H', 'M', 'L'],
    stageCount: 4,
    prerequisites: [NodeId.Visual],
  },
  {
    id: NodeId.OperatorAdv,
    name: '発展オペレータ',
    commands: ['>', '<', 'gu', 'gU', 'g~', '~'],
    stageCount: 4,
    prerequisites: [NodeId.Visual],
  },
  {
    id: NodeId.Number,
    name: '数値操作',
    commands: ['Ctrl+a', 'Ctrl+x'],
    stageCount: 2,
    prerequisites: [NodeId.Search],
  },
  {
    id: NodeId.ScrollMark,
    name: 'スクロール＋マーク',
    commands: ['Ctrl+d', 'Ctrl+u', 'Ctrl+f', 'Ctrl+b', 'm', "'", '`', 'gi'],
    stageCount: 4,
    prerequisites: [NodeId.Search],
  },
  {
    id: NodeId.Screen,
    name: '画面操作',
    commands: ['zz', 'zt', 'zb', 'Ctrl+e', 'Ctrl+y'],
    stageCount: 3,
    prerequisites: [NodeId.ScrollMark],
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
