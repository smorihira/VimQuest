# HINT-DEMO-DRY リファクタリング計画

## 問題の概要

ヒントデモ（`HintOverlay`）と通常プレイ（`usePlayEngine`）がコマンド実行に **別々のコードパス** を使っているため、挙動が乖離する。

### 現在のアーキテクチャ

```
通常プレイ (usePlayEngine.ts)
  キー入力 → CommandParser.feed() → executeCommand() → ダメージ計算 → state更新
  ※ パーサーはセッション全体で1インスタンス。insert session を ref で管理。

ヒントデモ (commandReplayer.ts → applyHintCommand)
  ヒントコマンド → [毎回新規] CommandParser → executeCommand() → state更新
  ※ パーサーをコマンドごとに作り直す。insert session の概念がない。

テスト (hintVerifier.test.ts → simulateHintCommands)
  ヒントコマンド → CommandParser.feed() → executeCommand()
  ※ パーサーは1インスタンス。insert session を手動追跡。3つ目の実装。
```

### 発生した実際のバグ

| バグ                                           | 原因                                                    |
| ---------------------------------------------- | ------------------------------------------------------- |
| ヒントデモで `?` 検索が `/` として実行される   | `applyHintCommand` が `parser.feed('/')` をハードコード |
| ダメージ計算が `?` 検索を認識しない            | `calculateHintDamage` が `/` のみチェック               |
| 潜在: パーサー状態がコマンド間で引き継がれない | 毎回 `new CommandParser()`                              |

---

## 設計方針: 統一 CommandSession

3つのコードパスを **1つの純粋関数モジュール** に統合する。

### 核心アイデア

`usePlayEngine` のロジック（パーサー管理、insert session管理、ダメージ計算）を **React依存のないピュアクラス `CommandSession`** に抽出する。ヒントデモ・テスト・通常プレイすべてがこの `CommandSession` を使う。

```
CommandSession (新規: engine/commandSession.ts)
  ├── parser: CommandParser       （セッション全体で1つ）
  ├── state: EditorState          （イミュータブル）
  ├── damage: number
  ├── insertSession: InsertSession | null
  │
  ├── feedKey(key: string): SessionResult    ← 1キー入力
  ├── feedHintCommand(cmd: string): void     ← ヒントコマンド1つ（内部でfeedKeyに展開）
  └── getSnapshot(): SessionSnapshot
```

### コードパスの統合

```
通常プレイ (usePlayEngine.ts)
  キー入力 → session.feedKey(key) → React state に反映

ヒントデモ (HintOverlay.tsx)
  ヒントコマンド → session.feedHintCommand(cmd) → React state に反映

テスト (hintVerifier.test.ts)
  ヒントコマンド → session.feedHintCommand(cmd) → アサーション
```

---

## 詳細設計

### 1. CommandSession クラス

```typescript
// src/engine/commandSession.ts

interface SessionSnapshot {
  editorState: EditorState
  damage: number
  mode: EditorMode
}

interface SessionResult {
  snapshot: SessionSnapshot
  executed: boolean // コマンドが実行されたか
  commandRaw: string // 実行されたコマンド文字列
  invalid: boolean // 無効なコマンドだったか
}

class CommandSession {
  private parser: CommandParser
  private state: EditorState
  private damage: number
  private insertSession: InsertSession | null
  private life: number

  constructor(config: {
    initialText: string
    initialCursor: CursorPosition
    availableCommands: readonly string[]
    baseCommands?: readonly string[]
    visualCommands?: readonly string[]
    life: number
  })

  /** 1キー入力を処理（通常プレイから呼ばれる） */
  feedKey(key: string): SessionResult

  /**
   * ヒントコマンド1つを処理（デモ・テストから呼ばれる）
   * 内部でキーストロークに展開し feedKey を呼ぶ
   */
  feedHintCommand(cmd: string): SessionResult

  /** 現在のスナップショットを返す */
  getSnapshot(): SessionSnapshot

  /** ダメージのみ計算（calculateHintDamage の代替） */
  static calculateDamage(commands: string[], config: SessionConfig): number
}
```

### 2. feedKey の実装（usePlayEngine.handleKey の移植）

`usePlayEngine.handleKey` の全ロジックを `feedKey` メソッドに移植する。変更点：

- `useState` → クラスフィールド
- `useRef` → クラスフィールド
- `setEditorState(next)` → `this.state = next`
- `setDamage(newDamage)` → `this.damage = newDamage`
- `setStatus('clear')` → `result.status = 'clear'`

### 3. feedHintCommand の実装

