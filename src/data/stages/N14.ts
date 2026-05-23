import type { Stage } from '../../types/stage'

/**
 * N14: 半ページ移動 (Ctrl+d, Ctrl+u)
 * Teach(T) = 1ステージ
 */
export const N14_STAGES: Stage[] = [
    // ── Teach: 半ページジャンプ ──
    // opt = 1 (Ctrl+d)
    {
        id: 'N14-T',
        nodeId: 'N14',
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
            '  return [a, b, c, d, e, f, g];\n' +
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
            '  return [a, b, c, d, e, f, g];\n' +
            '}',
        initialCursor: { line: 0, col: 0 },
        life: 7,
        stars: [1, 2, 4],
        availableCommands: [
            'h', 'j', 'k', 'l', 'w', 'b', 'e',
            '0', '$', 'gg', 'G', 'Ctrl+d', 'Ctrl+u', 'x', 'u',
        ],
        clearConditions: { cursor: { line: 9, col: 0 } },
        hints: [{ cost: 1, commands: ['Ctrl+d', 'Ctrl+d'] }],
        flavor: 'j 連打より Ctrl+d で半ページ分ジャンプだ',
    },
]
