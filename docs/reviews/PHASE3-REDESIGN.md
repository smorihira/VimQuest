# Phase 3 チュートリアル＋ステージ再設計

## 対象ノード（15ノード）

| Node | コマンド               | stageCount | 現状の問題                                   |
| ---- | ---------------------- | ---------- | -------------------------------------------- |
| N10  | `dw`, `de`, `db`       | 3 (T+P+C)  | T: de/db 未体験。opt=2 でチュートリアル完了  |
| N12  | `d$`, `d0`             | 1 (T)      | d0 未体験。opt=5 だがナビが長い              |
| N13  | `D` / `s,S,C`          | 2 (T+P)    | T: opt=1 で完了。P: N23-T と完全重複         |
| N17  | `df`, `dt`             | 1 (T)      | チュートリアルなし                           |
| N18  | `cf`, `ct`             | 2 (T+P)    | チュートリアルなし                           |
| N20  | `ci"`, `di"`, `i(`     | 2 (T+P)    | T: opt=1 で完了                              |
| N21  | `diw`, `di"`, `da(`    | 2 (T+P)    | T: opt=2 で完了                              |
| N22  | `ciw`, `ci"` ★★★       | 3 (T+P+C)  | T: opt=2 で完了                              |
| N23  | `s`, `S`, `C`          | 1 (T)      | N13-P と完全重複。opt=1 で完了               |
| N24  | `.` ドットリピート ★★★ | 3 (T+P+C)  | チュートリアルなし                           |
| N27  | `v`, `V`               | 2 (T+P)    | T: opt=2 で完了                              |
| N28  | `Ctrl+v`               | 2 (T+P)    | チュートリアルなし                           |
| N29  | `y`, `yiw`, `p`        | 3 (T+P+C)  | チュートリアルなし                           |
| N30  | `p`, `P`               | 1 (T)      | N29-C と完全重複（同一テキスト・同一ヒント） |
| N31  | `"a`〜`"z`, `"0`       | 2 (T+P)    | チュートリアルなし                           |

## 設計原則（Phase 1/2 と同じ）

1. チュートリアルはノードの**全コマンド**を体験させる
2. チュートリアルだけでステージ完了させない（自力練習の余地を残す）
3. 現行のダメージ計算式を使用（下記参照）
4. バランス公式: Teach ☆3=opt, ☆2=opt+1, ☆1=opt+3, life=opt+6

### ダメージ計算リファレンス

| 操作                             | ダメージ                  |
| -------------------------------- | ------------------------- |
| 通常コマンド (w, dd, dw, ciw 等) | 1 (状態変化なしなら 0)    |
| INSERT セッション (i…Esc)        | 1 + max(0, charCount − 5) |
| 空 INSERT (i→Esc 変化なし)       | 0                         |
| Visual エントリ (v, V, Ctrl+v)   | 0 (無料)                  |
| Visual Esc                       | 1                         |
| Visual 操作 (d, c, y, >, <)      | 1                         |
| Esc, u, Ctrl+R                   | 0 (常に無料)              |

## 既知のデータ問題

### 問題 1: N13-P と N23-T が完全重複

両ステージが同一テキスト・同一ゴール・同一ヒント:

```
initialText: 'const result = null;'
goalText:    'const Result = null;'
cursor: (0, 6)
hints: ['s', 'R', 'Esc']
```

**対応**: N13-P を D の追加練習に変更し、s/S/C は N23 に集約する。

### 問題 2: N30-T と N29-C が完全重複

同一テキスト・同一ヒント (`first/third/second` の並び替え, `dd`+`P`)。

**対応**: N30-T を p/P の違いを教える独自ステージに変更する。

---

## 各ノード詳細設計

---

### N10 — オペレータ+モーション (dw, de, db)

**問題**: `delete this word` → `delete word` は w + dw の 2 手でチュートリアルが完了。de/db 未体験。

**ステージ案** (N10-T のみ変更):

```
language: plaintext
initialText: 'delete this ugly old word'
goalText:    'delete word'
cursor: (0, 0)
```

**チュートリアル (dw と de の違いを体験)**:

| #   | expectedKey | message                                          |
| --- | ----------- | ------------------------------------------------ |
| 1   | w           | w で "this" に移動しろ                           |
| 2   | de          | de と押せ。単語だけ消える…が空白が残る           |
| 3   | u           | u で元に戻せ。今度は dw を試そう                 |
| 4   | dw          | dw と押せ。空白ごとスッキリ消える                |
| 5   | null        | dw は空白ごと、de は単語だけ。残りの不要語も消せ |

**チュートリアル後の状態**: `delete ugly old word`, cursor on "ugly"
**自力パート**: dw + dw = 2
**opt**: 2
**stars**: [2, 3, 5], **life**: 8
**hints**: `['w', 'dw', 'dw', 'dw']`

