/**
 * Shiki-based syntax highlighter singleton.
 * Custom theme matching VimQuest color palette.
 */

import { createHighlighter, type BundledLanguage, type Highlighter, type ThemedToken } from 'shiki'
import type { Language } from '../types/stage'

const VIMQUEST_THEME = {
  name: 'vimquest',
  type: 'dark' as const,
  colors: {
    'editor.background': '#0f0f1a',
    'editor.foreground': '#e0e0e0',
  },
  tokenColors: [
    { scope: ['keyword', 'storage.type', 'storage.modifier'], settings: { foreground: '#7c7cff' } },
    { scope: ['string', 'string.quoted'], settings: { foreground: '#44ddaa' } },
    { scope: ['constant.numeric', 'constant.language'], settings: { foreground: '#ffd700' } },
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#666666' } },
    { scope: ['entity.name.function', 'support.function'], settings: { foreground: '#7c7cff' } },
    { scope: ['entity.name.tag', 'support.type'], settings: { foreground: '#7c7cff' } },
    { scope: ['entity.other.attribute-name'], settings: { foreground: '#44ddaa' } },
    { scope: ['variable', 'variable.other'], settings: { foreground: '#e0e0e0' } },
    { scope: ['punctuation'], settings: { foreground: '#aaaaaa' } },
    {
      scope: ['meta.property-name', 'support.type.property-name'],
      settings: { foreground: '#7c7cff' },
    },
    { scope: ['constant.other.color', 'constant.other'], settings: { foreground: '#ffd700' } },
    { scope: ['meta.selector'], settings: { foreground: '#44ddaa' } },
  ],
}

const SHIKI_LANGS: Record<string, BundledLanguage> = {
  javascript: 'javascript',
  css: 'css',
  html: 'html',
  json: 'json',
  python: 'python',
  markdown: 'markdown',
}

let highlighterPromise: Promise<Highlighter> | null = null
let highlighter: Highlighter | null = null

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [VIMQUEST_THEME],
      langs: Object.values(SHIKI_LANGS),
    }).then((h) => {
      highlighter = h
      return h
    })
  }
  return highlighterPromise
}

// Start loading immediately on import
getHighlighter()

export type TokenInfo = { text: string; color?: string }

export function tokenizeLine(line: string, language: Language): TokenInfo[] | null {
  if (!highlighter || language === 'plaintext') return null

  const lang = SHIKI_LANGS[language]
  if (!lang) return null

  try {
    const result = highlighter.codeToTokens(line, {
      lang,
      theme: 'vimquest',
    })
    if (result.tokens.length === 0) return null

    return result.tokens[0].map((t: ThemedToken) => ({
      text: t.content,
      color: t.color,
    }))
  } catch {
    return null
  }
}

export function isHighlighterReady(): boolean {
  return highlighter !== null
}

export function waitForHighlighter(): Promise<void> {
  return getHighlighter().then(() => {})
}
