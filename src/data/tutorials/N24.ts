import type { Tutorial } from '../../types/tutorial'

export const N24_T_TUTORIAL: Tutorial = {
  nodeId: 'N09',
  stageId: 'N24-T',
  newCommands: ['gn'],
  steps: [
    {
      message: 'まず /foo Enter で "foo" を検索しろ',
      type: 'search',
      searchCommand: '/foo',
      expectedKey: null,
    },
    { message: 'gn を押せ。次の検索マッチが Visual 選択される', expectedKey: 'gn' },
    { message: 'c で選択範囲を変更だ。baz と打って Esc', expectedKey: 'c' },
    { message: 'もう一度 gn → c で次の foo も書き換えろ', expectedKey: null },
  ],
}
