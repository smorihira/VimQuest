# リファクタリング設計書

## 現状サマリ

| ファイル                             | 行数  | 問題                                                       |
| ------------------------------------ | ----- | ---------------------------------------------------------- |
| `src/engine/commandExecutor.ts`      | ~2060 | 50+コマンドが1ファイル。モード別ロジックが混在             |
| `src/engine/commandParser.ts`        | ~900  | 14状態のステートマシン。hand検証ロジックが各ハンドラに散在 |
| `src/features/play/PlayScreen.tsx`   | ~560  | キーボード処理・カード表示・HUD・音声が混在                |
| `src/features/play/usePlayEngine.ts` | ~363  | handleKey 100行超。insert session が4つのrefで暗黙管理     |
| `src/features/play/HintOverlay.tsx`  | ~170  | コマンド再生ロジックがStageTutorialと重複                  |

---

## R1: commandExecutor.ts 分割

**現状**: 2060行に全コマンド実装が集中。新コマンド追加時に全体を把握する必要あり。

**分割方針**: public API（dispatcher）は残し、実装をモード別モジュールに分離。

```
src/engine/
  commandExecutor.ts         ← dispatch のみ残す (~100行)
  executors/
    helpers.ts               ← lines, join, clampCursor, lineLen, lineCount, isWordChar, isSpace, pushUndo
    motions.ts               ← resolveMotion + moveLeft/Right/Up/Down, wordForward/Back 等
    normalCommands.ts        ← executeDeleteChar, executeReplace, executeToggleCase, executeJoinLines, executePaste, executeIndent 等
    operatorCommands.ts      ← executeOperatorMotion, executeOperatorTextObject, executeDeleteLine, executeChangeLine
    insertMode.ts            ← executeInsertBefore/After/LineStart/LineEnd, executeOpenLine, executeInsertText, executeBackspace, finalizeInsertSession
    visualMode.ts            ← executeVisualDelete, executeVisualYank, executeVisualChange, executeVisualIndent
    searchCommands.ts        ← executeSearch, executeSearchNext/Prev
    undoRedo.ts              ← executeUndo, executeRedo
    dotRepeat.ts             ← executeDotRepeat
    scroll.ts                ← executeScrollDown/Up, ensureCursorVisible
    textObjects.ts           ← resolveTextObject, findMatchingBracket, findQuoteRange 等
```

**ルール**:

- 全 executor 関数は純粋関数（EditorState → EditorState）
- helpers.ts の共通ユーティリティを各モジュールがimport
- commandExecutor.ts の `executeCommand` は dispatcher のみ

---

## R2: PlayScreen.tsx コンポーネント分割

**現状**: 560行に HUD、キーボード処理、カード表示、音声制御が混在。

**分割方針**:

```
src/features/play/
  PlayScreen.tsx             ← ルート (stage取得 + tutorial判定, ~80行)
  PlayScreenInner.tsx        ← ゲーム本体のレイアウト + useEffect群 (~150行)
  components/
    TopBar.tsx               ← :q!, :e!, mute, ライフゲージ, ステージ名, モード表示
    CardPanel.tsx            ← HAND + BASE行 + カード分類表示
  hooks/
    useKeyboardHandler.ts    ← mapKeyEvent + onKeyDown (colon buffer, space vision, key dispatch)
  commandMetadata.ts         ← getCardClass, getCardHint をデータ駆動化
```

**commandMetadata.ts** の設計:

```typescript
type CardCategory = 'motion' | 'verb' | 'action' | 'insert'

const CARD_CATEGORIES: Record<string, CardCategory> = {
  h: 'motion',
  j: 'motion',
  k: 'motion',
  l: 'motion',
  w: 'motion',
  b: 'motion',
  e: 'motion',
  W: 'motion',
  B: 'motion',
  E: 'motion',
  '0': 'motion',
  '^': 'motion',
  $: 'motion',
  gg: 'motion',
  G: 'motion',
  f: 'motion',
  F: 'motion',
  t: 'motion',
  T: 'motion',
  '%': 'motion',
  d: 'verb',
  c: 'verb',
  y: 'verb',
  x: 'action',
  r: 'action',
  '~': 'action',
  J: 'action',
  '.': 'action',
  u: 'action',
  p: 'action',
  P: 'action',
  '>': 'action',
  '<': 'action',
  i: 'insert',
  a: 'insert',
  I: 'insert',
  A: 'insert',
  o: 'insert',
  O: 'insert',
}

export function getCardClass(cmd: string): CardCategory | undefined {
  return CARD_CATEGORIES[cmd] ?? CARD_CATEGORIES[cmd[0]]
}
```

---

## R3: usePlayEngine.ts 簡素化

**現状**: handleKey が100行超。insert session を4つのrefで暗黙管理。

### R3a: InsertSession を明示的な型に

```typescript
// 現状: 4つのref
const insertEntryRef = useRef<EditorState | null>(null)
const insertCharCount = useRef(0)
const insertCommandRef = useRef<string>('')
const insertDamageAtEntryRef = useRef(0)

// 変更後: 1つのrefに統合
interface InsertSession {
  entryState: EditorState
  charCount: number
  command: string
  damageAtEntry: number
}
const insertSessionRef = useRef<InsertSession | null>(null)
```

### R3b: handleKey のモード別分離

```typescript
// 現状: 1つの巨大callback に全モードのロジック
const handleKey = useCallback((key: string) => {
  // insert mode bypass (20行)
  // parser feed (5行)
  // undo (15行)
  // redo (15行)
  // insert entry (10行)
  // visual change (10行)
  // insert exit/Esc (30行)
  // all other commands (20行)
}, [...])

// 変更後: ヘルパー関数に分離
function handleInsertModeKey(key: string, ...): boolean { ... }
function handleUndoRedo(raw: string, ...): boolean { ... }
function handleInsertEntry(raw: string, ...): boolean { ... }
function handleInsertExit(raw: string, ...): boolean { ... }
function handleNormalCommand(parseResult, ...): void { ... }
```

注: useReducer化は状態更新パターンとの相性を見て別途判断。現時点ではヘルパー抽出のみ。

---

## R4: コマンド再生ロジック統一

**現状**: HintOverlay と StageTutorial で `CommandParser.feed → executeCommand` のパターンが重複。

**変更**: 共通ユーティリティ抽出

```typescript
// src/engine/commandReplayer.ts
export function applyCommand(
  state: EditorState,
  cmdStr: string,
  availableCommands: readonly string[],
  baseCommands?: readonly string[],
): EditorState {
  const parser = new CommandParser(
    availableCommands,
    undefined,
    undefined,
    baseCommands as string[] | undefined,
  )
  let s = state
  for (const key of cmdStr) {
    const result = parser.feed(key)
    if (result?.command.valid) {
      s = executeCommand(s, result.command)
    }
  }
  return s
}
```

---

## R5: SpellEntry 型の移動

**現状**: `SpellEntry` が usePlayEngine.ts で定義され、ResultScreen がそこからimport。

**変更**: `src/types/spell.ts` に移動。

```typescript
// src/types/spell.ts
export interface SpellEntry {
  command: string
  damage: number
}
```

---

## 実施順序

| 順序 | 項目                    | 理由                               |
| ---- | ----------------------- | ---------------------------------- |
| 1    | R5: SpellEntry型移動    | 最小変更。依存整理の起点           |
| 2    | R4: commandReplayer抽出 | 小規模。重複除去                   |
| 3    | R3: usePlayEngine簡素化 | InsertSession統合 + ヘルパー分離   |
| 4    | R1: commandExecutor分割 | 最大変更。テスト全パス確認しながら |
| 5    | R2: PlayScreen分割      | UIコンポーネント分割               |

各ステップでテスト + 型チェック全パスを確認してから次へ進む。
