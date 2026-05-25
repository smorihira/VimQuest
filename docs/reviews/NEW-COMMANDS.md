# 新コマンド実装計画

NODE-REDESIGN.md Rev.2 で追加が決まったコマンドのエンジン実装計画。

---

## 実装対象コマンド一覧

| #   | コマンド           | ノード                   | 難易度 | EditorState拡張                  |
| --- | ------------------ | ------------------------ | ------ | -------------------------------- |
| 1   | `{`, `}`           | N13 構造ジャンプ         | 低     | 不要                             |
| 2   | `H`, `M`, `L`      | N05 画面位置操作         | 低     | 不要                             |
| 3   | `Ctrl+e`, `Ctrl+y` | N05 画面位置操作         | 低     | 不要                             |
| 4   | `o` (Visual)       | N21 Visualモード         | 低     | 不要                             |
| 5   | `?`                | N06 検索                 | 中     | 不要（lastSearchDirection既存）  |
| 6   | `R`                | N03 1文字置換            | 中     | 不要（mode='insert'で代用可）    |
| 7   | `gi`               | N02 Insertバリエーション | 中     | **要: lastInsertPosition**       |
| 8   | `gv`               | N21 Visualモード         | 中     | **要: lastVisualStart/End/Type** |
| 9   | `Ctrl+a`, `Ctrl+x` | N15 数値操作             | 中     | 不要                             |
| 10  | `Ctrl+o`, `Ctrl+i` | N04 スクロール＆ジャンプ | 高     | **要: jumpStack, jumpIndex**     |

---

## 実装順序

難易度の低いものから実装し、EditorState 拡張が必要なものは後半にまとめる。

### バッチ1: モーション追加（State拡張なし）

#### 1. `{`, `}` — 段落ジャンプ

**動作**: 空行（空白のみの行を含む）を境界として段落単位で移動。

- `{`: カーソルから上方向に空行を探す。見つかればその行に移動、なければ先頭行へ。
- `}`: カーソルから下方向に空行を探す。見つかればその行に移動、なければ最終行へ。

**実装箇所**:

1. `commandParser.ts`: `SIMPLE_MOTIONS` に `{`, `}` を追加
2. `types/command.ts`: `Motion` 型に `{`, `}` を追加
3. `executors/motions.ts`: `resolveMotion()` に case 追加
   - `moveToParagraphUp(state, count)`: 空行を count 回上方に探索
   - `moveToParagraphDown(state, count)`: 空行を count 回下方に探索
4. オペレータ連携は自動（`d{`, `y}` 等はパーサーが処理済み）

#### 2. `H`, `M`, `L` — 画面内カーソル移動

**動作**: viewport 内の上端/中央/下端にカーソルを移動。最初の非空白文字に移動（`^` 相当）。

- `H`: `viewportTop` 行へ移動
- `M`: `viewportTop + VIEWPORT_HEIGHT/2` 行へ移動
- `L`: `viewportTop + VIEWPORT_HEIGHT - 1` 行へ移動（テキスト末尾を超えない）

**実装箇所**:

1. `commandParser.ts`: `SIMPLE_MOTIONS` に `H`, `M`, `L` を追加
2. `types/command.ts`: `Motion` 型に追加
3. `executors/motions.ts`: `resolveMotion()` に case 追加
   - 行頭の非空白文字位置（`^` ロジック再利用）

#### 3. `Ctrl+e`, `Ctrl+y` — 1行スクロール

**動作**: viewport を1行スクロール。カーソルが viewport 外に出たら viewport 内に戻す。

- `Ctrl+e`: viewportTop += 1、カーソルが上に出たら cursor.line = viewportTop
- `Ctrl+y`: viewportTop -= 1、カーソルが下に出たら cursor.line = viewportTop + VIEWPORT_HEIGHT - 1

**実装箇所**:

1. `commandParser.ts`: Ctrl コマンド処理部に `Ctrl+e`, `Ctrl+y` を追加
2. `executors/normalCommands.ts`: `executeScrollDown1()`, `executeScrollUp1()` を実装
3. `commandExecutor.ts`: dispatch に追加

#### 4. `o` (Visual モード) — 選択端切り替え

**動作**: Visual モードで `visualStart` と `cursor` を入れ替え。

**実装箇所**:

1. `commandExecutor.ts`: `executeVisualModeCommand()` 内に `o` の case 追加
2. `visualStart` ↔ `cursor` をスワップするだけ

### バッチ2: 検索＆特殊コマンド

#### 5. `?` — 後方検索

**動作**: `/` の逆方向版。パターン入力 → カーソルから後方に検索。

**実装箇所**:

1. `commandParser.ts`:
   - `handleIdle()` で `?` を検出 → `searchInput` ステートに遷移
   - `searchDirection` フラグを保持して Enter 時にコマンドに含める
   - Command に `searchDirection: 'backward'` をセット
2. `types/command.ts`: Command に `searchDirection?: 'forward' | 'backward'` 追加（既に `lastSearchDirection` は EditorState にある）
3. `executors/normalCommands.ts`:
   - `executeSearch()` を修正: direction パラメータ追加
   - 後方検索: カーソルから前方に向かってマッチを探す、見つからなければ末尾からラップ
