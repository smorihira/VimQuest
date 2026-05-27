import type { Tutorial } from '../../types/tutorial'

/** N06-T: 検索せよ (/, n, N) */
export const N06_T_TUTORIAL: Tutorial = {
  nodeId: 'N04',
  stageId: 'N06-T',
  newCommands: ['/', 'n', 'N'],
  steps: [
    {
      message: '/ を押して bug と入力し Enter で検索しろ',
      expectedKey: null,
      type: 'search',
      searchCommand: '/bug',
    },
    {
      message: 'n を押せ。次のマッチにジャンプする',
      expectedKey: 'n',
    },
    {
      message: 'N を押せ。前のマッチに戻れる',
      expectedKey: 'N',
    },
    {
      message: '/ で検索、n で次、N で前。最後の bug まで行け',
      expectedKey: null,
    },
  ],
}

/** N06-Ta: 同じ奴を探せ (*, #) */
export const N06_Ta_TUTORIAL: Tutorial = {
  nodeId: 'N04',
  stageId: 'N06-Ta',
  newCommands: ['*', '#'],
  steps: [
    {
      message: '* を押せ。カーソル下の foo を前方検索して次に飛ぶ',
      expectedKey: '*',
    },
    {
      message: '# を押せ。今度は後方に戻る',
      expectedKey: '#',
    },
    {
      message: '* で前方、# で後方。最後の foo まで飛べ',
      expectedKey: null,
    },
  ],
}
