# コマンド分類体系の再設計

## 背景

`SkillNodeDef.commands` が operator+motion の全組み合わせを列挙している（例: `dw, de, db, d$, d0, cw, ...`）。
チュートリアルに「教えるコマンド」フィールドがなく、ノードが教えるべきコマンドとチュートリアルの対応をテストで検証できない。

## 決定事項

### D1: SkillNodeDef.commands を概念型に変更

operator+motion の組み合わせを列挙せず、operator 単体で1コマンドとする。

- `['dw', 'de', 'db', 'd$', 'd0', 'cw', ...]` → `['d', 'c', 'y', 'p', 'P']`
- UI（スキルツリー、WeaponGet、結果画面）も概念型で表示される

### D2: TextObj は種別ごとに個別列挙（t 抜き）

`['w', 's', 'p', '"', "'", '(', '{', '[', '<']`

- `iw/aw` → `w`、`is/as` → `s`、`ip/ap` → `p`
- 各デリミタを個別に列挙
- `t`（タグ）は未導入のため含めない

### D3: dd/cc/yy は d/c/y に暗黙吸収

d を持っていれば dd は常に使える。独立コマンドとして扱わない。
→ N07（行単位操作）の commands は空配列 `[]`

### D4: >>/<< も >/< に暗黙吸収

dd/cc/yy と同じパターン。`>` を持っていれば `>>` は使える。

### D5: レジスタは `"` 1エントリに統一

`['"a', '"0', '"+']` → `['"']`

### D6: コマンド名の衝突は許容

`w`（N01 モーション）と `w`（N06 TextObj）が同じ名前で別ノードに存在してよい。
テストはノード単位で検証するため問題なし。UI上も TextObj は独立カードを持たない。

### D7: Tutorial 型に newCommands フィールドを追加

```typescript
interface Tutorial {
  nodeId: string
  stageId: string
  newCommands: string[]  // ← 新規追加
  steps: TutorialStep[]
  initialSetup?: { ... }
}
```

- `newCommands`: このチュートリアルが新たに導入するコマンド
- 空配列 `[]` = 既習コマンドの復習チュートリアル

### D8: テスト — ノード commands とチュートリアル newCommands の完全一致

```
各ノード N について:
  node.commands == union(tutorial.newCommands for all tutorials with nodeId == N)
```

チュートリアル未作成のノードは `UNCOVERED_COMMANDS` セットで一時的にスキップ（TODO として管理）。

---

## 変更後の全ノード commands

| ノード | 名称               | commands                                | 変更点    |
| ------ | ------------------ | --------------------------------------- | --------- |
| N01    | モーション基礎     | `h j k l w b e 0 ^ $ gg G f t ; ,`      | なし      |
| N02    | 編集基礎           | `x X r i a I A o O`                     | なし      |
| N03    | モード概念         | `v R`                                   | なし      |
| N04    | 検索               | `/ ? n N * #`                           | なし      |
| N05    | オペレータ基礎     | `d c y p P`                             | 23→5      |
| N06    | TextObj            | `w s p " ' ( { [ <`                     | 28→9      |
| N07    | 行単位操作         | _(空)_                                  | 3→0       |
| N08    | Visual基礎         | `v V Ctrl+v o`                          | なし      |
| N09    | Visual応用         | `gn`                                    | なし      |
| N10    | レジスタ           | `"`                                     | 3→1       |
| N11    | ショートカット     | `D C Y S s J`                           | なし      |
| N12    | 構造ジャンプ       | `% ( ) { } [[ ]]`                       | なし      |
| N13    | 発展オペレータ     | `> < gu gU g~ ~`                        | >>→> <<→< |
| N14    | 発展モーション     | `W B E F T H M L`                       | なし      |
| N15    | 数値操作           | `Ctrl+a Ctrl+x`                         | なし      |
| N16    | スクロール＋マーク | `Ctrl+d Ctrl+u Ctrl+f Ctrl+b m ' \` gi` | なし      |
| N17    | 画面操作           | `zz zt zb Ctrl+e Ctrl+y`                | なし      |

## 影響範囲

- `src/types/tutorial.ts` — `newCommands` フィールド追加
- `src/types/game.ts` — 変更なし（commands の型は `string[]` のまま）
- `src/data/skillTree.ts` — N05, N06, N07, N10, N13 の commands 変更
- `src/data/tutorials/*.ts` — 全44チュートリアルに `newCommands` 追加
- `src/engine/dataIntegrity.test.ts` — 新テスト追加
- UI コンポーネント — 変更不要（表示値が変わるだけ）
- `isCommandLearnable` — 変更不要（既存のオペレータ展開ロジックで対応可能）