4. `n`/`N` の挙動: `lastSearchDirection` に応じて方向が反転する（既存ロジック）

#### 6. `R` — リプレースモード

**動作**: Insert モードに入るが、文字を上書きする（挿入ではなく置換）。

**実装箇所**:

1. `commandParser.ts`: `INSTANT_COMMANDS` に `R` を追加
2. `types/editor.ts`: EditorState に `replaceMode?: boolean` を追加
3. `commandExecutor.ts`: `R` で `mode: 'insert', replaceMode: true` に遷移
4. `executors/insertMode.ts`: `executeInsertText()` を修正
   - `replaceMode` の場合: カーソル位置の文字を置換（行末では通常の挿入）
   - Esc で `replaceMode: false` に戻す

#### 7. `Ctrl+a`, `Ctrl+x` — 数値インクリメント/デクリメント

**動作**: カーソル位置またはカーソルより右にある数値を +1/-1 する。

**アルゴリズム**:

1. カーソル位置から右方向に数字を探す（`/\d+/` マッチ）
2. 見つかった数値を parseInt → +1 or -1
3. テキスト内の該当部分を置換
4. カーソルを数値の末尾に移動

**実装箇所**:

1. `commandParser.ts`: Ctrl コマンド処理部に追加
2. `executors/normalCommands.ts`: `executeIncrement()`, `executeDecrement()` を実装
3. `commandExecutor.ts`: dispatch に追加

### バッチ3: EditorState 拡張が必要なコマンド

#### 8. `gi` — 最後の Insert 位置に戻って Insert モード

**動作**: 最後に Insert モードを抜けた位置に移動して Insert に入る。

**EditorState 拡張**:

```typescript
lastInsertPosition?: CursorPosition  // Esc でInsertを抜けた時に記録
```

**実装箇所**:

1. `types/editor.ts`: `lastInsertPosition` フィールド追加
2. `commandParser.ts`: `gPending` ステートに `i` の case 追加
3. `commandExecutor.ts` or `executors/insertMode.ts`:
   - Esc 処理時に `lastInsertPosition` を記録
   - `gi` 実行時にその位置に移動 + Insert モード
4. `commandExecutor.ts`: dispatch に追加

#### 9. `gv` — 直前の Visual 選択を再選択

**動作**: 最後に Visual モードを抜けた時の選択範囲を復元。

**EditorState 拡張**:

```typescript
lastVisualStart?: CursorPosition
lastVisualEnd?: CursorPosition
lastVisualType?: 'char' | 'line' | 'block'
```

**実装箇所**:

1. `types/editor.ts`: 上記3フィールド追加
2. `commandParser.ts`: `gPending` ステートに `v` の case 追加
3. Visual モード終了時（Esc, d, y, c 等）に `lastVisual*` を記録
4. `gv` 実行時にそれらを復元して Visual モードに入る

#### 10. `Ctrl+o`, `Ctrl+i` — ジャンプリスト

**動作**: 大きな移動（検索, G, gg, %, {, } 等）のたびにジャンプリストに記録。`Ctrl+o` で戻り、`Ctrl+i` で進む。

**EditorState 拡張**:

```typescript
jumpList: CursorPosition[]  // ジャンプ履歴
jumpIndex: number           // 現在位置（-1: 末尾）
```

**ジャンプ記録対象**: G, gg, /, ?, n, N, \*, #, %, {, }, H, M, L

**実装箇所**:

1. `types/editor.ts`: `jumpList`, `jumpIndex` フィールド追加
2. `commandExecutor.ts`:
   - ジャンプ対象コマンド実行前に現在位置を `jumpList` に push
   - `jumpIndex` をリセット
3. `Ctrl+o`: `jumpIndex` をデクリメントしてその位置に移動
4. `Ctrl+i`: `jumpIndex` をインクリメントしてその位置に移動
5. `commandParser.ts`: Ctrl コマンド処理部に追加

---

## テスト方針

- 各コマンドの単体テストは `commandExecutor.test.ts` に追加
- パーサーのテストは `commandParser.test.ts` に追加
- `dataIntegrity.test.ts` は skillTree の commands に追加されたコマンドを自動検証
- 既存の 1039 テストが壊れないことを確認

---

## 実装状況

- [x] バッチ1-1: `{`, `}` 段落ジャンプ
- [x] バッチ1-2: `H`, `M`, `L` 画面内カーソル
- [x] バッチ1-3: `Ctrl+e`, `Ctrl+y` 1行スクロール
- [x] バッチ1-4: `o` (Visual) 選択端切り替え
- [x] バッチ2-5: `?` 後方検索
- [x] バッチ2-6: `R` リプレースモード
- [x] バッチ2-7: `Ctrl+a`, `Ctrl+x` 数値操作
- [x] バッチ3-8: `gi` 最後Insert位置
- [x] バッチ3-9: `gv` 再選択
- [x] バッチ3-10: `Ctrl+o`, `Ctrl+i` ジャンプリスト
