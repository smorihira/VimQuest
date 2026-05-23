import type { Stage } from '../../types/stage'

/**
 * N32: c+TextObj (ciw, ci", ca()
 * ALL合流ノード: N30(delim) + N27(cf/ct)
 * ★★★ 重要ノード — Teach(T) + Practice(P) + Challenge(C) = 3ステージ
 */
export const N32_STAGES: Stage[] = [
    // ── Teach: ciw で単語を置換 ──
    // opt = 2 (w + ciw + 'count' + Esc)
    {
        id: 'N32-T',
        nodeId: 'N32',
        type: 'teach',
        title: '単語を変えろ',
        language: 'javascript',
        initialText: 'let value = 0;',
        goalText: 'let count = 0;',
        initialCursor: { line: 0, col: 0 },
        life: 8,
        stars: [2, 3, 5],
        availableCommands: [
            'h', 'j', 'k', 'l', 'w', 'b', 'e',
            'i', 'a', 'f', 't', '0', '$', 'x', 'u',
            'dw', 'cf', 'ct', 'ciw', 'ci"', 'ca(',
        ],
        hints: [{ cost: 1, commands: ['w', 'ciw', 'count', 'Esc'] }],
        flavor: 'ciw で単語を消してそのままInsertモードへ。変数名を変えろ',
    },

    // ── Practice: 複数の TextObj 変更 ──
    // opt = 4 (ci"+#333+Esc, j+ci"+20px+Esc)
    {
        id: 'N32-P',
        nodeId: 'N32',
        type: 'practice',
        title: '属性を直せ',
        language: 'css',
        initialText: 'color: "red";\nfont-size: "16px";',
        goalText: 'color: "#333";\nfont-size: "20px";',
        initialCursor: { line: 0, col: 0 },
        life: 10,
        stars: [4, 6, 8],
        availableCommands: [
            'h', 'j', 'k', 'l', 'w', 'b', 'e',
            'i', 'a', 'f', 't', '0', '$', 'x', 'u',
            'dw', 'cf', 'ct', 'ciw', 'ci"', 'ca(',
        ],
        hints: [
            { cost: 1, commands: ['ci"', '#333', 'Esc', 'j', 'ci"', '20px', 'Esc'] },
        ],
        flavor: '2行の引用符内を ci" で書き換えろ',
    },

    // ── Challenge: JSON修正パズル ──
    // opt = 8 (複数の ci" + ca( を駆使)
    {
        id: 'N32-C',
        nodeId: 'N32',
        type: 'challenge',
        title: 'JSON外科',
        language: 'json',
        initialText:
            '{\n' +
            '  "name": "Alice",\n' +
            '  "age": "twenty",\n' +
            '  "role": "user"\n' +
            '}',
        goalText:
            '{\n' +
            '  "name": "Bob",\n' +
            '  "age": "30",\n' +
            '  "role": "admin"\n' +
            '}',
        initialCursor: { line: 0, col: 0 },
        life: 18,
        stars: [10, 13, 16],
        availableCommands: [
            'h', 'j', 'k', 'l', 'w', 'b', 'e',
            'i', 'a', 'f', 't', '0', '$', 'x', 'u',
            'dw', 'cf', 'ct', 'ciw', 'ci"', 'ca(',
        ],
        hints: [
            {
                cost: 1,
                commands: [
                    'j', '5w', 'ci"', 'Bob', 'Esc',
                    'j', 'ci"', '30', 'Esc',
                    'j', 'ci"', 'admin', 'Esc',
                ],
            },
        ],
        flavor: 'JSON の値を3箇所書き換えろ。ci" の腕の見せどころだ',
    },
]
