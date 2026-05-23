import type { Stage } from '../../types/stage'

/**
 * N10: 行頭/末移動 (0, $)
 * Teach(T) = 1ステージ
 */
export const N10_STAGES: Stage[] = [
    // ── Teach: 行末にジャンプ ──
    // opt = 1 ($) → cursor at last char
    {
        id: 'N10-T',
        nodeId: 'N10',
        type: 'teach',
        title: '端まで飛べ',
        language: 'plaintext',
        initialText: 'jump to the end of this line!',
        goalText: 'jump to the end of this line!',
        initialCursor: { line: 0, col: 0 },
        life: 7,
        stars: [1, 2, 4],
        availableCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', 'x', 'u'],
        clearConditions: { cursor: { line: 0, col: 28 } },
        hints: [{ cost: 1, commands: ['$'] }],
        flavor: '$ で行末に一瞬で飛べる。w 連打とはおさらばだ',
    },
]
