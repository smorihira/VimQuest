# Phase 2 チュートリアル＋ステージ再設計

## 対象ノード

| Node | コマンド           | stageCount | 現状の未使用コマンド |
| ---- | ------------------ | ---------- | -------------------- |
| N08  | `/`, `n`, `N`      | 2 (T+P)    | `N`                  |
| N15  | `f`, `t`, `;`, `,` | 3 (T+P+C)  | `t`, `,`             |
| N19  | `iw`, `aw`         | 2 (T+P)    | `iw` 単体            |
| N25  | `gu`, `gU`         | 1 (T)      | `gu`                 |

## 設計原則（Phase 1 と同じ）

1. チュートリアルはノードの**全コマンド**を体験させる
2. チュートリアルだけでステージ完了させない（自力練習の余地を残す）
3. ダメージ: 通常コマンド=1, INSERT=enter(1)+ceil(n/5), Esc/u/Ctrl+R=0
4. Teach: ☆3=opt, ☆2=opt+1, ☆1=opt+3, life=opt+6

## 技術要件

### 新規: `search` ステップタイプの追加

N08 のチュートリアルで `/pattern Enter` 検索を体験させるため、
`StageTutorial` に `search` ステップタイプを追加する。

- 既存の `colon_command` タイプと同構造
- `/` キーで検索バッファ開始 → 文字入力 → `Enter` で検索実行
- TutorialStep に `searchCommand?: string` フィールド追加（例: `'/bug'`）
- 検索実行後、EditorState の `lastSearchPattern` が設定され、
  後続ステップで `n`/`N` が動作可能になる

---

## N08: 検索 (`/`, `n`, `N`)

### N08-T (Teach) — 変更あり

**変更理由**: 現在のテキストは "error" が1箇所のみで `n`/`N` を体験できない

#### ステージデータ

```
title: '検索せよ'
initialText:
  const x = 1;
  // bug: fix later
  const y = 2;
  // bug: needs review
  const z = 3;
  // bug: critical
initialCursor: (0, 0)
clearConditions: cursor (5, 3)
availableCommands: ['/']
hints: ['/bug', 'Enter', 'n', 'n']
opt = 3 (/bug Enter=1, n=1, n=1)
stars: [3, 4, 6], life: 9
```

#### チュートリアル

| Step | type   | expectedKey/command | message                                       |
| ---- | ------ | ------------------- | --------------------------------------------- |
| 1    | search | `/bug`              | `/` を押して `bug` と打ち Enter で検索しろ    |
| 2    | key    | `n`                 | n で次のマッチへジャンプ                      |
| 3    | key    | `N`                 | N で前のマッチに戻れる                        |
| 4    | info   | null                | / で検索、n で次、N で前。最後の bug まで行け |

**チュートリアル後の状態**: cursor (1, 3), lastSearchPattern="bug"
**プレイヤーの操作**: n → n = 2ダメージ → ☆3確定

### N08-P (Practice) — 変更なし

現状で `/TODO Enter n n` を使用。opt=3 は正しい。

---

## N15: 行内ジャンプ (`f`, `t`, `;`, `,`)

### N15-T (Teach) — 変更あり

**変更理由**: 現在は `f(` のみ。`t`, `;`, `,` を体験できない

#### ステージデータ

```
title: '狙い撃て'
initialText: fn(a, b); fn(c, d);
initialCursor: (0, 0)
clearConditions: cursor (0, 18)   ← 最後の ';'
availableCommands: ['f', 't']
hints: ['f;', ';']
opt = 2 (f;=1, ;=1)
stars: [2, 3, 5], life: 8
```

位置マップ: `f(0) n(1) ((2) a(3) ,(4) _(5) b(6) )(7) ;(8) _(9) f(10) n(11) ((12) c(13) ,(14) _(15) d(16) )(17) ;(18)`

#### チュートリアル

| Step | type | expectedKey | message                                        |
| ---- | ---- | ----------- | ---------------------------------------------- |
| 1    | key  | `f(`        | f( と押せ。行内の ( に一瞬でジャンプ           |
| 2    | key  | `;`         | ; を押せ。直前の f を繰り返す                  |
| 3    | key  | `,`         | , を押せ。逆方向に繰り返す                     |
| 4    | key  | `t)`        | t) と押せ。) の1文字手前に止まる               |
| 5    | info | null        | f で直接、t で手前。; で繰り返し、, で逆方向だ |

**カーソル遷移**: (0,0) →f(→ (0,2) →;→ (0,12) →,→ (0,2) →t)→ (0,6)
**チュートリアル後の状態**: cursor (0, 6)
**プレイヤーの操作**: f; → ; = 2ダメージ → ☆3確定

### N15-P (Practice) — 変更なし

`f/ ; ;` で opt=3。正しい。

### N15-C (Challenge) — 変更なし

