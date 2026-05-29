import type { Stage } from '../../types/stage'
import { NodeId } from '../../types/nodeId'

/** 画面操作 — zz/zt/zb, Ctrl+e/y */
export const SCREEN_STAGES: Stage[] = [
  // ── Teach: カーソルを移動 + zz で画面中央に合わせる ──
  // opt = 5 (Ctrl+d + Ctrl+d + j + j + zz)
  {
    id: 'screen-center',
    nodeId: NodeId.Screen,
    type: 'tutorial',
    title: '画面を合わせろ',
    language: 'javascript',
    initialText:
      'function render() {\n' +
      '  const header = getHeader();\n' +
      '  const nav = getNav();\n' +
      '  const sidebar = getSidebar();\n' +
      '  const content = getContent();\n' +
      '  const footer = getFooter();\n' +
      '  const modal = getModal();\n' +
      '  const toast = getToast();\n' +
      '  const loader = getLoader();\n' +
      '  const error = getError();\n' +
      '  const theme = getTheme();\n' +
      '  const locale = getLocale();\n' +
      '  const auth = getAuth();\n' +
      '  const router = getRouter();\n' +
      '  const store = getStore();\n' +
      '  const api = getApi();\n' +
      '  const cache = getCache();\n' +
      '  const logger = getLogger();\n' +
      '  // TARGET: move cursor here and center\n' +
      '  const config = getConfig();\n' +
      '  const db = getDb();\n' +
      '  const queue = getQueue();\n' +
      '  const worker = getWorker();\n' +
      '  const scheduler = getScheduler();\n' +
      '  return compose(header, nav, content);\n' +
      '}',
    goalText:
      'function render() {\n' +
      '  const header = getHeader();\n' +
      '  const nav = getNav();\n' +
      '  const sidebar = getSidebar();\n' +
      '  const content = getContent();\n' +
      '  const footer = getFooter();\n' +
      '  const modal = getModal();\n' +
      '  const toast = getToast();\n' +
      '  const loader = getLoader();\n' +
      '  const error = getError();\n' +
      '  const theme = getTheme();\n' +
      '  const locale = getLocale();\n' +
      '  const auth = getAuth();\n' +
      '  const router = getRouter();\n' +
      '  const store = getStore();\n' +
      '  const api = getApi();\n' +
      '  const cache = getCache();\n' +
      '  const logger = getLogger();\n' +
      '  // TARGET: move cursor here and center\n' +
      '  const config = getConfig();\n' +
      '  const db = getDb();\n' +
      '  const queue = getQueue();\n' +
      '  const worker = getWorker();\n' +
      '  const scheduler = getScheduler();\n' +
      '  return compose(header, nav, content);\n' +
      '}',
    initialCursor: { line: 0, col: 0 },
    life: 11,
    stars: [5, 6, 8],
    availableCommands: ['zz', 'zt', 'zb', 'Ctrl+d', 'Ctrl+u'],
    clearConditions: { cursor: { line: 18, col: 0 }, viewportTop: 10 },
    hints: [{ cost: 1, commands: ['Ctrl+d', 'Ctrl+d', 'j', 'j', 'zz'] }],
    flavor:
      'Ctrl+d でカーソルを移動し、zz で現在行を画面中央に合わせろ。両方揃わないとクリアできない',
    newCommands: ['zz', 'zt', 'zb'],
    tutorial: [
      {
        message: 'Ctrl+d で半ページ下へ飛べ',
        expectedKey: 'Ctrl+d',
      },
      {
        message: 'zz を押せ。カーソル行が画面中央に来る',
        expectedKey: 'zz',
      },
      {
        message: 'zt を押せ。今度はカーソル行が画面上端に来る',
        expectedKey: 'zt',
      },
      {
        message: 'zb を押せ。画面下端に配置する',
        expectedKey: 'zb',
      },
      {
        message: '3つの画面調整を覚えた。TARGET 行で zz を決めろ',
        expectedKey: null,
      },
    ],
  },
  // ── 🆕 Teach: 1行スクロール ──
  {
    id: 'screen-scroll',
    nodeId: NodeId.Screen,
    type: 'tutorial' as const,
    title: '1行スクロール',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['Ctrl+e', 'Ctrl+y'],
    hints: [],
    flavor: 'TODO',
    newCommands: ['Ctrl+e', 'Ctrl+y'],
  },
  // ── 🆕 Practice: 画面操作総合 ──
  {
    id: 'screen-practice',
    nodeId: NodeId.Screen,
    type: 'practice' as const,
    title: '画面操作総合',
    language: 'plaintext' as const,
    initialText: 'TODO',
    goalText: 'TODO',
    initialCursor: { line: 0, col: 0 },
    life: 5,
    stars: [999, 999, 999] as [number, number, number],
    availableCommands: ['zz', 'zt', 'zb', 'Ctrl+e', 'Ctrl+y'],
    hints: [],
    flavor: 'TODO',
    newCommands: [],
  },
]
