# Phase 1 ステージ＆チュートリアル再設計

## 設計原則

### 1. チュートリアルはノードの全コマンドを体験させる

- I/A, o/O, Ctrl+d/Ctrl+u のような類似ペアは **1つのステージ内チュートリアル** で両方使う
- D/C/S のような用途が異なるコマンドは **別ステージ＋別チュートリアル** で教える

### 2. チュートリアルだけでステージ完了させない

- チュートリアルはコマンドの **概念を教える**（教官パート）
- チュートリアル終了後に **自力で解く余地** を残す（実践パート）
- opt はチュートリアル後の自力パートの最小ダメージ

### 3. ダメージ計算リファレンス

| 操作                       | ダメージ              |
| -------------------------- | --------------------- |
| 通常コマンド (w, dd, x 等) | 1 (状態変化なしなら0) |
| INSERT セッション (i…Esc)  | ceil(charCount / 5)   |
| 空 INSERT (i→Esc 変化なし) | 0                     |
| Esc, u, Ctrl+R             | 0 (常に無料)          |

### 4. バランス公式 (Teach)

☆3=opt, ☆2=opt+1, ☆1=opt+3, life=opt+6

---

## 全体サマリー

| Node | Commands       | 現状opt | 問題                                   | 再設計後opt | 変更概要                                            |
| ---- | -------------- | ------- | -------------------------------------- | ----------- | --------------------------------------------------- |
| N02  | I, A           | 1       | Aを使わない。チュートリアルで完了      | 3           | 2行化。行頭(I)＋行末(A)を両方体験                   |
| N03  | o, O           | 1       | Oを使わない                            | 2           | 3行挿入。チュートリアルでO/o両方体験                |
| N04  | r              | 2       | チュートリアルで完了                   | 2           | 2行化。typo修正を2箇所に                            |
| N05  | ~              | 1       | チュートリアルで完了                   | 2           | トグル対象を2箇所に分散                             |
| N06  | Ctrl+d, Ctrl+u | 2       | Ctrl+uを使わない。チュートリアルで完了 | 2           | チュートリアルで往復デモ→自力で目標到達             |
| N07  | zz, zt, zb     | 5       | zt/zbを使わない。チュートリアルで完了  | 4           | チュートリアルで3種デモ→自力で目標到達              |
| N09  | \*, #          | 1       | #を使わない。チュートリアルで完了      | 2           | 5行化。チュートリアルで\*/# 両方デモ→自力で目標到達 |
| N11  | dd             | 2       | チュートリアルで完了                   | 2           | debug行を2本に。チュートリアルで1本→自力で1本       |
| N14  | J              | 1       | チュートリアルで完了                   | 2           | 4行→1行結合。チュートリアルで1回→自力で2回          |
| N16  | %              | 2       | チュートリアルで完了                   | 2           | 2行化。チュートリアルで1行目%→自力で2行目%          |
| N26  | >>, <<         | 2       | <<を使わない。チュートリアルで完了     | 2           | >>と<< 両方必要なステージに変更                     |

---

## 各ノード詳細設計

---

### N02 — 行頭/末 Insert (I, A)

**問題**: `fixBug()` → `// fixBug()` は I だけで完了。A 未使用。opt=1 でチュートリアルが全部やってしまう。

**ステージ案**:

```
language: javascript
initialText: 'fix()\nrun()'
goalText:    '/* fix() */\n/* run() */'
cursor: (0, 2)  ← 行の途中（I/A の価値を示す）
```

**チュートリアル (line 1 で I/A 両方体験)**:
| # | message | expectedKey | 効果 |
|---|---------|-------------|------|
| 1 | I を押せ。行頭に飛んで Insert に入る | I | カーソルどこでも行頭Insert |
| 2 | `/*` とスペースを打て。まず / | / | |
| 3 | _ | _ | |
| 4 | Space | (空白) | |
| 5 | Esc で確定 | Esc | `/* fix()` |
| 6 | A を押せ。行末に飛んで Insert に入る | A | 行末Insert |
| 7 | スペース、_、/ と打て。まずスペース | (空白) | |
| 8 | _ | _ | |
| 9 | / | / | |
| 10 | Esc で確定 | Esc | `/_ fix() \*/` |
| 11 | I は行頭、A は行末。残りの行も同じように囲め | null | |

