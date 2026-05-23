# IMPL-SPEC — 実装アーキテクチャ仕様書

> **バージョン**: 1.0  
> **最終更新**: 2026-05-23  
> **根拠**: IMPL-REVIEW.md（I1〜I5 全件確定）  
> **関連**: ENGINE-SPEC.md（エンジン仕様）、UI-SPEC.md（UI仕様）、STAGE-SPEC.md（ステージ設計）

---

## 1. 技術スタック

### 1.1 コア

| 観点           | 技術         | バージョン目安 |
| -------------- | ------------ | -------------- |
| 言語           | TypeScript   | 5.x            |
| フレームワーク | React        | 19.x           |
| ビルドツール   | Vite         | 6.x            |
| 状態管理       | Jotai        | 2.x            |
| CSS            | CSS Modules  | —              |
| ルーティング   | React Router | 7.x            |

### 1.2 専用ライブラリ

| 用途             | ライブラリ       | 役割                                |
| ---------------- | ---------------- | ----------------------------------- |
| コマンドパーサー | XState v5        | ステートマシンによるキー入力解析    |
| React統合        | @xstate/react    | `useMachine` フック                 |
| シンタックスHL   | Shiki            | VSCode同等精度のコードハイライト    |
| ツリーレイアウト | Dagre            | DAG自動座標計算                     |
| ツリー描画       | SVG（React JSX） | DOM要素として描画、CSS/イベント対応 |

### 1.3 開発ツール

| 用途             | ツール                              |
| ---------------- | ----------------------------------- |
| 状態遷移デバッグ | @statelyai/inspect（devDependency） |
| リンター         | ESLint                              |
| フォーマッター   | Prettier                            |
| テスト           | Vitest                              |

### 1.4 不採用とした技術

| 技術                 | 不採用理由                                       |
| -------------------- | ------------------------------------------------ |
| Next.js / Remix      | バックエンド不要のSPAに過剰                      |
| MUI / Radix UI       | ゲーム固有UIに汎用コンポーネント不要             |
| Tailwind CSS         | 好みに合わない、ダークテーマ固定で不要           |
| Redux / Zustand      | Jotaiのアトミック型が本プロジェクトに適合        |
| Canvas（ツリー）     | DOMイベント/CSS非対応、40ノード程度ならSVGで十分 |
| XState以外のパーサー | XState学習目的で採用                             |

---

## 2. プロジェクト構成

### 2.1 ディレクトリ構造

