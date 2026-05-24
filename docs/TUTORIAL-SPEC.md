# TUTORIAL-SPEC — インタラクティブチュートリアル仕様書

> **バージョン**: 1.1  
> **最終更新**: 2026-05-24  
> **根拠**: TUTORIAL-REVIEW.md（T1〜T10 全件確定）  
> **関連**: STAGE-SPEC.md（ステージ設計）、UI-SPEC.md（UI仕様）、IMPL-SPEC.md（実装仕様）

---

## 1. 概要

武器（新コマンド）取得時に発動する**スキップ可能なステップバイステップチュートリアル**。ナビゲーターキャラクターが1手ずつ指示し、指示以外のキー入力は受け付けない完全誘導型。

チュートリアルには2種類がある:

- **N01ステージ別チュートリアル**: N01の5ステージそれぞれに紐づくチュートリアル。N01連続プレイ中、各ステージの前に自動表示
- **ノード別チュートリアル**: Weapon Get後に発動する従来型（N15, N24, N32）

### 1.1 目的

- 新コマンドの使い方を「体で覚える」体験を提供
- undoの存在を早期に教え、安心感を与える
- 経験者はスキップ可能（強制しない）

### 1.2 チュートリアルの位置づけ

| 学習段階                  | 仕組み                       | 内容                                            |
| ------------------------- | ---------------------------- | ----------------------------------------------- |
| **1. チュートリアル**     | ガイド付き練習（本仕様）     | ナビが1手ずつ指示。指示通り押すだけ             |
| **2. Teachステージ**      | 自力プレイ（STAGE-SPEC準拠） | ガイドなし。新コマンド1回で解ける簡単なステージ |
| **3. Practice/Challenge** | 応用（STAGE-SPEC準拠）       | 複数箇所、複合操作                              |

---

## 2. 画面フロー

### 2.1 ノード別チュートリアル（N15, N24, N32）

```
ノードの全ステージクリア
    → [Weapon Get画面]          ← 新武器の名前・キー表示（TRY ITなし）
    → [チュートリアル]           ← 本仕様（スキップ可能）
    → [ツリー画面]              ← 次のノード/ステージ選択
```

### 2.2 N01ステージ別チュートリアル

```
Landing
    → [N01-1チュートリアル] → [N01-1ステージ]
    → [N01-2チュートリアル] → [N01-2ステージ]
    → [N01-3チュートリアル] → [N01-3ステージ]
    → [N01-4チュートリアル] → [N01-4ステージ]
    → [N01-5チュートリアル] → [N01-5ステージ]
    → [ツリー画面（初表示）]
```

N01はツリー非表示で連続プレイ。各ステージの前にステージ別チュートリアルが自動発動。
Weapon Get画面はなし（N01にはWeaponの概念がない）。

- チュートリアル対象ノード: WeaponのTRY ITを省略し、チュートリアルが代替。完了/スキップ後にツリー画面へ
- チュートリアルが存在しないノード: Weapon Get（TRY ITあり）後に直接ツリー画面へ

---

## 3. 対象ノード

### 3.1 チュートリアル付きノード

#### N01 ステージ別チュートリアル（5件）

| ステージ  | 新概念              | ステップ数目安 | 特記事項                  |
| --------- | ------------------- | -------------- | ------------------------- |
| **N01-1** | 基本移動（h/l）     | 6-8            | ゲーム最初の操作体験      |
| **N01-2** | 上下移動（j/k）     | 5-6            | 上下移動の導入            |
| **N01-3** | 単語移動（w/b/e）   | 5-6            | 文字単位→単語単位の飛躍   |
| **N01-4** | 初の編集（x）+ undo | 6-8            | undo（u）導入を含む       |
| **N01-5** | Insertモード（i/a） | 6-8            | モード概念の導入、Esc復帰 |

#### ノード別チュートリアル（3件）

| ノード  | 新概念                      | ステップ数目安 | 特記事項                    |
| ------- | --------------------------- | -------------- | --------------------------- |
| **N15** | オペレータ+モーション（dw） | 5-7            | Vim文法の核心（d + motion） |
| **N24** | TextObj（iw/aw）            | 5-6            | テキストオブジェクト概念    |
| **N32** | Visualモード（v/V）         | 5-7            | 3つ目のモード導入           |

