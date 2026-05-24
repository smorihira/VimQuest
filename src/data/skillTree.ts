/**
 * Skill tree node definitions — static data for all 31 nodes.
 */

import type { SkillNodeDef, SkillTreeEdge } from '../types/game'

export const SKILL_NODES: SkillNodeDef[] = [
    { id: 'N01', name: '基礎訓練', commands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', 'W', 'B', 'E', '0', '^', '$', 'gg', 'G', 'x', 'i', 'a'], stageCount: 8, prerequisites: [] },
    { id: 'N02', name: '行頭/末Insert', commands: ['I', 'A'], stageCount: 1, prerequisites: ['N01'] },
    { id: 'N03', name: '新行Insert', commands: ['o', 'O'], stageCount: 1, prerequisites: ['N02'] },
    { id: 'N04', name: '1文字置換', commands: ['r'], stageCount: 1, prerequisites: ['N01'] },
    { id: 'N05', name: '大小切替', commands: ['~'], stageCount: 1, prerequisites: ['N01'] },
    {
        id: 'N06',
        name: '半ページ移動',
        commands: ['Ctrl+d', 'Ctrl+u'],
        stageCount: 1,
        prerequisites: ['N01'],
    },
    {
        id: 'N07',
        name: '画面位置調整',
        commands: ['zz', 'zt', 'zb'],
        stageCount: 1,
        prerequisites: ['N06'],
    },
    { id: 'N08', name: '検索', commands: ['/', 'n', 'N'], stageCount: 2, prerequisites: ['N06'] },
    {
        id: 'N09',
        name: 'カーソル下検索',
        commands: ['*', '#'],
        stageCount: 1,
        prerequisites: ['N08'],
    },
    {
        id: 'N10',
        name: 'd+motion',
        commands: ['dw', 'de', 'db'],
        stageCount: 3,
        prerequisites: ['N01'],
    },
    { id: 'N11', name: '行削除', commands: ['dd'], stageCount: 1, prerequisites: ['N10'] },
    { id: 'N12', name: '行末削除', commands: ['d$', 'd0'], stageCount: 1, prerequisites: ['N11'] },
    { id: 'N13', name: 'Dショートカット', commands: ['D'], stageCount: 1, prerequisites: ['N12'] },
    { id: 'N14', name: '行結合', commands: ['J'], stageCount: 1, prerequisites: ['N11'] },
    { id: 'N15', name: '行内ジャンプ', commands: ['f', 't', ';', ','], stageCount: 3, prerequisites: ['N01'] },
    { id: 'N16', name: '括弧ジャンプ', commands: ['%'], stageCount: 1, prerequisites: ['N15'] },
    {
        id: 'N17',
        name: 'd+f/t',
        commands: ['df', 'dt'],
        stageCount: 1,
        prerequisites: ['N15', 'N10'],
    },
    {
        id: 'N18',
        name: 'c+f/t',
        commands: ['cf', 'ct'],
        stageCount: 2,
        prerequisites: ['N17'],
    },
    { id: 'N19', name: '基本TextObj', commands: ['iw', 'aw'], stageCount: 2, prerequisites: ['N15'] },
    {
        id: 'N20',
        name: 'デリミタTextObj',
        commands: ['i"', 'a"', "i'", "a'", 'i(', 'a(', 'i{', 'a{', 'i[', 'a[', 'i<', 'a<', 'it', 'at'],
        stageCount: 2,
        prerequisites: ['N19'],
    },
    {
        id: 'N21',
        name: 'd+TextObj',
        commands: ['diw', 'di"', 'da('],
        stageCount: 2,
        prerequisites: ['N20', 'N10'],
    },
    {
        id: 'N22',
        name: 'c+TextObj',
        commands: ['ciw', 'ci"', 'ca('],
        stageCount: 3,
        prerequisites: ['N20', 'N18'],
    },
    {
        id: 'N23',
        name: '変更ショート',
        commands: ['s', 'S', 'C'],
        stageCount: 1,
        prerequisites: ['N22'],
    },
    { id: 'N24', name: 'ドットリピート', commands: ['.'], stageCount: 3, prerequisites: ['N23'] },
    {
        id: 'N25',
        name: '大小文字変換',
        commands: ['gu', 'gU'],
        stageCount: 1,
        prerequisites: ['N20'],
    },
    { id: 'N26', name: 'インデント', commands: ['>>', '<<'], stageCount: 1, prerequisites: ['N20'] },
    { id: 'N27', name: 'Visualモード', commands: ['v', 'V'], stageCount: 2, prerequisites: ['N20'] },
    { id: 'N28', name: '矩形選択', commands: ['Ctrl+v'], stageCount: 2, prerequisites: ['N27'] },
    { id: 'N29', name: 'ヤンク', commands: ['y'], stageCount: 2, prerequisites: ['N20'] },
    { id: 'N30', name: 'ペースト', commands: ['p', 'P'], stageCount: 1, prerequisites: ['N29'] },
    { id: 'N31', name: 'レジスタ', commands: ['"a', '"0'], stageCount: 2, prerequisites: ['N30'] },
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