N10-P, N10-C は変更なし。

---

### N12 — 行末/行頭削除 (d$, d0)

**問題**: d0 が未体験。ステージが d$ のみ使用。

**ステージ案** (N12-T を変更):

```
language: javascript
initialText: '// temp value; // hack'
goalText:    'value;'
cursor: (0, 8)     ← 'v' of 'value'
```

**チュートリアル (d0 を体験)**:

| #   | expectedKey | message                                                      |
| --- | ----------- | ------------------------------------------------------------ |
| 1   | d0          | d0 を押せ。カーソルから行頭まで一気に消える                  |
| 2   | null        | d0 は行頭まで、d$ は行末まで削除。残りのコメントも d$ で消せ |

**チュートリアル後の状態**: `value; // hack`, cursor (0, 0)
**自力パート**: w + l + d$ (';' を越えた位置から d$)
**opt**: 3 (w→';', l→' ', d$)
**stars**: [3, 4, 6], **life**: 9
**hints**: `['d0', 'w', 'l', 'd$']`

---

### N13 — ショートカット (D)

**問題**: N13-T は opt=1 (D 一発) でチュートリアル完了。N13-P は N23-T と重複。

**ステージ案** (N13-T を 2 行化、N13-P を D の追加練習に変更):

#### N13-T

```
language: javascript
initialText: 'let a = 1; // fixme\nlet b = 2; // todo'
goalText:    'let a = 1;\nlet b = 2;'
cursor: (0, 10)    ← ';' の直後の ' '
```

**チュートリアル (D を体験)**:

| #   | expectedKey | message                                          |
| --- | ----------- | ------------------------------------------------ |
| 1   | D           | D を押せ。カーソルから行末まで一発で消える       |
| 2   | null        | D は d$ のショートカット。2 行目も同じように消せ |

**チュートリアル後の状態**: `let a = 1;\nlet b = 2; // todo`, cursor at ';' of line 1
**自力パート**: j → l → D
**opt**: 3
**stars**: [3, 4, 6], **life**: 9
**hints**: `['D', 'j', 'l', 'D']`

#### N13-P (D の練習ステージに変更)

```
language: javascript
initialText: 'return x; // debug output\nreturn y; // old handler'
goalText:    'return x;\nreturn y;'
cursor: (0, 0)
type: practice
availableCommands: ['dd', 'd$', 'd0', 'D']
```

**チュートリアルなし** (Practice ステージ)
**hints**: `['e', 'e', 'l', 'D', 'j', 'e', 'e', 'l', 'D']`
**opt**: 8
**stars**: [8, 10, 12], **life**: 14

---

### N17 — d+f/t (df, dt)

**問題**: チュートリアルなし。opt=3 で自力パートの余地あり。

**ステージ案** (変更なし、チュートリアル追加のみ):

```
initialText: 'padding: 0px10px;'
goalText:    'padding: 10px;'
cursor: (0, 0)
```

**チュートリアル (dt を体験)**:

| #   | expectedKey | message                                                      |
| --- | ----------- | ------------------------------------------------------------ |
| 1   | w           | w で値の部分に移動                                           |
| 2   | w           | もう一回 w で '0' に移動                                     |
| 3   | null        | dt で指定文字の手前まで削除できる。dt1 で '1' の手前まで消せ |

**チュートリアル後の状態**: cursor (0, 9) — '0' の上
**自力パート**: dt1
**opt**: 1
**stars**: [1, 2, 4], **life**: 7

待て、opt=1 ではチュートリアルがほぼ全てをやってしまう。ステージ再設計が必要。

**ステージ再設計** (N17-T):

```
language: css
initialText: 'padding: 0px10px 0px20px;'
goalText:    'padding: 10px 20px;'
cursor: (0, 0)
```

**チュートリアル (dt を体験)**:

| #   | expectedKey | message                                           |
| --- | ----------- | ------------------------------------------------- |
| 1   | w           | w で値の部分に移動                                |
| 2   | w           | もう一回 w                                        |
| 3   | dt1         | dt1 と押せ。'1' の手前まで削除される              |
| 4   | null        | dt は指定文字の手前まで削除。残りも同じように直せ |

**チュートリアル後の状態**: `padding: 10px 0px20px;`, cursor (0, 14) 付近
**自力パート**: w で '0' に移動 → dt2
**opt**: 2 (w + dt2)
**stars**: [2, 3, 5], **life**: 8
**hints**: `['w', 'w', 'dt1', 'w', 'dt2']`

---

### N18 — c+f/t (cf, ct)

**問題**: チュートリアルなし。

#### N18-T (チュートリアル追加、ステージ変更なし)

```
initialText: 'color: red;'
goalText:    'color: blue;'
cursor: (0, 0)
```