### 3.2 チュートリアルなしノード（33ノード）

武器取得画面（Weapon Get）のコマンド説明 + Teachステージで対応。

---

## 4. ステップ設計

### 4.1 TutorialStep型

```typescript
type TutorialStepType = 'key' | 'hold_space' | 'colon_command'

interface TutorialStep {
  message: string // ナビゲーターのセリフ
  type?: TutorialStepType // ステップ種別（省略 = 'key'）
  expectedKey: string | null // 正解キー（null = 任意キーで次へ）
  acceptedKeys?: string[] // 受け付ける全キー（省略 = expectedKeyのみ）
  colonCommand?: string // colon_command用: 期待するコマンド（':h', ':e!', ':q!'）
  editorSetup?: {
    // ステップ開始時のエディタ状態（省略 = 前ステップ引き継ぎ）
    text: string
    cursor: { line: number; col: number }
  }
  wrongKeyMessage?: string // 誤入力時メッセージ（省略 = デフォルト）
}

interface Tutorial {
  nodeId: string // 対象ノードID
  stageId?: string // 紐づくステージID（省略可）
  initialSetup: {
    // チュートリアル全体の初期状態
    text: string
    cursor: { line: number; col: number }
  }
  steps: TutorialStep[] // ステップ配列
}
```

### 4.2 ステップ種別

#### type = 'key'（デフォルト）

| 種別         | expectedKey | acceptedKeys        | 用途                                      |
| ------------ | ----------- | ------------------- | ----------------------------------------- |
| **指示実行** | `'l'`       | 省略                | 「lを押せ」→ l のみ受付                   |
| **複数許可** | `'l'`       | `['h','j','k','l']` | 「移動してみろ」→ 移動キー全部OK、lで次へ |
| **説明のみ** | `null`      | 省略                | 「覚えておけ」→ 任意キーで次へ            |
| **自由練習** | `'Enter'`   | `['h','j','k','l']` | 「自由に動け。終わったらEnter」           |

#### type = 'hold_space'

| 項目        | 仕様                                                           |
| ----------- | -------------------------------------------------------------- |
| expectedKey | `null`                                                         |
| トリガー    | Space キーを500ms以上ホールドして離す                          |
| ホールド中  | ゴールテキストオーバーレイを表示（プレイ画面のビジョンと同様） |
| 離した時    | 500ms以上: 次のステップへ / 未満: 「もっと長く押せ」表示       |
| その他キー  | 「Space を長押ししろ」と表示                                   |

#### type = 'colon_command'

| 項目         | 仕様                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| expectedKey  | `null`                                                                                                |
| colonCommand | 期待するコマンド文字列（`:h`, `:e!`, `:q!`）                                                          |
| 入力方法     | `:` で入力開始 → 文字入力 → Enter で確定                                                              |
| 正解時の効果 | `:h` → HintOverlayを表示（閉じたら次へ）、`:e!` → エディタリセット → 次へ、`:q!` → チュートリアル終了 |
| 不正解時     | コマンドをクリアし、期待コマンドを再表示                                                              |
| Escape       | バッファ中: バッファクリア / 空: チュートリアルスキップ                                               |

### 4.3 具体例: N01-1チュートリアル（基本移動 + UI操作導入）

```typescript
export const N01_1_TUTORIAL: Tutorial = {
  stageId: 'N01-1',
  nodeId: 'N01',
  initialSetup: {
    text: 'hello!',
    cursor: { line: 0, col: 0 },
  },
  steps: [
    { message: 'l を押してみろ', expectedKey: 'l' },
    { message: 'もう一度 l だ', expectedKey: 'l' },
    { message: '今度は h で左に戻れ', expectedKey: 'h' },
    {
      message: 'Space を長押ししてゴールを確認しろ。離すと戻る',
      type: 'hold_space',
      expectedKey: null,
    },
    {
      message:
        'ゴールが浮かんだだろう？ 困ったら :h で答えを再生できるぞ（☆1確定）。プレイ中は画面右下に表示されるキューブでもOKだ',
      type: 'colon_command',
      colonCommand: ':h',
      expectedKey: null,
    },
    {
      message: ':e! でリトライだ。試してみろ',
      type: 'colon_command',
      colonCommand: ':e!',
      expectedKey: null,
    },
    {
      message: ':q! でツリーに戻れる（Esc でも可）。さぁ、右端を目指せ',
      expectedKey: null,
    },
  ],
}
```

