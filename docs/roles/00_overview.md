# 役割分担 全体共有事項

作業を始める前に、必ず4人全員でこのページの内容に合意してください。
ここがズレると、あとで結合するときにエラーが多発します。

## 1. データの形（全員共通のお約束）

AIが提案する「寄り道スポット」は、以下の形のオブジェクトの配列とします。

```js
[
  { name: "上野公園", description: "自然を楽しみながら休憩できる", reason: "移動ルートの近くにあり気分転換になるため" },
  { name: "秋葉原", description: "買い物や観光に立ち寄りやすい", reason: "乗り換え駅から近いため" },
]
```

- `name`: スポット名（文字列）
- `description`: どんな場所か（文字列）
- `reason`: おすすめ理由（文字列）

この配列を、担当Dが `spots` という名前の state で管理し、担当Bのコンポーネントに渡します。

## 2. 関数・propsの名前の約束

| 名前 | 使う場所 | 内容 |
|---|---|---|
| `onSearch(from, to)` | SpotSearchForm → App | フォーム送信時にAppへ現在地・目的地を伝える関数 |
| `getSpots(from, to)` | aiSpotService.js | AIに問い合わせてspots配列を返す関数（async） |
| `spots` | App → SpotResultList | 表示するスポットの配列 |
| `spot` | SpotResultList → SpotCard | 1件分のスポットオブジェクト |
| `loading` | App内部 | AIの応答待ち状態（true/false） |
| `error` | App内部 | エラーメッセージ（文字列 or null） |

この表の名前は変更しないでください。変更する場合は必ず4人に共有してから行うこと。

## 3. 担当ファイル一覧

| 担当 | 手順書 | 主な担当ファイル |
|---|---|---|
| A | [01_A_form.md](./01_A_form.md) | `src/components/SpotSearchForm.jsx` |
| B | [02_B_display.md](./02_B_display.md) | `src/components/SpotResultList.jsx`, `src/components/SpotCard.jsx`, `src/styles/App.css` |
| C | [03_C_ai.md](./03_C_ai.md) | `src/services/aiSpotService.js` |
| D | [04_D_app.md](./04_D_app.md) | `src/App.jsx` |

## 4. 進め方のコツ

- 最初は本物のAIを使わず、**ダミーデータ**（上の配列をそのまま使う）で各自の画面を動かして確認してから、担当Cの本物のAI処理に差し替える
- 困ったときは自分のファイルだけで悩まず、上の表の「名前の約束」に立ち返って確認する
- 完成の目安：「新宿駅」「浅草」と入力してボタンを押すと、寄り道スポットが3件くらい画面に表示される