**チュートリアル後の状態**: `/* fix() */\nrun()` — line 2 が未処理
**自力パート**: j → I → `/* ` → Esc → A → ` */` → Esc
**opt**: j(1) + I_session(ceil(3/5)=1) + A_session(ceil(3/5)=1) = **3**
**stars**: [3, 4, 6], **life**: 9

---

### N03 — 新行 Insert (o, O)

**問題**: `hello` → `hello\nworld` は o だけ。O 未使用。

**ステージ案**:

```
language: plaintext
initialText: 'B\nD'
goalText:    'A\nB\nC\nD\nE'
cursor: (0, 0)
```

**チュートリアル (O で上に追加、o で下に追加)**:
| # | message | expectedKey | 効果 |
|---|---------|-------------|------|
| 1 | O を押せ。カーソルの上に新行を作って Insert に入る | O | 上に行追加 |
| 2 | A と打て | A | |
| 3 | Esc | Esc | `A\nB\nD` |
| 4 | j で B に戻れ | j | |
| 5 | o を押せ。カーソルの下に新行を作る | o | 下に行追加 |
| 6 | C と打て | C | |
| 7 | Esc | Esc | `A\nB\nC\nD` |
| 8 | O は上、o は下に新行を作る。残りも追加しろ | null | |

**チュートリアル後の状態**: `A\nB\nC\nD` — `E` が未追加
**自力パート**: j → D に移動、o → `E` → Esc
**opt**: j(1) + o_session(ceil(1/5)=1) = **2**
**stars**: [2, 3, 5], **life**: 8

---

### N04 — 1文字置換 (r)

**問題**: `hallo` → `hello` の1箇所で完了。

**ステージ案**:

```
language: plaintext
initialText: 'hallo\nwarld'
goalText:    'hello\nworld'
cursor: (0, 0)
```

**チュートリアル (line 1 で r を教える)**:
| # | message | expectedKey | 効果 |
|---|---------|-------------|------|
| 1 | l で a の上にカーソルを移動しろ | l | pos 1 |
| 2 | r を押してから e と打て。1文字だけ入れ替える | re | a→e |
| 3 | r は Insert に入らず1文字置換。2行目の typo も直せ | null | |

**チュートリアル後の状態**: `hello\nwarld` — line 2 未修正
**自力パート**: j → line 2 (cursor at col 1)、ro → a→o
**opt**: j(1) + ro(1) = **2**
**stars**: [2, 3, 5], **life**: 8

---

### N05 — 大小切替 (~)

**問題**: `hello World` → `Hello World` は1回の ~ で完了。

**ステージ案**:

```
language: plaintext
initialText: 'hello World'
goalText:    'Hello world'
cursor: (0, 0)
```

**チュートリアル (~ を1回教える)**:
| # | message | expectedKey | 効果 |
|---|---------|-------------|------|
| 1 | ~ を押せ。大文字と小文字を入れ替えるぞ | ~ | h→H, cursor→1 |
| 2 | ~ は大小トグル+カーソル前進。W も小文字に直せ | null | |

**チュートリアル後の状態**: `Hello World` — W が大文字のまま
**自力パート**: w(1) → pos 6 ('W')、~(1) → W→w
**opt**: w(1) + ~(1) = **2**
**stars**: [2, 3, 5], **life**: 8

---

### N06 — 半ページ移動 (Ctrl+d, Ctrl+u)

**問題**: 2×Ctrl+d で到達。Ctrl+u 未使用。チュートリアルで完了。

**ステージ案**: テキストは現行のまま（23行のJS関数）。clearConditions も同じ cursor (16,0)。

**チュートリアル (往復デモ)**:
| # | message | expectedKey | 効果 |
|---|---------|-------------|------|
| 1 | Ctrl+d を押せ。半ページ分カーソルが下に飛ぶ | Ctrl+d | line 8 |
| 2 | Ctrl+u を押せ。今度は上に戻る | Ctrl+u | line 0 |
| 3 | Ctrl+d で下、Ctrl+u で上。目標行まで飛べ | null | |

**チュートリアル後の状態**: cursor (0, 0) — 出発地点に戻る
**自力パート**: Ctrl+d × 2
**opt**: **2**
**stars**: [2, 3, 5], **life**: 8

