import type { Stage } from '../../types/stage'

/**
 * N7: 画面位置調整 (zz, zt, zb)
 * ビューポートコマンド。viewportTop を合わせないとクリアできない。
 * Teach(T) = 1ステージ
 */
export const N05_STAGES: Stage[] = [
  // ── Teach: カーソルを移動 + zz で画面中央に合わせる ──
  // opt = 5 (Ctrl+d + Ctrl+d + j + j + zz)
  {
    id: 'N05-T',
    nodeId: 'N17',
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
  },

  // ── Practice: zz で中央配置 ──
  // opt = 4: Ctrl+d(1)+j(1)+j(1)+zz(1)
  {
    id: 'N05-P',
    nodeId: 'N17',
    type: 'practice',
    title: '画面調整',
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
      '  // TARGET\n' +
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
      '  // TARGET\n' +
      '  const config = getConfig();\n' +
      '  const db = getDb();\n' +
      '  const queue = getQueue();\n' +
      '  const worker = getWorker();\n' +
      '  const scheduler = getScheduler();\n' +
      '  return compose(header, nav, content);\n' +
      '}',
    initialCursor: { line: 0, col: 0 },
    life: 10,
    stars: [4, 6, 8],
    availableCommands: ['zz', 'zt', 'zb', 'Ctrl+d', 'Ctrl+u'],
    clearConditions: { cursor: { line: 10, col: 0 }, viewportTop: 2 },
    hints: [{ cost: 1, commands: ['Ctrl+d', 'j', 'j', 'zz'] }],
    flavor: 'Ctrl+d で移動し、zz で中央に合わせろ',
  },

  // ── Challenge: zt で上端配置 ──
  // opt = 5: Ctrl+d(1)+Ctrl+d(1)+j(1)+j(1)+zt(1)
  {
    id: 'N05-C',
    nodeId: 'N17',
    type: 'challenge',
    title: '画面操作総合',
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
      '  // TARGET\n' +
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
      '  // TARGET\n' +
      '  const config = getConfig();\n' +
      '  const db = getDb();\n' +
      '  const queue = getQueue();\n' +
      '  const worker = getWorker();\n' +
      '  const scheduler = getScheduler();\n' +
      '  return compose(header, nav, content);\n' +
      '}',
    initialCursor: { line: 0, col: 0 },
    life: 13,
    stars: [5, 8, 11],
    availableCommands: ['zz', 'zt', 'zb', 'Ctrl+d', 'Ctrl+u'],
    clearConditions: { cursor: { line: 18, col: 0 }, viewportTop: 18 },
    hints: [{ cost: 1, commands: ['Ctrl+d', 'Ctrl+d', 'j', 'j', 'zt'] }],
    flavor: 'zt で現在行を画面上端に。スクロールを自在に操れ',
  },
]