```
src/
├── main.tsx                          # エントリポイント
├── App.tsx                           # ルーティング定義
│
├── types/                            # ドメインモデル（型定義のみ）
│   ├── editor.ts                     # EditorState, CursorPosition, VimMode
│   ├── command.ts                    # Command, CommandType, KeySequence
│   ├── stage.ts                      # Stage, ClearConditions, StageResult
│   └── game.ts                       # GameProgress, SkillNode, StarRecord
│
├── engine/                           # ドメインロジック（React非依存）
│   ├── commandParser.ts              # XStateマシン定義
│   ├── commandExecutor.ts            # コマンド実行（純粋関数）
│   ├── damageCalculator.ts           # ダメージ計算
│   └── clearChecker.ts              # クリア条件判定
│
├── store/                            # Jotai atoms（アプリケーション状態）
│   ├── gameAtoms.ts                  # 進行状態（解放ノード、☆記録）
│   ├── editorAtoms.ts                # エディタ状態（テキスト、カーソル、モード）
│   └── uiAtoms.ts                    # UI状態（画面遷移、モーダル）
│
├── features/                         # 画面単位（feature-based co-location）
│   ├── landing/
│   │   └── Landing.tsx
│   │
│   ├── skillTree/
│   │   ├── SkillTree.tsx             # ページ本体
│   │   ├── components/
│   │   │   ├── TreeGraph.tsx         # Dagre + SVG描画
│   │   │   └── NodeTooltip.tsx       # ノード詳細表示
│   │   └── hooks/
│   │       └── useTreeLayout.ts      # Dagreレイアウト計算
│   │
│   ├── play/
│   │   ├── Play.tsx                  # ページ本体
│   │   ├── components/
│   │   │   ├── Editor.tsx            # テキスト表示（Shiki + カーソル）
│   │   │   ├── StatusBar.tsx         # ライフ / ダメージ / モード
│   │   │   ├── GoalPanel.tsx         # ゴールテキスト表示
│   │   │   └── HandPanel.tsx         # 手札（使用可能コマンド）
│   │   └── hooks/
│   │       ├── useKeyboardInput.ts   # キーイベント取得→XStateへ
│   │       └── usePlaySession.ts     # ゲームセッション管理
│   │
│   ├── result/
│   │   └── Result.tsx
│   │
│   ├── gameOver/
│   │   └── GameOver.tsx
│   │
│   ├── weaponGet/
│   │   └── WeaponGet.tsx
│   │
│   └── tutorial/
│       ├── Tutorial.tsx              # チュートリアル画面
│       └── components/
│           └── NavigatorBar.tsx       # ナビゲーター会話バー
│
├── shared/                           # 2箇所以上で使う共有モジュール
│   ├── hooks/
│   │   └── useLocalStorage.ts
│   └── utils/
│       └── localStorage.ts
│
├── data/                             # 静的ゲームデータ
│   ├── stages/                       # ノード別ステージ定義
│   │   ├── N01.ts
│   │   ├── N02.ts
│   │   ├── ...
│   │   └── index.ts                  # 全ステージ集約export
│   ├── tutorials/                    # チュートリアルデータ（7ノード分）
│   │   ├── N01.ts
│   │   ├── N02.ts
│   │   ├── ...                       # N03, N08, N18, N29, N37
│   │   └── index.ts                  # nodeId → Tutorial マッピング
│   └── skillTree.ts                  # ノード定義・エッジ・コマンドマッピング
│
└── styles/
    └── global.css                    # CSS変数、リセット、共通スタイル
```

### 2.2 設計原則

| 原則                | 内容                                                          |
| ------------------- | ------------------------------------------------------------- |
| ドメイン分離        | `types/` + `engine/` はReact非依存。単体テスト対象            |
| Feature co-location | 画面固有のcomponents/hooks/stylesは `features/画面名/` に配置 |
| 共有最小化          | `shared/` は2箇所以上で実際に使われるもののみ                 |
| Hook = Container    | カスタムフックがロジック担当、コンポーネントは描画のみ        |
| Layout不要          | 全画面フルスクリーン、共通ナビゲーションなし                  |

---

## 3. コマンドパーサー設計

### 3.1 アーキテクチャ

```
┌────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ KeyboardEvent  │────→│ XState Machine   │────→│ commandExecutor │
│ (useKeyboard)  │     │ (パース・判定)    │     │ (状態変更)       │
└────────────────┘     └──────────────────┘     └────────┬────────┘
                              │                           │
                              │ pending表示               │ 新EditorState
                              ▼                           ▼
                       ┌─────────────┐            ┌─────────────┐
                       │ uiAtoms     │            │ editorAtoms │
                       │ (入力バッファ) │            │ (テキスト等)  │
                       └─────────────┘            └─────────────┘
```

### 3.2 責務分離

| レイヤー     | ファイル              | 責務                                     | React依存 |
| ------------ | --------------------- | ---------------------------------------- | --------- |
| イベント取得 | `useKeyboardInput.ts` | KeyboardEvent → XStateに送信             | ◯         |
| コマンド解析 | `commandParser.ts`    | キーシーケンス → Command型               | ✕         |
| コマンド実行 | `commandExecutor.ts`  | Command + EditorState → 新EditorState    | ✕         |
| ダメージ計算 | `damageCalculator.ts` | Command → ダメージ値                     | ✕         |
| クリア判定   | `clearChecker.ts`     | EditorState + ClearConditions → 判定結果 | ✕         |

### 3.3 XState ステートマシン（Normalモード）

