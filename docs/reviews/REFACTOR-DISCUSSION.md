# リファクタリング議論メモ

## 1. tutorials と stages のファイル分離問題

### 現状

- `src/data/stages/N*.ts` — ステージデータ（`Stage`型）
- `src/data/tutorials/N*.ts` — チュートリアルデータ（`Tutorial`型）
- 完全に別ファイル・別型。`tutorials/index.ts` で stageId をキーにして紐付け

### Stage が持つデータ

```
id, nodeId, type, title, language,
initialText, goalText, initialCursor,
life, stars, availableCommands, visualCommands,
clearConditions, hints, flavor
```

### Tutorial が持つデータ

```
nodeId, stageId, newCommands,
initialSetup?, steps[]
```

### 問題点

- Tutorial は Stage に 1:1 で紐づくのに、別ファイルで管理している
- `newCommands`（そのステージで新しく習うコマンド）は Stage 側にあるべきデータ
- チュートリアルの steps が空のスタブが大量にある

### 提案: Stage に統合

```typescript
interface Stage {
  // ...既存フィールド...
  newCommands: string[] // ← Tutorial.newCommands を移動
  tutorial?: TutorialStep[] // ← Tutorial.steps を移動（なければ省略）
  tutorialSetup?: { text: string; cursor: CursorPosition } // ← Tutorial.initialSetup
}
```

- `tutorials/` ディレクトリ丸ごと削除
- `newCommands` は全ステージに必須（practice/challenge は空配列）
- `tutorial` は任意（steps があるステージだけ）

### 影響範囲

- `TutorialScreen.tsx` — `getTutorial()` → `stage.tutorial` を参照
- `PlayScreen.tsx` — `getTutorial()` → `stage.tutorial` を参照
- `SkillTreeScreen.tsx` — `hasTutorial()` → `stage.tutorial != null` に
- `dataIntegrity.test.ts` — Tutorial 整合性テスト修正
- `hintVerifier.test.ts` — 変更なし

---

## 2. availableCommands の役割整理

### 現状の使い分け

| データ                    | 用途                                   | 参照箇所                                                 |
| ------------------------- | -------------------------------------- | -------------------------------------------------------- |
| `stage.availableCommands` | **手札カード**（プレイ画面のHAND）     | `CardPanel.tsx`, `commandParser.ts`, `commandSession.ts` |
| `tutorial.newCommands`    | **ステージ選択画面のコマンド表示**     | `SkillTreeScreen.tsx`                                    |
| `stage.visualCommands`    | Visual モード時のみ追加される手札      | `CardPanel.tsx`, `commandParser.ts`                      |
| `getBaseForStage()`       | そのノードまでに習得済みのBASEコマンド | `constants.ts` → `CardPanel.tsx`                         |

### 手札の決定ロジック（`commandParser.ts`）

```
有効手札 = BASE + availableCommands + (visual時は visualCommands)
```

- `availableCommands` は**そのステージで使えるカード**
- `newCommands` は**そのステージで新しく習うコマンド**（⊆ availableCommands）
- 例: N06-Ta は `availableCommands: ['*', '#', '/']` だが `newCommands: ['*', '#']`
  - `/` は前のステージで習得済みだが手札として使える

### ステージ選択画面に表示すべきもの

→ `newCommands` のみ（現状のチュートリアルがある場合は正しい）
→ チュートリアルがないスタブは `availableCommands` をフォールバック表示している（暫定）
→ Stage に `newCommands` を統合すれば常に正しく表示可能

---

## 3. チュートリアルのクリア判定・チェックマーク

### 現状のフロー

1. ステージクリック → `PlayScreen` へ遷移
2. `PlayScreen` でチュートリアルがあり未完了なら → `TutorialScreen` にリダイレクト
3. `TutorialScreen` 完了 → `tutorialStatus[stageId]` を保存 → `PlayScreen` に戻る
4. 2回目以降: `tutorialStatus` が存在するのでリダイレクトせず直接プレイ
5. ステージ選択画面: teach/tutorial ステージは `stageResults[stageId].bestStars > 0` で ✓ 表示

### 問題点

- チュートリアルは「クリアしてもしなくても関係ない」→ 初回は強制表示、2回目以降はスキップでよい
- teach ステージの ✓ マークは `stageResults` のクリア状態に基づく（チュートリアル完了とは別）
- teach ステージにもスコアリング（stars, life, damage）がある — これは必要？

### 提案

- **teach ステージの ✓ は維持**: ステージ自体のクリアを示すので意味がある
  - ただし teach は `isScoredStage() = false` なので星は表示されない（✓ のみ）
  - 「一度はクリアした」の記録として有用
- **tutorialStatus の必要性**: 初回チュートリアル→プレイの遷移制御に使っている
  - もし「常にチュートリアル表示」にするなら tutorialStatus 不要
  - もし「初回のみチュートリアル」を維持するなら必要
- **別の選択肢**: `stageResults[stageId]` の存在で判定（一度でもクリア or 挑戦した = チュートリアル済み）

### 結論待ち

- teach のチェックマーク: 残す？消す？
- チュートリアル初回強制表示: 維持？廃止（常に📖ボタンから任意閲覧）？
