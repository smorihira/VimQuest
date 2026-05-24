/**
 * Skill tree node definitions — static data for all 37 nodes.
 */

import type { SkillNodeDef, SkillTreeEdge } from '../types/game'

export const SKILL_NODES: SkillNodeDef[] = [
    { id: 'N01', name: '基礎訓練', commands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', 'x', 'i', 'a'], stageCount: 5, prerequisites: [] },
    { id: 'N02', name: '行頭/末Insert', commands: ['I', 'A'], stageCount: 1, prerequisites: ['N01'] },
    { id: 'N03', name: '新行Insert', commands: ['o', 'O'], stageCount: 1, prerequisites: ['N02'] },
    { id: 'N04', name: '1文字置換', commands: ['r'], stageCount: 1, prerequisites: ['N01'] },
    { id: 'N05', name: '大小切替', commands: ['~'], stageCount: 1, prerequisites: ['N01'] },
    { id: 'N06', name: 'WORD移動', commands: ['W', 'B', 'E'], stageCount: 1, prerequisites: ['N01'] },
    { id: 'N07', name: '行頭/末移動', commands: ['0', '$'], stageCount: 1, prerequisites: ['N01'] },
    { id: 'N08', name: '非空白行頭', commands: ['^'], stageCount: 1, prerequisites: ['N07'] },
    { id: 'N09', name: 'ファイル移動', commands: ['gg', 'G'], stageCount: 1, prerequisites: ['N07'] },
    { id: 'N10', name: '折り返し行', commands: ['gj', 'gk'], stageCount: 1, prerequisites: ['N09'] },
    {
        id: 'N11',
        name: '半ページ移動',
        commands: ['Ctrl+d', 'Ctrl+u'],
        stageCount: 1,
        prerequisites: ['N09'],
    },
    {
        id: 'N12',
        name: '画面位置調整',
        commands: ['zz', 'zt', 'zb'],
        stageCount: 1,
        prerequisites: ['N11'],
    },
    { id: 'N13', name: '検索', commands: ['/', 'n', 'N'], stageCount: 2, prerequisites: ['N11'] },
    {
        id: 'N14',
        name: 'カーソル下検索',
        commands: ['*', '#'],
        stageCount: 1,
        prerequisites: ['N13'],
    },
    {
        id: 'N15',
        name: 'd+motion',
        commands: ['dw', 'de', 'db'],
        stageCount: 3,
        prerequisites: ['N07'],
    },
    { id: 'N16', name: '行削除', commands: ['dd'], stageCount: 1, prerequisites: ['N08', 'N15'] },
    { id: 'N17', name: '行末削除', commands: ['d$', 'd0'], stageCount: 1, prerequisites: ['N16'] },
    { id: 'N18', name: 'Dショートカット', commands: ['D'], stageCount: 1, prerequisites: ['N17'] },
    { id: 'N19', name: '行結合', commands: ['J'], stageCount: 1, prerequisites: ['N16'] },
    { id: 'N20', name: '行内ジャンプ', commands: ['f', 't', ';', ','], stageCount: 3, prerequisites: ['N07'] },
    { id: 'N21', name: '括弧ジャンプ', commands: ['%'], stageCount: 1, prerequisites: ['N20'] },
    {
        id: 'N22',
        name: 'd+f/t',
        commands: ['df', 'dt'],
        stageCount: 1,
        prerequisites: ['N20', 'N15'],
    },
    {
        id: 'N23',
        name: 'c+f/t',
        commands: ['cf', 'ct'],
        stageCount: 2,
        prerequisites: ['N22'],
    },
    { id: 'N24', name: '基本TextObj', commands: ['iw', 'aw'], stageCount: 2, prerequisites: ['N20'] },
    {
        id: 'N25',
        name: 'デリミタTextObj',
        commands: ['i"', 'a"', "i'", "a'", 'i(', 'a(', 'i{', 'a{', 'i[', 'a[', 'i<', 'a<', 'it', 'at'],
        stageCount: 2,
        prerequisites: ['N24'],
    },
    {
        id: 'N26',
        name: 'd+TextObj',
        commands: ['diw', 'di"', 'da('],
        stageCount: 2,
        prerequisites: ['N25', 'N15'],
    },
    {
        id: 'N27',
        name: 'c+TextObj',
        commands: ['ciw', 'ci"', 'ca('],
        stageCount: 3,
        prerequisites: ['N25', 'N23'],
    },
    {
        id: 'N28',
        name: '変更ショート',
        commands: ['s', 'S', 'C'],
        stageCount: 1,
        prerequisites: ['N27'],
    },
    { id: 'N29', name: 'ドットリピート', commands: ['.'], stageCount: 3, prerequisites: ['N28'] },
    {
        id: 'N30',
        name: '大小文字変換',
        commands: ['gu', 'gU'],
        stageCount: 1,
        prerequisites: ['N25'],
    },
    { id: 'N31', name: 'インデント', commands: ['>>', '<<'], stageCount: 1, prerequisites: ['N25'] },
    { id: 'N32', name: 'Visualモード', commands: ['v', 'V'], stageCount: 2, prerequisites: ['N25'] },
    { id: 'N33', name: '矩形選択', commands: ['Ctrl+v'], stageCount: 2, prerequisites: ['N32'] },
    { id: 'N34', name: 'ヤンク', commands: ['y'], stageCount: 2, prerequisites: ['N25'] },
    { id: 'N35', name: 'ペースト', commands: ['p', 'P'], stageCount: 1, prerequisites: ['N34'] },
    { id: 'N36', name: 'レジスタ', commands: ['"a', '"0'], stageCount: 2, prerequisites: ['N35'] },
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
