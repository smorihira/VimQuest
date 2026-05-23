import type { Stage } from '../../types/stage'

/**
 * N26: d+f/t (df, dt)
 * ALL合流ノード: N23(f/t) + N18(dw)
 * Teach(T) = 1ステージ
 */
export const N26_STAGES: Stage[] = [
    // ── Teach: dt で指定文字の手前まで削除 ──
    // opt = 2 (f: + dt;)
    {
        id: 'N26-T',
        nodeId: 'N26',
        type: 'teach',
        title: '範囲を断て',
        language: 'css',
        initialText: 'color: darkred;',
        goalText: 'color: red;',
        initialCursor: { line: 0, col: 0 },
        life: 8,
        stars: [2, 3, 5],
        availableCommands: [
            'h', 'j', 'k', 'l', 'w', 'b', 'e',
            'f', 't', 'x', 'u', 'dw', 'de', 'db', 'df', 'dt',
        ],
        hints: [{ cost: 1, commands: ['w', 'dtr'] }],
        flavor: 'dt で指定文字の手前まで削除。dark の部分だけ消せ',
    },
]
