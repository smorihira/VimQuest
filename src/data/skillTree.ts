/**
 * Skill tree node definitions — static data for all 40 nodes.
 */

import type { SkillNodeDef, SkillTreeEdge } from '../types/game'

export const SKILL_NODES: SkillNodeDef[] = [
    { id: 'N01', name: '基本移動', commands: ['h', 'j', 'k', 'l'], stageCount: 2, prerequisites: [] },
    { id: 'N02', name: '1文字削除', commands: ['x'], stageCount: 2, prerequisites: ['N01'] },
    { id: 'N03', name: 'Insert基礎', commands: ['i', 'a'], stageCount: 2, prerequisites: ['N02'] },
    { id: 'N04', name: '行頭/末Insert', commands: ['I', 'A'], stageCount: 1, prerequisites: ['N03'] },
    { id: 'N05', name: '新行Insert', commands: ['o', 'O'], stageCount: 1, prerequisites: ['N04'] },
    { id: 'N06', name: '1文字置換', commands: ['r'], stageCount: 1, prerequisites: ['N02'] },
    { id: 'N07', name: '大小切替', commands: ['~'], stageCount: 1, prerequisites: ['N02'] },
    { id: 'N08', name: '単語移動', commands: ['w', 'b', 'e'], stageCount: 2, prerequisites: ['N02'] },
    { id: 'N09', name: 'WORD移動', commands: ['W', 'B', 'E'], stageCount: 1, prerequisites: ['N08'] },
    { id: 'N10', name: '行頭/末移動', commands: ['0', '$'], stageCount: 1, prerequisites: ['N08'] },
    { id: 'N11', name: '非空白行頭', commands: ['^'], stageCount: 1, prerequisites: ['N10'] },
    { id: 'N12', name: 'ファイル移動', commands: ['gg', 'G'], stageCount: 1, prerequisites: ['N10'] },
    { id: 'N13', name: '折り返し行', commands: ['gj', 'gk'], stageCount: 1, prerequisites: ['N12'] },
    { id: 'N14', name: '半ページ移動', commands: ['Ctrl+d', 'Ctrl+u'], stageCount: 1, prerequisites: ['N12'] },
    { id: 'N15', name: '画面位置調整', commands: ['zz', 'zt', 'zb'], stageCount: 1, prerequisites: ['N14'] },
    { id: 'N16', name: '検索', commands: ['/', 'n', 'N'], stageCount: 2, prerequisites: ['N14'] },
    { id: 'N17', name: 'カーソル下検索', commands: ['*', '#'], stageCount: 1, prerequisites: ['N16'] },
    { id: 'N18', name: 'd+motion', commands: ['dw', 'de', 'db'], stageCount: 3, prerequisites: ['N08'] },
    { id: 'N19', name: '行削除', commands: ['dd'], stageCount: 1, prerequisites: ['N11', 'N18'] },
    { id: 'N20', name: '行末削除', commands: ['d$', 'd0'], stageCount: 1, prerequisites: ['N19'] },
    { id: 'N21', name: 'Dショートカット', commands: ['D'], stageCount: 1, prerequisites: ['N20'] },
    { id: 'N22', name: '行結合', commands: ['J'], stageCount: 1, prerequisites: ['N19'] },
    { id: 'N23', name: '行内ジャンプ', commands: ['f', 't'], stageCount: 2, prerequisites: ['N08'] },
    { id: 'N24', name: 'f/t繰り返し', commands: [';', ','], stageCount: 1, prerequisites: ['N23'] },
    { id: 'N25', name: '括弧ジャンプ', commands: ['%'], stageCount: 1, prerequisites: ['N23'] },
    { id: 'N26', name: 'd+f/t', commands: ['df', 'dt'], stageCount: 1, prerequisites: ['N23', 'N18'] },
    { id: 'N27', name: 'c+f/t', commands: ['cf', 'ct'], stageCount: 2, prerequisites: ['N26', 'N03'] },
    { id: 'N29', name: '基本TextObj', commands: ['iw', 'aw'], stageCount: 2, prerequisites: ['N23'] },
    { id: 'N30', name: 'デリミタTextObj', commands: ['i"', 'a"', "i'", "a'", 'i(', 'a(', 'i{', 'a{', 'i[', 'a[', 'i<', 'a<', 'it', 'at'], stageCount: 2, prerequisites: ['N29'] },
    { id: 'N31', name: 'd+TextObj', commands: ['diw', 'di"', 'da('], stageCount: 2, prerequisites: ['N30', 'N18'] },
    { id: 'N32', name: 'c+TextObj', commands: ['ciw', 'ci"', 'ca('], stageCount: 3, prerequisites: ['N30', 'N27'] },
    { id: 'N33', name: '変更ショート', commands: ['s', 'S', 'C'], stageCount: 1, prerequisites: ['N32'] },
    { id: 'N34', name: 'ドットリピート', commands: ['.'], stageCount: 3, prerequisites: ['N33'] },
    { id: 'N35', name: '大小文字変換', commands: ['gu', 'gU'], stageCount: 1, prerequisites: ['N30'] },
    { id: 'N36', name: 'インデント', commands: ['>>', '<<'], stageCount: 1, prerequisites: ['N30'] },
    { id: 'N37', name: 'Visualモード', commands: ['v', 'V'], stageCount: 2, prerequisites: ['N30'] },
    { id: 'N38', name: '矩形選択', commands: ['Ctrl+v'], stageCount: 2, prerequisites: ['N37'] },
    { id: 'N39', name: 'ヤンク', commands: ['y'], stageCount: 2, prerequisites: ['N30'] },
    { id: 'N40', name: 'ペースト', commands: ['p', 'P'], stageCount: 1, prerequisites: ['N39'] },
    { id: 'N41', name: 'レジスタ', commands: ['"a', '"0'], stageCount: 2, prerequisites: ['N40'] },
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