### 4.4 具体例: N01-4チュートリアル（x + undo導入）

```typescript
export const N01_4_TUTORIAL: Tutorial = {
  stageId: 'N01-4',
  nodeId: 'N01',
  initialSetup: {
    text: 'hello world',
    cursor: { line: 0, col: 0 },
  },
  steps: [
    {
      message: 'xは目の前の文字を消す武器だ。押してみろ',
      expectedKey: 'x',
    },
    {
      message: 'もう一度。xで文字を消せ',
      expectedKey: 'x',
    },
    {
      message: 'おっと、消しすぎたな。大丈夫、uを押せば元に戻せる',
      expectedKey: 'u',
    },
    {
      message: 'もう一度uだ。何回でも戻せるぞ',
      expectedKey: 'u',
    },
    {
      message: 'これがundo。いつでも使える安全網だ。覚えておけ',
      expectedKey: null, // 任意キーで次へ
    },
  ],
}
```

---

## 5. ナビゲーターUI

### 5.1 表示仕様

| 項目         | 仕様                                                 |
| ------------ | ---------------------------------------------------- |
| 表示位置     | 画面下部固定バー（通常プレイ時のHAND領域を差替え）   |
| レイアウト   | RPG会話ウィンドウ風: 左にアイコン + 名前、右にセリフ |
| キャラクター | アイコン（小さなドット絵 or シンプルアバター）+ 名前 |
| HAND（手札） | チュートリアル中は非表示                             |
| 背景         | エディタ領域と同じダークテーマ（#1a1a2e系）          |

### 5.2 チュートリアル中の画面構成

```
┌──────────────────────────────────────────────────┐
│ ステータスバー（ライフ非表示 / モード表示）          │
├──────────────────────────────────────────────────┤
│                                                  │
│  エディタ領域                                      │
│  （チュートリアル用テキスト表示）                     │
│                                                  │
├──────────────────────────────────────────────────┤
│ [Skip ▸]                                         │
│ ┌────┐                                           │
│ │ ◇  │ ナビゲーター: 「lを押してみろ！」             │
│ └────┘  （ミニ回転キューブ）                        │
└──────────────────────────────────────────────────┘
```

- ナビゲーターアイコンはプレイ画面の NavigatorCube と統一されたミニ3Dキューブ（CSS）

---

## 6. 入力制御

### 6.0 サウンド

チュートリアル中のキー入力には `playTick()` を再生する（正解キー・acceptedKeys内キーとも）。Skipボタン押下時も `playTick()` を再生。`:h` コマンド実行時は `playHint()` を再生。誤入力時のサウンドはなし（無視のみ）。

### 6.1 キー入力ルール

#### type = 'key'（デフォルト）

| 入力              | 挙動                               |
| ----------------- | ---------------------------------- |
| `expectedKey`     | コマンド実行 → 次のステップへ      |
| `acceptedKeys` 内 | コマンド実行（ステップは進まない） |
| それ以外のキー    | 無視 + ナビが期待キーを再表示      |
| `Esc`（スキップ） | チュートリアル全体を終了           |
| 修飾キー単体      | 無視（Shift/Alt/Ctrl/Meta）        |

#### type = 'hold_space'

| 入力              | 挙動                                         |
| ----------------- | -------------------------------------------- |
| Space 長押し+離す | 500ms以上: 次のステップへ / 未満: エラー表示 |
| Esc               | チュートリアル全体を終了                     |
| その他キー        | 「Space を長押ししろ」と表示                 |

#### type = 'colon_command'

| 入力               | 挙動                                |
| ------------------ | ----------------------------------- |
| `:` → 文字 → Enter | colonCommandと一致: 効果実行 → 次へ |
| 不一致 + Enter     | エラー表示 + バッファクリア         |
| Escape             | バッファ中: クリア / 空: スキップ   |
| Backspace          | バッファ末尾削除                    |

### 6.2 誤入力時の表示

期待キーを固定メッセージで再表示:

```
「{expectedKey}を押すんだ」
```

### 6.3 ダメージ/ライフ

チュートリアル中はダメージ・ライフの概念なし。自由に操作させる。

---

## 7. スキップ機能