```typescript
feedHintCommand(cmd: string): SessionResult {
  // insert モード中: 文字をそのまま feedKey
  if (this.state.mode === 'insert' && cmd !== 'Esc') {
    let result: SessionResult
    for (const ch of cmd) {
      result = this.feedKey(ch)
    }
    return result!
  }

  // 検索コマンド: /pattern → '/', 各文字, 'Enter' に展開
  if (cmd.startsWith('/') || cmd.startsWith('?')) {
    this.feedKey(cmd[0])
    for (const ch of cmd.slice(1)) {
      this.feedKey(ch)
    }
    return this.feedKey('Enter')
  }

  // 通常コマンド: キーストロークに分解して feedKey
  const keys = tokenizeHintCommand(cmd)
  let result: SessionResult
  for (const key of keys) {
    result = this.feedKey(key)
  }
  return result!
}
```

### 4. usePlayEngine のリファクタリング

```typescript
// usePlayEngine.ts (リファクタリング後)
export function usePlayEngine(stage, baseCommands?, initialEditorState?) {
  const sessionRef = useRef(new CommandSession({ ... }))
  const [snapshot, setSnapshot] = useState(() => sessionRef.current.getSnapshot())

  const handleKey = useCallback((key: string) => {
    const result = sessionRef.current.feedKey(key)
    setSnapshot(sessionRef.current.getSnapshot())
    // clear/dead 判定は result から
  }, [])

  const reset = useCallback(() => {
    sessionRef.current = new CommandSession({ ... })
    setSnapshot(sessionRef.current.getSnapshot())
  }, [stage])

  return { ...snapshot, handleKey, reset, useHint }
}
```

### 5. HintOverlay のリファクタリング

```typescript
// HintOverlay.tsx (リファクタリング後)
function HintOverlay({ stage, onClose }) {
  const sessionRef = useRef(new CommandSession({ ... }))
  const [snapshot, setSnapshot] = useState(() => sessionRef.current.getSnapshot())

  useEffect(() => {
    // 各ステップで feedHintCommand を呼ぶ
    const result = sessionRef.current.feedHintCommand(commands[nextStep])
    setSnapshot(sessionRef.current.getSnapshot())
  }, [step])
}
```

### 6. calculateHintDamage の廃止

```typescript
// 旧: calculateHintDamage (独自のダメージ追跡ロジック)
// 新: CommandSession.calculateDamage (feedHintCommand 経由で統一)

static calculateDamage(commands, config): number {
  const session = new CommandSession(config)
  for (const cmd of commands) {
    session.feedHintCommand(cmd)
  }
  return session.damage
}
```

---

## 移行手順

### Phase 1: CommandSession 抽出（低リスク）

1. `src/engine/commandSession.ts` を新規作成
2. `usePlayEngine.handleKey` のロジックを `feedKey` に移植
3. `feedHintCommand` を実装（`feedKey` に委譲）
4. `calculateDamage` 静的メソッドを実装

**テスト**: 既存テストの `simulateHintCommands` を `CommandSession.feedHintCommand` に置き換えて全テスト通過を確認

### Phase 2: usePlayEngine 切り替え

1. `usePlayEngine` を `CommandSession` のラッパーに書き換え
2. 通常プレイの動作確認

**テスト**: 手動プレイテスト + 全既存テスト通過

### Phase 3: HintOverlay 切り替え + 旧コード削除

1. `HintOverlay` を `CommandSession.feedHintCommand` に切り替え
2. `applyHintCommand` を削除
3. `calculateHintDamage` を `CommandSession.calculateDamage` に置き換え
4. `hintVerifier.test.ts` の `simulateHintCommands` を削除

**テスト**: ヒントデモの手動確認 + 全テスト通過

---

## 削除されるコード

| ファイル               | 削除対象                     | 行数（概算） |
| ---------------------- | ---------------------------- | :----------: |
| `commandReplayer.ts`   | `applyHintCommand` 関数      |     ~60      |
| `commandReplayer.ts`   | `calculateHintDamage` 関数   |     ~55      |
| `hintVerifier.test.ts` | `simulateHintCommands` 関数  |     ~100     |
| `usePlayEngine.ts`     | `handleKey` 内のロジック大半 |     ~180     |
| **合計**               |                              |   **~395**   |

## 新規コード

| ファイル                 | 内容                    | 行数（概算） |
| ------------------------ | ----------------------- | :----------: |
| `commandSession.ts`      | `CommandSession` クラス |     ~250     |
| `commandSession.test.ts` | ユニットテスト          |     ~100     |
| **合計**                 |                         |   **~350**   |

**純削減: 約45行**。ただし本質的な効果はコード量ではなく **バグが構造的に発生しなくなる** こと。

---

## リスク・注意点

