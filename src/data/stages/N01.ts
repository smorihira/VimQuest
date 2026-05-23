import type { Stage } from '../../types/stage'

/**
 * N01: 基礎訓練 (h/j/k/l/w/b/e/x/i/a)
 * ゲーム最初のノード。5ステージ構成のチュートリアルノード。
 * 連続プレイ（ツリー非表示）。ライフ/☆評価なし。
 */

export const N01_STAGES: Stage[] = [
  // ── N01-1: 左右に動け ──
  {
    id: 'N01-1',
    nodeId: 'N01',
    type: 'tutorial',
    title: '左右に動け',
    language: 'plaintext',
    initialText: 'hello!',
    goalText: 'hello!',
    initialCursor: { line: 0, col: 0 },
    life: 999,
    stars: [999, 999, 999],
    availableCommands: ['h', 'l'],
    clearConditions: { cursor: { line: 0, col: 5 } },
    hints: [{ cost: 1, commands: ['l', 'l', 'l', 'l', 'l'] }],
    flavor: 'カーソルを ! の上まで移動せよ',
  },

  // ── N01-2: 上下に動け ──
  {
    id: 'N01-2',
    nodeId: 'N01',
    type: 'tutorial',
    title: '上下に動け',
    language: 'plaintext',
    initialText: 'first line\nsecond line\nthird line',
    goalText: 'first line\nsecond line\nthird line',
    initialCursor: { line: 0, col: 0 },
    life: 999,
    stars: [999, 999, 999],
    availableCommands: ['h', 'j', 'k', 'l'],
    clearConditions: { cursor: { line: 2, col: 0 } },
    hints: [{ cost: 1, commands: ['j', 'j'] }],
    flavor: '3行目までカーソルを下ろせ',
  },

  // ── N01-3: 単語を飛べ ──
  {
    id: 'N01-3',
    nodeId: 'N01',
    type: 'tutorial',
    title: '単語を飛べ',
    language: 'plaintext',
    initialText: 'the quick brown fox jumps',
    goalText: 'the quick brown fox jumps',
    initialCursor: { line: 0, col: 0 },
    life: 999,
    stars: [999, 999, 999],
    availableCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e'],
    clearConditions: { cursor: { line: 0, col: 20 } },
    hints: [{ cost: 1, commands: ['w', 'w', 'w', 'w'] }],
    flavor: 'w で単語ジャンプ。jumps まで進め',
  },

  // ── N01-4: 文字を消せ ──
  {
    id: 'N01-4',
    nodeId: 'N01',
    type: 'tutorial',
    title: '文字を消せ',
    language: 'plaintext',
    initialText: 'hellllo world',
    goalText: 'hello world',
    initialCursor: { line: 0, col: 3 },
    life: 999,
    stars: [999, 999, 999],
    availableCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', 'x'],
    hints: [{ cost: 1, commands: ['x', 'x'] }],
    flavor: '余分な l を x で消せ',
  },

  // ── N01-5: 文字を書け ──
  {
    id: 'N01-5',
    nodeId: 'N01',
    type: 'tutorial',
    title: '文字を書け',
    language: 'plaintext',
    initialText: 'hllo worl',
    goalText: 'hello world',
    initialCursor: { line: 0, col: 1 },
    life: 999,
    stars: [999, 999, 999],
    availableCommands: ['h', 'j', 'k', 'l', 'w', 'b', 'e', 'x', 'i', 'a'],
    hints: [{ cost: 1, commands: ['i', 'e', 'Esc', 'w', 'e', 'a', 'd', 'Esc'] }],
    flavor: 'i と a で足りない文字を補え',
  },
]