| 項目           | 仕様                                   |
| -------------- | -------------------------------------- |
| 粒度           | チュートリアル全体（ステップ単位不可） |
| 操作方法       | `Esc` キー or 画面隅「Skip」ボタン     |
| スキップ後     | ツリー画面へ遷移                       |
| 確認ダイアログ | なし（即スキップ）                     |

> N01ステージ別チュートリアルもスキップ可能。スキップするとそのステージのプレイに直接進む（ステージ自体はスキップ不可）。

---

## 8. 永続化

### 8.1 保存データ

```typescript
// GameProgress に追加
tutorialStatus: Record<string, 'completed' | 'skipped'>
```

### 8.2 挙動

| 状態           | チュートリアル表示 |
| -------------- | ------------------ |
| 未記録（初回） | 表示する           |
| `'completed'`  | 表示しない         |
| `'skipped'`    | 表示しない         |

途中状態の保存は不要（チュートリアルは短時間で完了するため）。

---

## 9. データ管理

### 9.1 ファイル構成

```
data/
├── stages/           # ステージデータ（既存）
│   └── ...
└── tutorials/        # チュートリアルデータ
    ├── N01-1.ts      # N01ステージ別チュートリアル（5件）
    ├── N01-2.ts
    ├── N01-3.ts
    ├── N01-4.ts
    ├── N01-5.ts
    ├── N15.ts        # ノード別チュートリアル（3件）
    ├── N24.ts
    ├── N32.ts
    └── index.ts      # getTutorial(stageId, nodeId) マッピング
```

### 9.2 index.ts

```typescript
import { N01_1_TUTORIAL } from './N01-1'
import { N01_2_TUTORIAL } from './N01-2'
import { N01_3_TUTORIAL } from './N01-3'
import { N01_4_TUTORIAL } from './N01-4'
import { N01_5_TUTORIAL } from './N01-5'
import { N18_TUTORIAL } from './N15'
import { N21_TUTORIAL } from './N24'
import { N21_TUTORIAL } from './N32'

// N01ステージ別チュートリアル: stageId で検索
const STAGE_TUTORIALS: Record<string, Tutorial> = {
  'N01-1': N01_1_TUTORIAL,
  'N01-2': N01_2_TUTORIAL,
  'N01-3': N01_3_TUTORIAL,
  'N01-4': N01_4_TUTORIAL,
  'N01-5': N01_5_TUTORIAL,
}

// ノード別チュートリアル: nodeId で検索
const NODE_TUTORIALS: Record<string, Tutorial> = {
  N15: N18_TUTORIAL,
  N24: N21_TUTORIAL,
  N32: N21_TUTORIAL,
}

/** stageId優先 → nodeIdフォールバック */
export function getTutorial(stageId: string, nodeId: string): Tutorial | undefined {
  return STAGE_TUTORIALS[stageId] ?? NODE_TUTORIALS[nodeId]
}

export function hasTutorial(stageId: string, nodeId: string): boolean {
  return getTutorial(stageId, nodeId) !== undefined
}
```

---

## 付録A: 全決定事項一覧

| ID  | 項目           | 決定                                                                 |
| --- | -------------- | -------------------------------------------------------------------- |
| T1  | 発動タイミング | Weapon Get直後。チュートリアル→ツリー→Teach                          |
| T2  | ステップ構造   | message + expectedKey + acceptedKeys + editorSetup + wrongKeyMessage |
| T3  | ナビゲーターUI | キャラ付き下部バー（HAND非表示にして差替え）                         |
| T4  | 誤入力の扱い   | 無視 + ナビが期待キー再表示。固定メッセージ                          |
| T5  | undo教育       | N01-4で導入。x消しすぎ→u復元                                         |
| T6  | スキップ       | 全体スキップ。Esc + Skipボタン。N01ステージ別もスキップ可            |
| T7  | 対象ノード     | N01ステージ別×5 + ノード別×3（N15,N24,N32）= 合計8件                 |
| T8  | Teachとの関係  | 両方残す。チュートリアル=練習、Teach=実戦                            |
| T9  | データ形式     | data/tutorials/ 専用ディレクトリ。getTutorial(stageId,nodeId)        |
| T10 | 永続化         | GameProgressにtutorialStatus追加。completed/skippedのみ              |
