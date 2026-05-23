# IMPL-REVIEW — 実装アーキテクチャ設計レビュー

> **目的**: 実装着手前に技術的意思決定を議論・確定する  
> **形式**: 各項目について現状→提案→議論→決定の順で記録  
> **関連**: VimQuest.md, ENGINE-SPEC.md, UI-SPEC.md, STAGE-SPEC.md

---

## 議題一覧

| ID  | 項目                                               | 状態     |
| --- | -------------------------------------------------- | -------- |
| I1  | 技術スタック（言語/フレームワーク/ビルドツール）   | **確定** |
| I2  | プロジェクト構成（ディレクトリ/モジュール分割）    | **確定** |
| I3  | コマンドパーサー設計（キー入力→コマンド解釈）      | **確定** |
| I4  | ステージデータ戦略（形式/作成タイミング/管理方法） | **確定** |
| I5  | デプロイ/ホスティング                              | **確定** |

---

## I1: 技術スタック

**要件（仕様書から）**:

- デスクトップブラウザ専用、物理キーボード必須
- LocalStorage永続化（アカウントなし）
- シンタックスハイライト（7言語: plaintext, css, html, json, javascript, python, markdown）
- スキルツリーDAG描画（40ノード）
- ダークテーマ固定、アニメーションあり

**選択肢**:

| 観点           | 選択肢A                | 選択肢B          | 選択肢C                  |
| -------------- | ---------------------- | ---------------- | ------------------------ |
| 言語           | TypeScript             | TypeScript       | TypeScript               |
| フレームワーク | React                  | Svelte           | Vanilla (Web Components) |
| ビルドツール   | Vite                   | Vite             | Vite                     |
| 状態管理       | Zustand                | Svelte stores    | 自前 (EventEmitter)      |
| CSS            | CSS Modules / Tailwind | Svelte scoped    | CSS Variables + BEM      |
| ツリー描画     | Canvas / SVG手書き     | SVG手書き        | Canvas / SVG             |
| シンタックスHL | Prism.js / Shiki       | Prism.js / Shiki | Prism.js / Shiki         |

**判断材料**:

- UIの複雑さ: 画面数は6つだが、エディタ領域のリアルタイム描画が核心
- 再レンダリング頻度: キー入力ごとにエディタ更新（高頻度）
- バンドルサイズ: シンプルなゲームなので軽量が望ましい
- 開発速度: 1人開発想定

**提案（議論用）**:

→ あなたの希望や制約があれば教えてください。

**決定**:

| 観点             | 決定                                            |
| ---------------- | ----------------------------------------------- |
| 言語             | TypeScript                                      |
| フレームワーク   | React (SPA)                                     |
| ビルドツール     | Vite                                            |
| 状態管理         | Jotai                                           |
| CSS              | CSS Modules（ライブラリなし）                   |
| UIコンポーネント | なし（全て自前）                                |
| シンタックスHL   | Shiki                                           |
| ツリー描画       | Dagre（レイアウト計算）+ SVG（React JSXで描画） |
| SSR/ルーティング | 不要（SPA、react-routerのみ）                   |

---

## I2: プロジェクト構成

**決定**: Feature-based構成

```
src/
├── main.tsx
├── App.tsx                       # ルーティング
├── types/                        # ドメインモデル（型定義）
│   ├── editor.ts
│   ├── command.ts
│   ├── stage.ts
│   └── game.ts
├── engine/                       # ドメインロジック（React非依存）
│   ├── commandParser.ts
│   ├── commandExecutor.ts
│   ├── damageCalculator.ts
│   └── clearChecker.ts
├── store/                        # Jotai atoms
│   ├── gameAtoms.ts
│   ├── editorAtoms.ts
│   └── uiAtoms.ts
├── features/                     # 画面単位（feature-based）
│   ├── landing/
│   │   └── Landing.tsx
│   ├── skillTree/
│   │   ├── SkillTree.tsx
│   │   ├── components/
│   │   └── hooks/
│   ├── play/
│   │   ├── Play.tsx
│   │   ├── components/
│   │   └── hooks/
│   ├── result/
│   ├── gameOver/
│   └── weaponGet/
├── shared/                       # 真に共有されるもののみ
│   ├── hooks/
│   └── utils/
├── data/                         # 静的ゲームデータ
│   ├── stages/
│   └── skillTree.ts
└── styles/
    └── global.css
```

**設計原則**:

- `types/` + `engine/` = ドメイン（React非依存、単体テスト対象）
- `features/` = 画面ごとにcomponents/hooks/をco-locate
- `shared/` = 2箇所以上で使うもののみ
- Container不要（hook = container）、Layout不要（全画面フルスクリーン）、Atomic不採用

---

## I3: コマンドパーサー設計

**決定**: XState v5 ステートマシン（方式B: パーサー専念）

### ライブラリ

- `xstate` — ステートマシン定義・実行
- `@xstate/react` — React統合（`useMachine`）
- `@statelyai/inspect` — 開発時の状態遷移可視化（devDependency）

### 責務分離

| レイヤー               | 担当                    | 管理する状態                                                     |
| ---------------------- | ----------------------- | ---------------------------------------------------------------- |
| XState                 | コマンド**パース**      | パーサー状態（idle/operatorPending/charPending等）、入力バッファ |
| engine/commandExecutor | コマンド**実行**        | なし（純粋関数: state+command → newState）                       |
| Jotai atoms            | **エディタ/ゲーム状態** | テキスト、カーソル、モード、ライフ、進行状況                     |

### 状態一覧（Normalモード内）

| 状態                      | トリガー                       | 遷移先                                                                                       |
| ------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------- |
| `idle`                    | d/c/y → `operatorPending`      | g → `gPending`, z → `zPending`, f/t → `charPending`, / → `searchInput`, r → `replacePending` |
| `operatorPending`         | motion(w,b,$..) → complete     | i/a → `textobjPending`, f/t → `operatorCharPending`, d(dd)/c(cc) → complete                  |
| `textobjPending`          | w/"/(/{ 等 → complete          |                                                                                              |
| `gPending`                | g→gg, j→gj, k→gk               | u → `guPending`, U → `gUPending`                                                             |
| `guPending` / `gUPending` | motion/textobj → complete      |                                                                                              |
| `zPending`                | z/t/b → complete               |                                                                                              |
| `charPending`             | {任意文字} → complete          |                                                                                              |
| `operatorCharPending`     | {任意文字} → complete          |                                                                                              |
| `searchInput`             | Enter → complete, Esc → cancel | 文字 → buffer蓄積                                                                            |
| `replacePending`          | {任意文字} → complete          |                                                                                              |

### データフロー

```
KeyboardEvent → XState (parse) → Command確定
  → commandExecutor (pure fn) → 新EditorState
  → Jotai atom更新 → React再レンダリング
```

### 手札制限の実装

XStateのguard関数内で `context.availableCommands` をチェック。手札にないコマンドのキーは `invalid` として idle に戻す。

---

## I4: ステージデータ戦略

**決定**:

| 項目           | 決定                                                                         |
| -------------- | ---------------------------------------------------------------------------- |
| データ形式     | TypeScript定数（ノード別ファイル: `data/stages/N01.ts` 等）                  |
| 型安全         | Stage型で定義、ビルド時にチェック                                            |
| 作成タイミング | エンジン先行。サンプル7ステージ（N01+N02+N18）で完成後、残り52ステージを量産 |
| バリデーション | TypeScript型システムで自動検証                                               |

---

## I5: デプロイ/ホスティング

**決定**: Vercel

- 無料枚（静的サイト）
- git push で自動デプロイ
- PRごとのプレビューURL
- カスタムドメイン対応

---

## 議論ログ

| ID  | 議論日     | 決定内容                                                                                      | 備考                                           |
| --- | ---------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| I1  | 2026-05-23 | TS+React+Vite+Jotai+CSS Modules+Shiki+Dagre/SVG。UIライブラリなし最小構成                     | Next/Remix不要、MUI/Radix不要                  |
| I2  | 2026-05-23 | Feature-based構成。types/+engine/=ドメイン層、features/=画面単位co-locate、shared/=共有最小限 | DDD的にはtypes分離のみ。Container/Atomic不採用 |
| I3  | 2026-05-23 | XState v5ステートマシン。方式B（パーサー専念、エディタ状態はJotai）。Stately Inspector導入    | 手書きではなくXState採用（学習目的）           |
| I4  | 2026-05-23 | TS定数（ノード別ファイル）、エンジン先行（サンプル7ステージで開発→後から量産）                | 型安全でビルド時検証                           |
| I5  | 2026-05-23 | Vercel（無料、git pushデプロイ、プレビューURL）                                               | 静的サイトなので無料枚内                       |