---

### N07 — 画面位置調整 (zz, zt, zb)

**問題**: zz のみ使用。zt/zb 未体験。チュートリアルで完了。

**ステージ案**: テキストは現行のまま（26行のJS関数）。clearConditions は cursor (18, 0) + viewportTop 10 のまま。

**チュートリアル (3種のビューポート操作をデモ)**:
| # | message | expectedKey | 効果 |
|---|---------|-------------|------|
| 1 | Ctrl+d で半ページ下へ | Ctrl+d | line 8 |
| 2 | zz を押せ。カーソル行が画面中央に来る | zz | viewport center |
| 3 | zt を押せ。カーソル行が画面上端に来る | zt | viewport top |
| 4 | zb を押せ。カーソル行が画面下端に来る | zb | viewport bottom |
| 5 | 3つの画面調整を覚えた。TARGET 行で zz を決めろ | null | |

**チュートリアル後の状態**: cursor (8, 0), viewport は zb 状態
**自力パート**: Ctrl+d(1) → line 16、j(1)、j(1) → line 18、zz(1) → viewportTop 10
**opt**: Ctrl+d(1) + j(1) + j(1) + zz(1) = **4**
**stars**: [4, 5, 7], **life**: 10

---

### N09 — カーソル下検索 (\*, #)

**問題**: \* 1回で到達。# 未使用。

**ステージ案**:

```
language: javascript
initialText: 'let foo = 1;\nlet bar = 2;\nlet foo = 3;\nlet baz = 4;\nlet foo = 5;'
goalText: (同上)
cursor: (0, 4)  ← 最初の foo 上
clearConditions: { cursor: { line: 4, col: 4 } }  ← 最後の foo
```

