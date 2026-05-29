import type { Stage } from '../../types/stage'
import { NodeId } from '../../types/nodeId'

/** スクロール＋マーク — Ctrl+d/u/f/b, m, gi */
export const SCROLL_MARK_STAGES: Stage[] = [
  // ── 🆕 Teach: ページ移動 ──
  {
    id: 'scroll-mark-page',
    nodeId: NodeId.ScrollMark,
    type: 'tutorial' as const,
    title: 'ページ移動',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['Ctrl+d', 'Ctrl+u', 'Ctrl+f', 'Ctrl+b'],
    hints: [],
    flavor: 'TODO',
    newCommands: ['Ctrl+d', 'Ctrl+u', 'Ctrl+f', 'Ctrl+b'],
  },
  // ── 🆕 Teach: マーク ──
  {
    id: 'scroll-mark-mark',
    nodeId: NodeId.ScrollMark,
    type: 'tutorial' as const,
    title: 'マーク',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['m'],
    hints: [],
    flavor: 'TODO',
    newCommands: ['m', "'", '`'],
  },
  // ── 🆕 Teach: 最終挿入位置 ──
  {
    id: 'scroll-mark-gi',
    nodeId: NodeId.ScrollMark,
    type: 'tutorial' as const,
    title: '最終挿入位置',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['gi'],
    hints: [],
    flavor: 'TODO',
    newCommands: ['gi'],
  },
  // ── 🆕 Practice: スクロール＋マーク総合 ──
  {
    id: 'scroll-mark-practice',
    nodeId: NodeId.ScrollMark,
    type: 'practice' as const,
    title: 'スクロール＋マーク総合',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['Ctrl+d', 'Ctrl+u', 'm'],
    hints: [],
    flavor: 'TODO',
    newCommands: [],
  },
]