1. **undo/redo**: `usePlayEngine` の `stampDamageAtEntry` ロジックが `CommandSession` に移る。undo 時のダメージ復元が正しく動くかテストが必要
2. **spell 履歴**: `SpellEntry[]` の管理も `CommandSession` に含める（下記判断事項参照）
3. **React state の同期**: `CommandSession` はミュータブルなクラスなので、React 側では `getSnapshot()` でイミュータブルなスナップショットを取得して `useState` に反映する必要がある
4. **search input UI**: 検索中（`/` を打ってから `Enter` までの間）の UI 表示は `parserBuffer` 経由。これも `CommandSession` に含める

---

## 判断事項

### D1: ミュータブルclass vs イミュータブル純粋関数

**決定: A) ミュータブルclass**

理由:

- `usePlayEngine` が既に `useRef` でミュータブルなパーサーと insert session を管理している
- React の `useRef` パターンと自然に対応する
- パーサー + state + damage + insertSession を1つのオブジェクトにまとめることで凝集度が上がる
- エンジンの低レベル純粋関数（commandExecutor 等）はそのまま維持。CommandSession はそれらを束ねるオーケストレーター層

### D2: spell 履歴の管理場所

**決定: CommandSession に含める**

理由:

- spell エントリはダメージと1:1対応（各エントリに damage フィールドがある）
- 分離すると「ダメージは加算したが spell は記録し忘れ」のバグが起きうる
- テスト・ヒントデモでは `spells` を単に無視すればよい（コストゼロ）

### D3: 検索の Enter ハンドリング

**決定: feedKey ベースの自然な処理に統一**

ヒント `['/foo', 'Enter']` は:

1. `feedHintCommand('/foo')` → `feedKey('/')`, `feedKey('f')`, `feedKey('o')`, `feedKey('o')` に展開
2. `feedHintCommand('Enter')` → `feedKey('Enter')` に展開

パーサーが `/` で searchInput 状態に入り、文字を蓄積、Enter で検索コマンドを emit。
通常プレイと完全に同じパス。`calculateHintDamage` の `skipNext` ハックは不要になる。

---

## 優先度判定

- **緊急度**: 中（既知バグは個別修正済み。今後の機能追加でバグ再発リスクあり）
- **工数**: 中（Phase 1-3 合計で推定3-4時間）
- **効果**: 高（DRY 違反の根本解決。新コマンド追加時にヒントデモとの乖離が構造的になくなる）

---

## 実装ログ

### Phase 1 完了 ✅

`src/engine/commandSession.ts` を作成。`feedKey()` + `feedHintCommand()` + `calculateDamage()` を実装。

hintVerifier.test.ts に2つの新テストスイートを追加（全ステージでの replay + damage 検証）。416テスト全パス。

### D4: skipDamageIfUnchanged フラグ

**決定: SessionConfig にフラグ追加（デフォルト true）**

問題:

- `feedKey` は「テキスト・カーソル・モード・viewportTop が変化しなければダメージスキップ」ロジックを持つ（壁にぶつかった時の救済）
- しかし `calculateHintDamage` はスキップしない（ヤンク等レジスタだけ変わるコマンドもカウント）
- 統一すると yank 等のダメージが消える

解決: `skipDamageIfUnchanged` フラグ。通常プレイ = true、calculateDamage = false。

### D5: noClearCheck フラグ

**決定: SessionConfig にフラグ追加（デフォルト false）**

問題:

- `feedKey` はステージクリア判定でステータスを `clear` に変更 → 以降のキー入力を無視
- `calculateDamage` は全コマンドを処理してダメージ合計を出す必要がある

解決: `noClearCheck: true` で `calculateDamage` 時のみクリア判定を無効化。

### Phase 2-3 完了 ✅

**Phase 2: usePlayEngine 切り替え**

- `handleKey` を ~180行 → ~30行に縮小。`CommandSession.feedKey()` のラッパーに
- `sessionRef` で `CommandSession` インスタンスを保持、`handleKey` の deps は `[]`（stale closure なし）
- `createSession` を `useCallback` で定義し、`reset` の依存配列を `[createSession]` に

**Phase 3: HintOverlay 切り替え + 旧コード削除**

- `HintOverlay` を `CommandSession.feedHintCommand()` ベースに切り替え
- `hintVerifier.test.ts` から `simulateHintCommands` (~100行) を削除、`CommandSession` のみ使用
- `damageModel.test.ts` の `calculateHintDamage` を `CommandSession.calculateDamage` に置換
- `commandReplayer.ts` を削除（`applyHintCommand` + `calculateHintDamage`）

**結果**: 6ファイル変更、+154 / -780行。3つのコードパスが `CommandSession` 1つに統一。
全1769テスト通過。コミット: de129c3 (Phase 1), dadb82b (Phase 2-3)。