**チュートリアル (\* と # を両方デモ)**:
| # | message | expectedKey | 効果 |
|---|---------|-------------|------|
| 1 | _ を押せ。カーソル下の foo を前方検索して次に飛ぶ | _ | → line 2 foo |
| 2 | # を押せ。今度は後方検索で戻る | # | → line 0 foo |
| 3 | \* で前方、# で後方。最後の foo まで飛べ | null | |

**チュートリアル後の状態**: cursor (0, 4) — 出発地点に戻る
**自力パート**: _ → line 2、_ → line 4
**opt**: _(1) + _(1) = **2**
**stars**: [2, 3, 5], **life**: 8

---

### N11 — 行削除 (dd)

**問題**: j + dd の2手で完了。

**ステージ案**:

```
language: javascript
initialText: 'const a = 1;\nconsole.log("debug1");\nconst b = 2;\nconsole.log("debug2");\nconst c = 3;'
goalText:    'const a = 1;\nconst b = 2;\nconst c = 3;'
cursor: (0, 0)
```

**チュートリアル (1本目の debug 行を消す)**:
| # | message | expectedKey | 効果 |
|---|---------|-------------|------|
| 1 | j でデバッグ行に移動しろ | j | line 1 |
| 2 | dd を押せ。行まるごと消える | dd | debug1 削除 |
| 3 | dd は行削除。もう1本のデバッグ行も消せ | null | |

**チュートリアル後の状態**: `const a = 1;\nconst b = 2;\nconsole.log("debug2");\nconst c = 3;`
— debug2 が残っている
**自力パート**: j → debug2 行、dd → 削除
**opt**: j(1) + dd(1) = **2**
**stars**: [2, 3, 5], **life**: 8

---

### N14 — 行結合 (J)

**問題**: 2行を J 1回で結合して完了。

**ステージ案**:

```
language: plaintext
initialText: 'hello\nbeautiful\nworld'
goalText:    'hello beautiful world'
cursor: (0, 0)
```

**チュートリアル (J を1回体験)**:
| # | message | expectedKey | 効果 |
|---|---------|-------------|------|
| 1 | J を押せ。下の行を現在行にくっつける | J | `hello beautiful\nworld` |
| 2 | J は行結合。残りも1行にまとめろ | null | |

**チュートリアル後の状態**: `hello beautiful\nworld` — 3行目がまだ別行
**自力パート**: J → 結合
**opt**: J(1) = **1** (ちょっと少ないか？)

**代替案 (opt=2)**:

```
initialText: 'hello\nbeautiful\nwonderful\nworld'
goalText:    'hello beautiful wonderful world'
```

**自力パート**: J × 2 = **2**
**stars**: [2, 3, 5], **life**: 8

---

### N16 — 括弧ジャンプ (%)

**問題**: f{ + % で到達。チュートリアルで完了。

**ステージ案**:

```
language: javascript
initialText: 'if (a) { return x; }\nif (b) { return y; }'
goalText: (同上)
cursor: (0, 0)
clearConditions: { cursor: { line: 1, col: 19 } }  ← 2行目の `}` 位置
```

**チュートリアル (line 1 で % を体験)**:
| # | message | expectedKey | 効果 |
|---|---------|-------------|------|
| 1 | f{ と押せ。{ に直接飛べる | f{ | line 1 の `{` |
| 2 | % を押せ。対応する } にジャンプする | % | line 1 の `}` |
| 3 | % で括弧の対を行き来できる。2行目でも同じことをやれ | null | |

**チュートリアル後の状態**: cursor at line 1 の `}`
**自力パート**: j → line 2、^ or 0 → 行頭、f{ → `{`、% → `}`
**opt**: j(1) + 0(1) + f{(1) + %(1) = **4**

**代替案** (0 を省略できるか検討):
j 後のカーソル位置が line 2 の col 19 (`}`)。0 で行頭に戻り、f{ で `{` に飛ぶ。
もしくは F{ (後方 f) で `{` に飛べる。F{ は f の逆方向で1コマンド。
j(1) + F{(1) + %(1) = **3**

**opt=3 の場合**: stars = [3, 4, 6], life = 9

---

### N26 — インデント (>>, <<)

**問題**: >> のみ使用。<< 未体験。

**ステージ案**:

```
language: python
initialText: 'def greet():\nprint("hi")\n  return None'
goalText:    'def greet():\n  print("hi")\nreturn None'
cursor: (0, 0)
```

**チュートリアル (>> と << 両方体験)**:
| # | message | expectedKey | 効果 |
|---|---------|-------------|------|
| 1 | j で print の行に移動しろ | j | line 1 |
| 2 | >> と押せ。インデントを追加する | >> | print にインデント |
| 3 | j で return の行に移動しろ | j | line 2 |
| 4 | << と押せ。インデントを削除する | << | return のインデント削除 |
| 5 | >> で追加、<< で削除。コードの構造を整えろ | null | |

**チュートリアル後の状態**: ゴールと一致 → **ステージ完了してしまう！**

**代替案**: 4行に拡張

```
language: python
initialText: 'def greet():\nprint("hi")\nprint("bye")\n  return None'
goalText:    'def greet():\n  print("hi")\n  print("bye")\nreturn None'
cursor: (0, 0)
```

**チュートリアル (line 1-2 で >>/<< を教える)**:
| # | message | expectedKey | 効果 |
|---|---------|-------------|------|
| 1 | j で print の行に移動しろ | j | line 1 |
| 2 | >> と押せ。インデントを追加する | >> | `  print("hi")` |
| 3 | 2j で return の行に移動しろ | j | line 2 (print("bye")) |
| 4 | ここは飛ばして次へ。j をもう一回 | j | line 3 (return) |
| 5 | << と押せ。インデントを削除する | << | `return None` |
| 6 | >> で追加、<< で削除。残りの行も直せ | null | |

**チュートリアル後の状態**: `def greet():\n  print("hi")\nprint("bye")\nreturn None`
— print("bye") のインデントが足りない

**自力パート**: k(1) → line 2、>>(1) → インデント追加
**opt**: k(1) + >>(1) = **2**
**stars**: [2, 3, 5], **life**: 8

---

## 議論ポイント

1. **N14 の opt**: 1 だと少なすぎるか？ 4行版 (opt=2) が良いか？
2. **N16 の opt**: F{ を使える前提で opt=3？ それとも 0+f{ で opt=4？
3. **N07 のチュートリアル**: zz/zt/zb 全てを体験させると5ステップ。長すぎないか？
4. **N26 のチュートリアル**: >> の後にスキップして << を教えるフローが不自然でないか？
5. **全体的な難易度**: opt=2～4 の範囲で適切か？ Teach ステージとして自力パートの分量は十分か？