opt=3 は十分だが、チュートリアルが ct; + blue + Esc で完了してしまう（3 手で完了）。

**ステージ再設計** (N18-T):

```
language: css
initialText: 'color: red;\nsize: small;'
goalText:    'color: blue;\nsize: large;'
cursor: (0, 0)
```

**チュートリアル (ct を体験、cf との違いを教える)**:

| #   | expectedKey | message                                      |
| --- | ----------- | -------------------------------------------- |
| 1   | w           | w で 'red' に移動                            |
| 2   | w           | もう一回 w                                   |
| 3   | cf;         | cf; と押せ。';' まで消してInsertに入る       |
| 4   | blue;       | blue; と打て                                 |
| 5   | Esc         | Esc で確定                                   |
| 6   | u           | u で戻せ。今度は ct; を試そう                |
| 7   | ct;         | ct; と押せ。';' の手前まで消してInsertに入る |
| 8   | blue        | blue と打て                                  |
| 9   | Esc         | Esc で確定                                   |
| 10  | null        | cf は文字ごと、ct は手前まで。2 行目も直せ   |

**チュートリアル後の状態**: `color: blue;\nsize: small;`
**自力パート**: j + w + w + ct; + large + Esc
**opt**: 4 (j + w + w + ct;…large…Esc(1))
**stars**: [4, 5, 7], **life**: 10
**hints**: `['w', 'w', 'ct;', 'blue', 'Esc', 'j', 'w', 'w', 'ct;', 'large', 'Esc']`

N18-P は変更なし。

---

### N20 — デリミタ TextObj (ci", di", i(, a()