`fr l x` で opt=3。正しい。

---

## N19: 基本TextObj (`iw`, `aw`)

### N19-T (Teach) — 変更あり

**変更理由**: `iw` が体験されない。`daw` のみ

#### ステージデータ

```
title: '単語を掴め'
initialText: hello nice ugly world
goalText: hello world
initialCursor: (0, 0)
availableCommands: ['dw', 'de', 'db', 'diw', 'daw', 'f', 't']
hints: ['w', 'daw', 'daw']
opt = 3 (w=1, daw=1, daw=1)
stars: [3, 4, 6], life: 9
```

#### チュートリアル

| Step | type | expectedKey | message                                       |
| ---- | ---- | ----------- | --------------------------------------------- |
| 1    | key  | `w`         | w で次の単語に移動                            |
| 2    | key  | `diw`       | diw と押せ。単語だけ消える…が空白が残る       |
| 3    | key  | `u`         | u で元に戻せ。今度は daw を試そう             |
| 4    | key  | `daw`       | daw と押せ。空白ごとスッキリ消える            |
| 5    | info | null        | daw は空白ごと消す。残りの不要語も daw で消せ |

**カーソル遷移**:

- (0,0) →w→ (0,6)"nice" →diw→ "hello ugly world" cursor(0,6)
- →u→ "hello nice ugly world" cursor(0,6) →daw→ "hello ugly world" cursor(0,6)"ugly"

**チュートリアル後の状態**: text="hello ugly world", cursor (0, 6)
**プレイヤーの操作**: daw = 1ダメージ → ☆3確定

### N19-P (Practice) — 変更なし

`w daw daw` で opt=3。正しい。

---

## N25: 大小文字変換 (`gu`, `gU`)

### N25-T (Teach) — 変更あり

**変更理由**: `gu` が使われない。`gU` のみ

#### ステージデータ

```
title: '大文字にしろ'
initialText: HELLO world BYE
goalText: hello WORLD bye
initialCursor: (0, 0)
availableCommands: ['diw', 'di"', 'gu', 'gU', 'f', 't']
hints: ['guiw', 'w', 'gUiw', 'w', 'guiw']
opt = 5 (guiw=1, w=1, gUiw=1, w=1, guiw=1)
stars: [5, 6, 8], life: 11
```

位置マップ: `H(0)E(1)L(2)L(3)O(4) _(5) w(6)o(7)r(8)l(9)d(10) _(11) B(12)Y(13)E(14)`

#### チュートリアル

| Step | type | expectedKey | message                                     |
| ---- | ---- | ----------- | ------------------------------------------- |
| 1    | key  | `guiw`      | guiw と押せ。カーソル下の単語が小文字になる |
| 2    | key  | `w`         | w で次の単語へ                              |
| 3    | key  | `gUiw`      | gUiw と押せ。今度は大文字になる             |
| 4    | info | null        | gu で小文字、gU で大文字。残りも直せ        |

**カーソル遷移**: (0,0)"HELLO" →guiw→ (0,0)"hello" →w→ (0,6)"world" →gUiw→ (0,6)"WORLD"
**チュートリアル後の状態**: text="hello WORLD BYE", cursor (0, 6)
**プレイヤーの操作**: w → guiw = 2ダメージ → ☆3確定

---

## 変更サマリー

| ファイル                              | 操作                                    |
| ------------------------------------- | --------------------------------------- |
| `src/types/tutorial.ts`               | `searchCommand?: string` フィールド追加 |
| `src/features/play/StageTutorial.tsx` | `search` ステップタイプ追加             |
| `src/data/stages/N08.ts`              | N08-T テキスト・ヒント・stars 変更      |
| `src/data/stages/N15.ts`              | N15-T テキスト・ヒント・stars 変更      |
| `src/data/stages/N19.ts`              | N19-T テキスト・ヒント・stars 変更      |
| `src/data/stages/N25.ts`              | N25-T テキスト・ヒント・stars 変更      |
| `src/data/tutorials/N08.ts`           | 新規作成                                |
| `src/data/tutorials/N15.ts`           | 新規作成                                |
| `src/data/tutorials/N19.ts`           | 新規作成                                |
| `src/data/tutorials/N25.ts`           | 新規作成                                |
| `src/data/tutorials/index.ts`         | 4件登録追加                             |

### opt 計算まとめ

| Stage | Hints                  | opt | stars   | life |
| ----- | ---------------------- | --- | ------- | ---- |
| N08-T | /bug Enter, n, n       | 3   | [3,4,6] | 9    |
| N15-T | f;, ;                  | 2   | [2,3,5] | 8    |
| N19-T | w, daw, daw            | 3   | [3,4,6] | 9    |
| N25-T | guiw, w, gUiw, w, guiw | 5   | [5,6,8] | 11   |