| 状態                      | 説明                                        | 遷移条件                                                                                                                                         |
| ------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `idle`                    | 待機中                                      | d/c/y → `operatorPending`, g → `gPending`, z → `zPending`, f/t → `charPending`, / → `searchInput`, r → `replacePending`, 単純コマンド → complete |
| `operatorPending`         | オペレータ入力済み、モーション待ち          | motion → complete, i/a → `textobjPending`, f/t → `operatorCharPending`, 同キー(dd/cc) → complete                                                 |
| `textobjPending`          | オペレータ + i/a 入力済み、オブジェクト待ち | w/"/(/{ 等 → complete                                                                                                                            |
| `gPending`                | `g` 入力済み                                | g→gg, j→gj, k→gk, u→`guPending`, U→`gUPending`                                                                                                   |
| `guPending` / `gUPending` | `gu`/`gU` 入力済み、対象待ち                | motion/textobj → complete                                                                                                                        |
| `zPending`                | `z` 入力済み                                | z/t/b → complete                                                                                                                                 |
| `charPending`             | `f`/`t` 入力済み、対象文字待ち              | {任意文字} → complete                                                                                                                            |
| `operatorCharPending`     | オペレータ+`f`/`t` 入力済み                 | {任意文字} → complete                                                                                                                            |
| `searchInput`             | `/` 入力済み、検索パターン入力中            | Enter → complete, Esc → cancel, 文字 → buffer蓄積                                                                                                |
| `replacePending`          | `r` 入力済み、置換文字待ち                  | {任意文字} → complete                                                                                                                            |

### 3.4 モード別処理

| モード     | 処理方針                                                 |
| ---------- | -------------------------------------------------------- |
| **Normal** | 上記ステートマシンで解析                                 |
| **Insert** | 全キー入力をテキスト挿入として処理。Escのみモード遷移    |
| **Visual** | Normal類似だが選択範囲を維持。オペレータは選択範囲に作用 |

### 3.5 手札制限

XStateの `guard` 関数内で `context.availableCommands` をチェック。手札にないコマンドのキー入力は `invalid` イベントとして `idle` に戻す。`u`/`Ctrl+R`/`Esc` はguardをバイパス（常時利用可能、`availableCommands` に含めない）。

Visualモード中は `availableCommands` と `visualCommands` をマージした有効手札（`getEffectiveHand()`）を使用する。オペレータキー（d/c/y/>/＜）は、そのキーで始まるコンボ（例: `dw`）が有効手札にあれば operator pending に遷移を許可する。

---

## 4. ステージデータ

### 4.1 データ形式

TypeScript定数としてノード別ファイルに定義:

```typescript
// data/stages/N01.ts
import { Stage } from '../../types/stage'

export const N01_STAGES: Stage[] = [
  {
    id: 'N01-T',
    nodeId: 'N01',
    type: 'teach',
    title: '最初の一歩',
    language: 'plaintext',
    initialText: 'hello world',
    goalText: 'Hello world',
    initialCursor: { line: 0, col: 0 },
    life: 8,
    stars: [2, 3, 5],
    availableCommands: ['h', 'j', 'k', 'l'],
    hints: [{ cost: 1, commands: ['l', 'l', 'l', 'l', 'l'] }],
    flavor: '右に移動して目標地点に到達せよ',
  },
  // N01-P ...
]
```

### 4.2 Stage型定義

```typescript
// types/stage.ts
export interface Stage {
  id: string // 'N01-T', 'N18-C' 等
  nodeId: string // スキルツリーノードID
  type: 'teach' | 'practice' | 'challenge'
  title: string // ステージ名
  language: 'plaintext' | 'css' | 'html' | 'json' | 'javascript' | 'python' | 'markdown'
  initialText: string // 初期テキスト
  goalText: string // ゴールテキスト
  initialCursor: { line: number; col: number }
  life: number
  stars: [number, number, number] // [☆3閾値, ☆2閾値, ☆1閾値]
  availableCommands: string[] // 手札
  visualCommands?: string[] // Visualモード専用手札（Visual時のみavailableCommandsに追加）
  clearConditions?: {
    cursor?: { line: number; col: number }
    registers?: Record<string, string>
  }
  hints: Hint[]
  flavor: string // フレーバーテキスト（ミッション説明）
}

export interface Hint {
  cost: number // ☆コスト（常に1）
  commands: string[] // デモ用コマンド列
}
```

### 4.3 開発順序

