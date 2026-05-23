import type { Stage } from '../../types/stage'

/**
 * N03: Insert基礎 (i, a)
 * テキスト挿入の基本。Insert session = 1 damage (chars free).
 * Teach(T) + Practice(P) = 2ステージ
 */
export const N03_STAGES: Stage[] = [
    // ── Teach: 欠落文字を挿入 ──
    // opt = 2 (l + i + type 'e' + Esc)
    {
        id: 'N03-T',
        nodeId: 'N03',
        type: 'teach',
        title: '文字を差し込め',
        language: 'plaintext',
        initialText: 'hllo world',
        goalText: 'hello world',
        initialCursor: { line: 0, col: 0 },
        life: 8,
        stars: [2, 3, 5],
        availableCommands: ['h', 'j', 'k', 'l', 'x', 'u', 'i', 'a'],
        hints: [{ cost: 1, commands: ['l', 'i', 'e', 'Esc'] }],
        flavor: '抜けている e を挿入せよ',
    },

    // ── Practice: 複数行で挿入 ──
    // opt = 4 (l+i+'el'+Esc, j+i+'o'+Esc)
    {
        id: 'N03-P',
        nodeId: 'N03',
        type: 'practice',
        title: '穴を埋めろ',
        language: 'plaintext',
        initialText: 'hlo\nwrld',
        goalText: 'hello\nworld',
        initialCursor: { line: 0, col: 0 },
        life: 10,
        stars: [4, 6, 8],
        availableCommands: ['h', 'j', 'k', 'l', 'x', 'u', 'i', 'a'],
        hints: [{ cost: 1, commands: ['l', 'i', 'el', 'Esc', 'j', 'i', 'o', 'Esc'] }],
        flavor: '2行とも文字が抜けている。挿入で補え',
    },
]
