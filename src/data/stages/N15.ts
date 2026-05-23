import type { Stage } from '../../types/stage'

/**
 * N15: 画面位置調整 (zz, zt, zb)
 * ビューポートコマンド。テキスト変更なし。
 * Teach(T) = 1ステージ
 */
export const N15_STAGES: Stage[] = [
    // ── Teach: 画面中央に合わせる ──
    // opt = 2 (Ctrl+d + zz)
    {
        id: 'N15-T',
        nodeId: 'N15',
        type: 'teach',
        title: '画面を合わせろ',
        language: 'javascript',
        initialText:
            'line 1\nline 2\nline 3\nline 4\nline 5\n' +
            'line 6\nline 7\nline 8\nline 9\nline 10',
        goalText:
            'line 1\nline 2\nline 3\nline 4\nline 5\n' +
            'line 6\nline 7\nline 8\nline 9\nline 10',
        initialCursor: { line: 0, col: 0 },
        life: 8,
        stars: [2, 3, 5],
        availableCommands: [
            'h', 'j', 'k', 'l', 'Ctrl+d', 'Ctrl+u',
            'zz', 'zt', 'zb', 'x', 'u',
        ],
        clearConditions: { cursor: { line: 5, col: 0 } },
        hints: [{ cost: 1, commands: ['Ctrl+d', 'zz'] }],
        flavor: 'zz で現在行を画面中央に。zt で上、zb で下に配置',
    },
]
