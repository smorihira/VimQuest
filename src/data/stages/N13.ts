import type { Stage } from '../../types/stage'

/**
 * N13: 折り返し行 (gj, gk)
 * Teach(T) = 1ステージ
 */
export const N13_STAGES: Stage[] = [
    // ── Teach: 表示行単位で移動 ──
    // opt = 2 (gj + gj)
    {
        id: 'N13-T',
        nodeId: 'N13',
        type: 'teach',
        title: '表示行を歩け',
        language: 'plaintext',
        initialText: 'this is a very long line that wraps around the editor viewport\nshort line',
        goalText: 'this is a very long line that wraps around the editor viewport\nshort line',
        initialCursor: { line: 0, col: 0 },
        life: 8,
        stars: [2, 3, 5],
        availableCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', 'gj', 'gk', 'x', 'u'],
        clearConditions: { cursor: { line: 1, col: 0 } },
        hints: [{ cost: 1, commands: ['gj', 'gj'] }],
        flavor: 'j は論理行で動く。gj なら表示行で移動できる',
    },
]
