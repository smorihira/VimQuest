import type { Tutorial } from '../../types/tutorial'

/** N08-T: 検索せよ (/, n, N) */
export const N08_T_TUTORIAL: Tutorial = {
  nodeId: 'N08',
  stageId: 'N08-T',
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