**問題**: N20-T は opt=1 (ci"+blue+Esc) でチュートリアル完了。

**ステージ再設計** (N20-T):

```
language: json
initialText: '{ "color": "red", "size": "small" }'
goalText:    '{ "color": "blue", "size": "large" }'
cursor: (0, 12)    ← 'r' of "red"
```

**チュートリアル (ci" を体験)**:

| #   | expectedKey | message                                        |
| --- | ----------- | ---------------------------------------------- |
| 1   | ci"         | ci" と押せ。引用符の中身が消えて Insert に入る |
| 2   | blue        | blue と打て                                    |
| 3   | Esc         | Esc で確定                                     |
| 4   | null        | ci" でデリミタ内を一発置換。残りも直せ         |

**チュートリアル後の状態**: `{ "color": "blue", "size": "small" }`, cursor on "blue" 付近
**自力パート**: f で "small" の引用符に移動 → ci" + large + Esc
**opt**: 2 (f"+ci"…large…Esc(1)) ※ f" で移動して ci" で置換
**stars**: [2, 3, 5], **life**: 8
**hints**: `['ci"', 'blue', 'Esc', 'f"', 'ci"', 'large', 'Esc']`

N20-P は変更なし。

---

### N21 — d+TextObj (diw, di")

**問題**: N21-T は opt=2 (w+diw) でチュートリアル完了。

**ステージ再設計** (N21-T):

```
language: javascript
initialText: 'const temp old = 42;'
goalText:    'const  = 42;'
cursor: (0, 0)
```

**チュートリアル (diw を体験、dw との違い)**:

| #   | expectedKey | message                                    |
| --- | ----------- | ------------------------------------------ |
| 1   | w           | w で "temp" に移動                         |
| 2   | diw         | diw と押せ。単語だけ消えて空白は残る       |
| 3   | null        | diw は空白を残して単語だけ消す。残りも消せ |

**チュートリアル後の状態**: `const  old = 42;`, cursor (0, 6) 付近
**自力パート**: diw ("old" を削除)
**opt**: 1

opt=1 は少なすぎるので、3 単語に拡張:

```
language: javascript
initialText: 'const temp old extra = 42;'
goalText:    'const  = 42;'
cursor: (0, 0)
```

**自力パート**: diw + diw = 2
**opt**: 2
**stars**: [2, 3, 5], **life**: 8
**hints**: `['w', 'diw', 'diw', 'diw']`

N21-P は変更なし。

---

### N22 — c+TextObj (ciw, ci") ★★★ 重要ノード

**問題**: N22-T は opt=2 (w+ciw+count+Esc) でチュートリアル完了。

**ステージ再設計** (N22-T):

```
language: javascript
initialText: 'let value = old;'
goalText:    'let count = new;'
cursor: (0, 0)
```

**チュートリアル (ciw を体験)**:

| #   | expectedKey | message                                |
| --- | ----------- | -------------------------------------- |
| 1   | w           | w で "value" に移動                    |
| 2   | ciw         | ciw と押せ。単語が消えて Insert に入る |
| 3   | count       | count と打て                           |
| 4   | Esc         | Esc で確定                             |
| 5   | null        | ciw で単語をそのまま置換。残りも直せ   |

**チュートリアル後の状態**: `let count = old;`, cursor on "count" 付近
**自力パート**: w + w + ciw + new + Esc
**opt**: 3 (w + w + ciw…new…Esc(1))
**stars**: [3, 4, 6], **life**: 9
**hints**: `['w', 'ciw', 'count', 'Esc', 'w', 'w', 'ciw', 'new', 'Esc']`

N22-P, N22-C は変更なし。

---

### N23 — 変更ショートカット (s, S, C)

**問題**: N13-P と完全重複。opt=1 で完了。

**ステージ再設計** (N23-T):

```
language: javascript
initialText: 'let x = 0;\nold line here;'
goalText:    'let y = 0;\nnew content;'
cursor: (0, 4)     ← 'x' の上
```

**チュートリアル (s, S, C を順に体験)**:

| #   | expectedKey  | message                                             |
| --- | ------------ | --------------------------------------------------- |
| 1   | s            | s を押せ。1 文字消して Insert に入る                |
| 2   | y            | y と打て                                            |
| 3   | Esc          | Esc で確定                                          |
| 4   | j            | j で 2 行目に移動                                   |
| 5   | S            | S を押せ。行全体を消して Insert に入る              |
| 6   | new content; | new content; と打て                                 |
| 7   | Esc          | Esc で確定                                          |
| 8   | null         | s は 1 文字変更、S は行全体変更。C は行末まで変更だ |

**チュートリアル後の状態**: ゴールと一致 → 完了してしまう！

**3 行に拡張**:

```
language: javascript
initialText: 'let x = 0;\nold line;\nreturn null; // remove'
goalText:    'let y = 0;\nnew code;\nreturn null;'
cursor: (0, 4)
```

**チュートリアル (s と S を体験)**:

| #   | expectedKey | message                                                 |
| --- | ----------- | ------------------------------------------------------- |
| 1   | s           | s を押せ。1 文字消して Insert に入る                    |
| 2   | y           | y と打て                                                |
| 3   | Esc         | Esc で確定                                              |
| 4   | j           | j で 2 行目に移動                                       |
| 5   | S           | S を押せ。行全体を消して Insert に入る                  |
| 6   | new code;   | new code; と打て                                        |
| 7   | Esc         | Esc で確定                                              |
| 8   | null        | s は 1 文字、S は行全体、C は行末まで変更。3 行目も直せ |

**チュートリアル後の状態**: `let y = 0;\nnew code;\nreturn null; // remove`
**自力パート**: j → navigate past ';' → C + Esc (空 INSERT → 0 ダメージ？)

問題: C の後に何も入力せず Esc → 空 INSERT で 0 ダメージ。でも ` // remove` が消える。
`C` は行末まで削除 + INSERT 開始。空 INSERT (テキスト変化あり) = 1 ダメージ。

**自力パート**: j + $ + b + C + Esc? ← ナビが複雑

**再調整**: C を使いやすい位置にする

```
language: javascript
initialText: 'let x = 0;\nold line;\nlet z = bad;'
goalText:    'let y = 0;\nnew code;\nlet z = good;'
cursor: (0, 4)
```

**チュートリアル (s と S を体験)**:

| #   | expectedKey | message                                                 |
| --- | ----------- | ------------------------------------------------------- |
| 1   | s           | s を押せ。1 文字消して Insert に入る                    |
| 2   | y           | y と打て                                                |
| 3   | Esc         | Esc で確定                                              |
| 4   | j           | j で 2 行目に移動                                       |
| 5   | S           | S を押せ。行全体を消して Insert に入る                  |
| 6   | new code;   | new code; と打て                                        |
| 7   | Esc         | Esc で確定                                              |
| 8   | null        | s は 1 文字、S は行全体、C は行末まで変更。3 行目も直せ |

**チュートリアル後の状態**: `let y = 0;\nnew code;\nlet z = bad;`
**自力パート**: j + w + w + w + C + good; + Esc
**opt**: 4 (j + w + w + w + C…good;…Esc(1+max(0,5-5)=1))

ナビが多い。もっとシンプルにする:

```
language: javascript
initialText: 'let x = 0;\nold line;\nlet z = bad;'
goalText:    'let y = 0;\nnew code;\nlet z = good;'
cursor: (0, 4)
```

自力パート: j + f= + l + C + good; + Esc ← f は availableCommands に必要
opt: j(1) + f=(1) + l(1) + C…good;…Esc(1+max(0,5-5)=1) = 4

ただし availableCommands に f/t が必要。N23-T の現状: `['ciw', 'S', 'C', 'f', 't']` → f/t あり ✓

**opt**: 4
**stars**: [4, 5, 7], **life**: 10
**hints**: `['s', 'y', 'Esc', 'j', 'S', 'new code;', 'Esc', 'j', 'f=', 'l', 'C', 'good;', 'Esc']`
**availableCommands**: `['ciw', 'S', 'C', 'f', 't']` (s は BASE_COMMANDS に含まれるため不要)

---

### N24 — ドットリピート (.) ★★★ ピークノード

**問題**: チュートリアルなし。opt=5 で自力パートの余地十分。

**ステージ案** (変更なし、チュートリアル追加のみ):

```
initialText: 'no no no'
goalText:    'yes yes yes'
cursor: (0, 0)
```

**チュートリアル (ciw + . の「渇望→報酬」体験)**:

| #   | expectedKey | message                                                     |
| --- | ----------- | ----------------------------------------------------------- |
| 1   | ciw         | ciw と押せ。"no" が消えて Insert に入る                     |
| 2   | yes         | yes と打て                                                  |
| 3   | Esc         | Esc で確定                                                  |
| 4   | w           | w で次の "no" に移動                                        |
| 5   | .           | . を押せ。直前の ciw+yes が一発で繰り返される               |
| 6   | null        | . は直前の操作を繰り返す。Vim の奥義だ。残りも . で片付けろ |

**チュートリアル後の状態**: `yes yes no`, cursor on 2nd "yes"
**自力パート**: w + .
**opt**: 2 (w + .)
**stars**: [2, 3, 5], **life**: 8

元 opt=5 から大幅低下。ステージ再設計が必要。

**ステージ再設計** (N24-T):

```
language: plaintext
initialText: 'no no no no no'
goalText:    'yes yes yes yes yes'
cursor: (0, 0)
```

**チュートリアル (最初の 2 単語で ciw + . を教える)**:

| #   | expectedKey | message                                           |
| --- | ----------- | ------------------------------------------------- |
| 1   | ciw         | ciw と押せ。"no" が消えて Insert に入る           |
| 2   | yes         | yes と打て                                        |
| 3   | Esc         | Esc で確定                                        |
| 4   | w           | w で次の "no" に移動                              |
| 5   | .           | . を押せ。直前の ciw+yes が一発で繰り返される     |
| 6   | null        | . は直前の操作を繰り返す。残りも w + . で片付けろ |

**チュートリアル後の状態**: `yes yes no no no`
**自力パート**: w + . + w + . + w + . = 6 → ☆3 は w+.+w+.+w+. = 6

**opt**: 6 (w+.+w+.+w+.)
**stars**: [6, 7, 9], **life**: 12
**hints**: `['ciw', 'yes', 'Esc', 'w', '.', 'w', '.', 'w', '.', 'w', '.']`

N24-P, N24-C は変更なし。

---

### N27 — Visual モード (v, V)

**問題**: N27-T は opt=2 (j+V(0)+d) でチュートリアル完了。V(free)+d(1)+j(1)=2。

**ステージ再設計** (N27-T):

```
language: javascript
initialText: 'keep this\ndelete this\ndelete that\nkeep this too'
goalText:    'keep this\nkeep this too'
cursor: (0, 0)
```

**チュートリアル (V と v の違い)**:

| #   | expectedKey | message                              |
| --- | ----------- | ------------------------------------ |
| 1   | j           | j で削除対象の行に移動               |
| 2   | V           | V を押せ。行全体が選択される         |
| 3   | d           | d で選択範囲を削除                   |
| 4   | null        | V で行選択、d で削除。残りの行も消せ |

**チュートリアル後の状態**: `keep this\ndelete that\nkeep this too`
**自力パート**: V + d = 1 (V=0, d=1)

opt=1。少ないので 3 行削除に拡張:

```
language: javascript
initialText: 'keep\nremove A\nremove B\nremove C\nalso keep'
goalText:    'keep\nalso keep'
cursor: (0, 0)
```

**チュートリアル (V で行選択削除)**:

| #   | expectedKey | message                                  |
| --- | ----------- | ---------------------------------------- |
| 1   | j           | j で削除対象の行に移動                   |
| 2   | V           | V を押せ。行全体が選択される             |
| 3   | d           | d で選択範囲を削除                       |
| 4   | null        | V で行選択、d で削除。残りの不要行も消せ |

**チュートリアル後の状態**: `keep\nremove B\nremove C\nalso keep`
**自力パート**: V + d + V + d = 2 (各 V(0)+d(1) = 1, 2 回)
**opt**: 2
**stars**: [2, 3, 5], **life**: 8
**hints**: `['j', 'V', 'd', 'V', 'd', 'V', 'd']`

N27-P は変更なし。

---

### N28 — 矩形選択 (Ctrl+v)

**問題**: チュートリアルなし。opt=3 で自力パートの余地あり。

**ステージ案** (N28-T 変更なし、チュートリアル追加のみ):

```
initialText: 'X hello\nX world\nX test'
goalText:    ' hello\n world\n test'
cursor: (0, 0)
```

チュートリアルが Ctrl+v + j + j + d で完了してしまう (opt=3)。

**ステージ再設計** (N28-T):

```
language: plaintext
initialText: 'X hello\nX world\nX test\nX final'
goalText:    ' hello\n world\n test\n final'
cursor: (0, 0)
```

**チュートリアル (Ctrl+v で矩形選択を体験)**:

| #   | expectedKey | message                                          |
| --- | ----------- | ------------------------------------------------ |
| 1   | Ctrl+v      | Ctrl+v を押せ。矩形選択モードに入る              |
| 2   | j           | j で下に選択範囲を広げろ                         |
| 3   | j           | もう 1 行下まで広げろ                            |
| 4   | d           | d で選択した列を削除                             |
| 5   | null        | Ctrl+v は縦の列を一括操作できる。残り 1 行も消せ |

**チュートリアル後の状態**: ` hello\n world\n test\nX final` (4 行目の X が残る)
**自力パート**: x (最後の X を削除) = 1

opt=1 では少なすぎる。5 行に拡張:

```
language: plaintext
initialText: 'X hello\nX world\nX test\nX more\nX final'
goalText:    ' hello\n world\n test\n more\n final'
cursor: (0, 0)
```

**チュートリアル (3 行分を選択削除)**:

| #   | expectedKey | message                                            |
| --- | ----------- | -------------------------------------------------- |
| 1   | Ctrl+v      | Ctrl+v を押せ。矩形選択モードに入る                |
| 2   | j           | j で下に選択範囲を広げろ                           |
| 3   | j           | もう 1 行                                          |
| 4   | d           | d で選択した列を削除                               |
| 5   | null        | Ctrl+v は縦列を一括操作。残りの X も同じ要領で消せ |

**チュートリアル後の状態**: ` hello\n world\n test\nX more\nX final`
**自力パート**: Ctrl+v(0) + j(1) + d(1) = 2
**opt**: 2
**stars**: [2, 3, 5], **life**: 8
**hints**: `['Ctrl+v', 'j', 'j', 'd', 'Ctrl+v', 'j', 'd']`

N28-P は変更なし。

---

### N29 — ヤンク＆ペースト (y, yiw, p)

**問題**: チュートリアルなし。

#### N29-T (チュートリアル追加)

```
initialText: 'hello world'
goalText:    'hello worldhello'
cursor: (0, 0)
```

opt=3 でチュートリアルが yiw + $ + p で完了。

**ステージ再設計** (N29-T):

```
language: plaintext
initialText: 'hello world end'
goalText:    'hello worldhello endhello'
cursor: (0, 0)
```

**チュートリアル (yiw + p を体験)**:

| #   | expectedKey | message                                          |
| --- | ----------- | ------------------------------------------------ |
| 1   | yiw         | yiw と押せ。カーソル下の単語をヤンク（コピー）   |
| 2   | w           | w で "world" に移動                              |
| 3   | e           | e で単語の末尾に移動                             |
| 4   | p           | p でヤンクした内容をペースト                     |
| 5   | null        | yiw でコピー、p でペースト。"end" の後ろにも貼れ |

**チュートリアル後の状態**: `hello worldhello end`, cursor on pasted "hello"
**自力パート**: w + e + p (end の後ろに hello をペースト) = 3

もしくは $ + p = 2。$ がベースコマンドにある。
**opt**: 2 ($ + p)
**stars**: [2, 3, 5], **life**: 8
**hints**: `['yiw', 'e', 'p', '$', 'p']`

ただしこの goalText は `hello worldhello endhello` で、各単語の間にスペースがない。
yiw で 'hello' (スペースなし) をヤンク、$ で行末、p でペースト → `hello worldhello endhello` ✓

N29-P, N29-C は変更なし。

---

### N30 — ペースト (p, P)

**問題**: N29-C と完全重複。p/P の違いを教えるべき。

**ステージ再設計** (N30-T):

```
language: plaintext
initialText: 'second\nfirst'
goalText:    'first\nsecond'
cursor: (1, 0)     ← 'first' の行
```

**チュートリアル (dd + P を体験)**:

| #   | expectedKey | message                                      |
| --- | ----------- | -------------------------------------------- |
| 1   | dd          | dd で行を切り取れ                            |
| 2   | P           | P を押せ。カーソルの上にペーストされる       |
| 3   | null        | p は下に、P は上にペースト。この違いを覚えろ |

**チュートリアル後の状態**: ゴールと一致 → 完了してしまう。

**3 行に拡張**:

```
language: plaintext
initialText: 'third\nsecond\nfirst'
goalText:    'first\nsecond\nthird'
cursor: (0, 0)
```

**チュートリアル (dd + p で行の移動)**:

| #   | expectedKey | message                                                |
| --- | ----------- | ------------------------------------------------------ |
| 1   | dd          | dd で "third" を切り取れ                               |
| 2   | p           | p を押せ。カーソルの下にペーストされる                 |
| 3   | null        | p は下、P は上にペースト。"first" を一番上に移動させろ |

**チュートリアル後の状態**: `second\nthird\nfirst` (third が 2 行目に移動)
**自力パート**: j + j + dd + P + P ← 複雑

代替: first をカットして一番上に移動。j+j+dd+gg+P
= j(1) + j(1) + dd(1) + gg(1) + P(1) = 5。多い。

**さらにシンプルに**:

```
language: plaintext
initialText: 'B\nC\nA'
goalText:    'A\nB\nC'
cursor: (0, 0)
```

**チュートリアル (dd + p の基本)**:

| #   | expectedKey | message                                        |
| --- | ----------- | ---------------------------------------------- |
| 1   | j           | j で C に移動                                  |
| 2   | j           | j で A に移動                                  |
| 3   | dd          | dd で A を切り取れ                             |
| 4   | P           | P を押せ。上にペーストされる — しかし C の上だ |

ん、これだと手順が複雑になる。

**最終案**: もっと直感的に

```
language: plaintext
initialText: 'second\nfirst\nthird'
goalText:    'first\nsecond\nthird'
cursor: (0, 0)
```

**チュートリアル**:

| #   | expectedKey | message                                       |
| --- | ----------- | --------------------------------------------- |
| 1   | j           | j で "first" に移動                           |
| 2   | dd          | dd で "first" を切り取れ                      |
| 3   | P           | P を押せ。カーソルの上にペースト — 先頭に来た |
| 4   | null        | p は下、P は上にペースト。使い分けを覚えろ    |

**チュートリアル後の状態**: `first\nsecond\nthird` → **ゴール一致で完了！**

**4 行に拡張**:

```
language: plaintext
initialText: 'B\nA\nD\nC'
goalText:    'A\nB\nC\nD'
cursor: (0, 0)
```

**チュートリアル (A を先頭に)**:

| #   | expectedKey | message                                 |
| --- | ----------- | --------------------------------------- |
| 1   | j           | j で "A" に移動                         |
| 2   | dd          | dd で "A" を切り取れ                    |
| 3   | P           | P で上にペースト。先頭に来た            |
| 4   | null        | p は下、P は上。"C" と "D" の順番も直せ |

**チュートリアル後の状態**: `A\nB\nD\nC`
**自力パート**: j + j + j + dd + P = 5 → opt = 5 (ナビ多い)

もっと短く: G (最終行へ) + dd + k + P:
G(1) + dd(1) + k(1) + P(1) = 4 → まだ多い。

j + j + dd + p:
j+j で 'D' に移動、dd で 'D' カット、p で 'C' の下にペースト → `A\nB\nC\nD` ✓
= j(1) + j(1) + dd(1) + p(1) = 4

**自力パート**: j + j + dd + p = 4
**opt**: 4
**stars**: [4, 5, 7], **life**: 10
**hints**: `['j', 'dd', 'P', 'j', 'j', 'dd', 'p']`

---

### N31 — レジスタ ("a〜"z, "0)

**問題**: チュートリアルなし。opt=3 でチュートリアルが完了してしまう。

**ステージ再設計** (N31-T を 2 行化):

```
language: plaintext
initialText: 'hello world\nfoo bar'
goalText:    'hello worldhello\nfoo barfoo'
cursor: (0, 0)
clearConditions: { registers: { a: 'hello', b: 'foo' } }
```

**チュートリアル ("a レジスタのヤンク→ペーストを完全体験)**:

| #   | expectedKey | message                                                       |
| --- | ----------- | ------------------------------------------------------------- |
| 1   | "ayiw       | `"ayiw` と押せ。"hello" を "a レジスタに保存                  |
| 2   | $           | $ で行末に移動                                                |
| 3   | "ap         | `"ap` と押せ。"a レジスタの中身がペーストされる               |
| 4   | null        | "a に保存→"ap で呼び出し。2行目も "b レジスタで同じことをやれ |

**チュートリアル後の状態**: `hello worldhello\nfoo bar`, cursor on pasted "hello"
**自力パート**: j + "byiw + $ + "bp = 4
**opt**: 4
**stars**: [4, 5, 7], **life**: 10
**hints**: `['"ayiw', '$', '"ap', 'j', '"byiw', '$', '"bp']`

N31-P は変更なし。

---

## 変更サマリー

### ステージデータ変更

| ファイル                 | 変更内容                                   |
| ------------------------ | ------------------------------------------ |
| `src/data/stages/N10.ts` | N10-T: テキスト拡張 (3 語追加)             |
| `src/data/stages/N12.ts` | N12-T: 2 方向削除ステージに変更            |
| `src/data/stages/N13.ts` | N13-T: 2 行化。N13-P: D 練習ステージに変更 |
| `src/data/stages/N17.ts` | N17-T: 2 箇所修正に拡張                    |
| `src/data/stages/N18.ts` | N18-T: 2 行化、cf/ct 比較追加              |
| `src/data/stages/N20.ts` | N20-T: 2 箇所修正に拡張                    |
| `src/data/stages/N21.ts` | N21-T: 3 単語に拡張                        |
| `src/data/stages/N22.ts` | N22-T: 2 箇所変更に拡張                    |
| `src/data/stages/N23.ts` | N23-T: 全面変更 (s/S/C 全体験ステージ)     |
| `src/data/stages/N24.ts` | N24-T: 5 単語に拡張                        |
| `src/data/stages/N27.ts` | N27-T: 削除対象 3 行に拡張                 |
| `src/data/stages/N28.ts` | N28-T: 5 行に拡張                          |
| `src/data/stages/N29.ts` | N29-T: ペースト 2 箇所に拡張               |
| `src/data/stages/N30.ts` | N30-T: 全面変更 (p/P 比較ステージ)         |
| `src/data/stages/N31.ts` | N31-T: 2 行化、opt=4 に拡張                |

### チュートリアル新規作成

| ファイル                      | 内容            |
| ----------------------------- | --------------- |
| `src/data/tutorials/N10.ts`   | dw/de 比較      |
| `src/data/tutorials/N12.ts`   | d0 体験         |
| `src/data/tutorials/N13.ts`   | D 体験          |
| `src/data/tutorials/N17.ts`   | dt 体験         |
| `src/data/tutorials/N18.ts`   | cf/ct 比較      |
| `src/data/tutorials/N20.ts`   | ci" 体験        |
| `src/data/tutorials/N21.ts`   | diw 体験        |
| `src/data/tutorials/N22.ts`   | ciw 体験        |
| `src/data/tutorials/N23.ts`   | s/S 体験        |
| `src/data/tutorials/N24.ts`   | ciw + . 体験    |
| `src/data/tutorials/N27.ts`   | V + d 体験      |
| `src/data/tutorials/N28.ts`   | Ctrl+v 体験     |
| `src/data/tutorials/N29.ts`   | yiw + p 体験    |
| `src/data/tutorials/N30.ts`   | dd + P 体験     |
| `src/data/tutorials/N31.ts`   | "a レジスタ体験 |
| `src/data/tutorials/index.ts` | 15 件登録追加   |

### opt 計算まとめ（自力パート）

| Stage | 自力パートの操作       | opt | stars   | life |
| ----- | ---------------------- | --- | ------- | ---- |
| N10-T | dw, dw                 | 2   | [2,3,5] | 8    |
| N12-T | w, l, d$               | 3   | [3,4,6] | 9    |
| N13-T | j, l, D                | 3   | [3,4,6] | 9    |
| N17-T | w, dt2                 | 2   | [2,3,5] | 8    |
| N18-T | j, w, w, ct;…large…Esc | 4   | [4,5,7] | 10   |
| N20-T | f", ci"…large…Esc      | 2   | [2,3,5] | 8    |
| N21-T | diw, diw               | 2   | [2,3,5] | 8    |
| N22-T | w, w, ciw…new…Esc      | 3   | [3,4,6] | 9    |
| N23-T | j, f=, l, C…good;…Esc  | 4   | [4,5,7] | 10   |
| N24-T | w, ., w, ., w, .       | 6   | [6,7,9] | 12   |
| N27-T | V+d, V+d               | 2   | [2,3,5] | 8    |
| N28-T | Ctrl+v(0), j, d        | 2   | [2,3,5] | 8    |
| N29-T | $, p                   | 2   | [2,3,5] | 8    |
| N30-T | j, j, dd, p            | 4   | [4,5,7] | 10   |
| N31-T | j, "byiw, $, "bp       | 4   | [4,5,7] | 10   |

---

## 議論ポイント（全て解決済み）

1. ✅ **N13-P の帰属**: N13-P を D の Practice ステージに変更。s/S/C は N23 に集約。
2. ✅ **N30 の独自性**: N30-T を p/P 比較ステージ (B/A/D/C → A/B/C/D) に変更。
3. ✅ **N24 の拡張度**: 5 単語の同じ変換でOK。`.` の威力を純粋に体感させる。
4. ✅ **N18 の cf/ct undo ループ**: cf→u→ct の両方比較で実施。違いの体験を優先。
5. ✅ **N23 の availableCommands**: s は BASE_COMMANDS に含まれるため追加不要。チュートリアルの expectedKey にも問題なく使用可能。
6. ✅ **N31-T の設計**: 2 行化してチュートリアルでヤンク→ペーストの全フローを教える。自力パートで "b レジスタを体験。opt=4。