| フェーズ    | 内容                                     | ステージ数                 |
| ----------- | ---------------------------------------- | -------------------------- |
| **Phase 1** | エンジン開発。サンプルステージで動作確認 | 7（N01×2 + N02×2 + N18×3） |
| **Phase 2** | 全59ステージ量産                         | 残り52                     |
| **Phase 3** | バランス調整（opt値検証、ライフ調整）    | —                          |

---

## 5. データフロー全体像

### 5.1 ゲームプレイ中

```
[ユーザーキー入力]
    │
    ▼
[useKeyboardInput] ─→ XState machine に KEY イベント送信
    │
    ▼
[XState: commandParser]
    ├─ pending → uiAtoms.pendingKeys 更新（UIに「d_」表示）
    └─ complete → Command 型を生成
         │
         ▼
    [commandExecutor(editorState, command)]
         │  純粋関数: 新しい EditorState を返す
         ▼
    [damageCalculator(command)]
         │  ダメージ値を計算
         ▼
    [editorAtoms 更新] ← テキスト、カーソル、モード、ライフ、ダメージ累計
         │
         ▼
    [clearChecker(editorState, stage.clearConditions)]
         │  クリア判定
         ▼
    [クリア時] → Result画面へ遷移、☆計算、gameAtoms 更新
```

### 5.2 永続化

```
[gameAtoms 変更時]
    │
    ▼
[useLocalStorage フック] ─→ LocalStorage に書き込み
    │
    │  キー: 'vimquest_save_v1'
    │  値: { unlockedNodes, stageResults, tutorialStatus, dataVersion }
    │
    ▼
[アプリ起動時] ← LocalStorage から読み込み → gameAtoms 初期化
```

---

## 6. 主要依存パッケージ

### 6.1 dependencies

```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router": "^7.0.0",
  "jotai": "^2.0.0",
  "xstate": "^5.0.0",
  "@xstate/react": "^5.0.0",
  "shiki": "^1.0.0",
  "@dagrejs/dagre": "^1.0.0"
}
```

### 6.2 devDependencies

```json
{
  "@statelyai/inspect": "^0.4.0",
  "typescript": "^5.0.0",
  "vite": "^6.0.0",
  "@vitejs/plugin-react": "^4.0.0",
  "vitest": "^2.0.0",
  "eslint": "^9.0.0",
  "prettier": "^3.0.0"
}
```

---

## 7. デプロイ

| 項目             | 仕様                      |
| ---------------- | ------------------------- |
| ホスティング     | Vercel                    |
| ビルド出力       | 静的ファイル（`dist/`）   |
| デプロイトリガー | git push（main ブランチ） |
| プレビュー       | PRごとに自動生成          |
| カスタムドメイン | 対応（設定時に追加）      |
| ビルドコマンド   | `vite build`              |
| 出力ディレクトリ | `dist`                    |

---

## 8. CI（継続的インテグレーション）

### 8.1 GitHub Actions

`.github/workflows/ci.yml` で定義。push / PR 時に自動実行。

| ステップ     | コマンド             | 説明                 |
| ------------ | -------------------- | -------------------- |
| Typecheck    | `tsc --noEmit`       | TypeScript型チェック |
| Lint         | `eslint .`           | ESLint静的解析       |
| Format check | `prettier --check .` | Prettier書式チェック |
| Test         | `vitest run`         | 全テスト実行         |
| Build        | `vite build`         | プロダクションビルド |

全ステップが順次実行され、いずれかが失敗するとCIは失敗となる。

---

## 付録A: 全決定事項一覧

| ID  | 項目             | 決定                                                                 |
| --- | ---------------- | -------------------------------------------------------------------- |
| I1  | 技術スタック     | TS + React + Vite + Jotai + CSS Modules + Shiki + Dagre/SVG + XState |
| I2  | プロジェクト構成 | Feature-based。types/+engine/=ドメイン、features/=画面co-locate      |
| I3  | コマンドパーサー | XState v5ステートマシン。パーサー専念、エディタ状態はJotai           |
| I4  | ステージデータ   | TS定数（ノード別）、エンジン先行（サンプル7→量産52）                 |
| I5  | デプロイ         | Vercel（無料、git pushデプロイ）                                     |
