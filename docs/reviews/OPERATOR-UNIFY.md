# Operator 統一リファクタリング計画

## 背景

エグゼキュータで doubled operator（dd/cc/yy/>>/<<）が個別実装されている。
本来 Vim の operator は「対象範囲を決定 → operator を適用」の2段階で、
doubled は「行全体を対象範囲にする」という汎用ルールに過ぎない。

## 現状の問題

### 1. dd/cc/yy の個別実装

```typescript
// commandExecutor.ts L404-435 — 3つの if ブロックが並列
if (cmd.operator === 'd' && raw.includes('dd')) → executeDeleteLine()
if (cmd.operator === 'c' && raw.includes('cc')) → インライン実装
if (cmd.operator === 'y' && raw.includes('yy')) → インライン実装
if (cmd.operator === '>' && raw.includes('>>')) → executeIndent()
if (cmd.operator === '<' && raw.includes('<<')) → executeDedent()
```

### 2. operator+motion でも同じ operator 分岐の重複

```typescript
// operators.ts executeOperatorMotion — d/c/y/gu/gU/g~/>/< の if チェーン
if (operator === 'd') { deleteRange → registers }
if (operator === 'c') { deleteRange → insert mode }
if (operator === 'y') { slice → registers }
if (operator === '>') { executeIndentLines }
if (operator === '<') { executeDedentLines }
```

### 3. count バグ

- `3yy`: count 無視（1行しかヤンクしない）
- `3cc`: count 無視（1行しか変更しない）

## リファクタリング方針

**「対象範囲の決定」と「operator の適用」を分離する。**

### Phase 1: applyOperator を導入

全ての operator（d/c/y/>/</gu/gU/g~）の「範囲に対する操作」を統一関数にまとめる。

```typescript
interface OperatorRange {
  from: number // テキスト内の開始オフセット
  to: number // テキスト内の終了オフセット（inclusive）
  linewise: boolean // 行単位操作か
}

function applyOperator(state: EditorState, operator: string, range: OperatorRange): EditorState
```

### Phase 2: doubled operator を汎用化

```typescript
// Before (5つの個別 if)
if (cmd.operator === 'd' && raw.includes('dd')) { ... }
if (cmd.operator === 'c' && raw.includes('cc')) { ... }

// After (1つの汎用ブロック)
if (cmd.operator && !cmd.motion && !cmd.textObject) {
  const range = resolveLineRange(state, cmd.count ?? 1)
  return applyOperator(state, cmd.operator, range)
}
```

### Phase 3: operator+motion を applyOperator 経由に変更

```typescript
// Before
export function executeOperatorMotion(state, cmd) {
  const target = resolveMotion(...)
  if (operator === 'd') { ... }
  if (operator === 'c') { ... }
  if (operator === 'y') { ... }
}

// After
export function executeOperatorMotion(state, cmd) {
  const target = resolveMotion(...)
  const range = motionToRange(state, target, motion)
  return applyOperator(state, cmd.operator, range)
}
```

### Phase 4: operator+textobj を applyOperator 経由に変更

同様に `resolveTextObject` → `OperatorRange` → `applyOperator` の流れに統一。

## applyOperator の中身

```typescript
function applyOperator(state, operator, range): EditorState {
  switch (operator) {
    case 'd':
    // テキスト削除 + registers に保存
    // linewise ならカーソルを次行先頭に
    case 'c':
    // テキスト削除 + registers に保存 + insert mode
    // linewise ならインデント保持
    case 'y':
    // registers にコピー（テキスト変更なし）
    case '>':
    // linewise のみ。range 内行をインデント
    case '<':
    // linewise のみ。range 内行をデデント
    case 'gu': // 小文字化
    case 'gU': // 大文字化
    case 'g~': // トグル
  }
}
```

## 影響範囲

| ファイル                      | 変更内容                                                                                                                    |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `executors/operators.ts`      | `applyOperator`, `resolveLineRange`, `motionToRange` 追加。`executeOperatorMotion` / `executeOperatorTextObject` を書き換え |
| `commandExecutor.ts`          | dd/cc/yy/>>/<<の5つのifブロックを1つの汎用ブロックに置換                                                                    |
| `executors/normalCommands.ts` | `executeDeleteLine` は `applyOperator` に吸収されるため削除可能                                                             |

## バグ修正

- `3yy`: resolveLineRange で count 行を対象にすることで自動修正
- `3cc`: 同上

## リスク

- cc のインデント保持ロジック: applyOperator 内の `case 'c'` + `linewise: true` で対応
- D/C/Y ショートカット: これらは doubled ではなく独立コマンドなので影響なし
- テスト: 1806テストが保護ネットとして機能

## 実装順序

1. `applyOperator` + `resolveLineRange` を新規追加（既存コードに触れない）
2. doubled operator（commandExecutor.ts）を `applyOperator` に切り替え
3. テスト通過確認
4. `executeOperatorMotion` を `applyOperator` に切り替え
5. テスト通過確認
6. `executeOperatorTextObject` を `applyOperator` に切り替え
7. テスト通過確認
8. 不要になった関数を削除
