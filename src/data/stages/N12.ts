import type { Stage } from '../../types/stage'

/**
 * N12: 画面位置調整 (zz, zt, zb)
 * ビューポートコマンド。テキスト変更なし。
 * Teach(T) = 1ステージ
 */
export const N12_STAGES: Stage[] = [
  // ── Teach: 画面中央に合わせる ──
  // opt = 2 (Ctrl+d + zz)
  {
    id: 'N12-T',
    nodeId: 'N12',
    type: 'teach',
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
      '  // TARGET: move cursor here\n' +
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
      '  // TARGET: move cursor here\n' +
      '  const config = getConfig();\n' +
      '  const db = getDb();\n' +
      '  const queue = getQueue();\n' +
      '  const worker = getWorker();\n' +
      '  const scheduler = getScheduler();\n' +
      '  return compose(header, nav, content);\n' +
      '}',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['zz', 'zt', 'zb', 'Ctrl+d', 'Ctrl+u'],
    clearConditions: { cursor: { line: 16, col: 0 } },
    hints: [{ cost: 1, commands: ['Ctrl+d', 'Ctrl+d'] }],
    flavor: 'Ctrl+d で半ページ移動、zz で現在行を画面中央に合わせてみよう',
  },
]
