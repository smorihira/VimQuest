import type { Stage } from '../../types/stage'

/**
 * N01: 基本移動 (h/j/k/l)
 * ゲーム最初のノード。移動のみ。
 * Teach(T) + Practice(P) = 2ステージ
 */

export const N01_STAGES: Stage[] = [
    // ── Teach: カーソルを右端へ移動 ──
    // opt = 5 (lllll) → ☆3=5, ☆2=6, ☆1=8, life=11
    {
        id: 'N01-T',
        nodeId: 'N01',
        type: 'teach',
        title: '右へ進め',
        language: 'plaintext',
        initialText: 'hello!',
        goalText: 'hello!',
        initialCursor: { line: 0, col: 0 },
        life: 11,
        stars: [5, 6, 8],
        availableCommands: ['h', 'j', 'k', 'l'],
        clearConditions: { cursor: { line: 0, col: 5 } },
        hints: [{ cost: 1, commands: ['l', 'l', 'l', 'l', 'l'] }],
        flavor: 'カーソルを ! の上まで移動せよ',
    },

    // ── Practice: 2次元移動でターゲットに到達 ──
    // opt = 5 (jjjll) → ☆3=5, ☆2=7, ☆1=9, life=11
    {
        id: 'N01-P',
        nodeId: 'N01',
        type: 'practice',
        title: '目標地点へ',
        language: 'plaintext',
        initialText: 'abc\ndef\nghi\njkl',
        goalText: 'abc\ndef\nghi\njkl',
        initialCursor: { line: 0, col: 0 },
        life: 11,
        stars: [5, 7, 9],
        availableCommands: ['h', 'j', 'k', 'l'],
        clearConditions: { cursor: { line: 3, col: 2 } },
        hints: [{ cost: 1, commands: ['j', 'j', 'j', 'l', 'l'] }],
        flavor: 'l の上にカーソルを運べ',
    },
]
