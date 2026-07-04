# 担当A：入力フォーム 手順書

担当ファイル：`src/components/SpotSearchForm.jsx`

先に [00_overview.md](./00_overview.md) の「データの形」「名前の約束」を必ず読んでください。

## ゴール

「現在地」と「目的地」を入力できる2つの入力欄と、送信ボタンを作る。
ボタンが押されたら、入力された2つの値を親（App.jsx）に伝える。

## このファイルが持つもの／持たないもの

- 持つもの：入力欄の見た目、入力中の値の管理
- 持たないもの：AIの呼び出し、結果の表示（それは担当C・Bの仕事）

## 手順

### ステップ1：入力値を覚える場所を作る

入力欄に文字を打つたびに値を覚えておく必要があります。Reactでは `useState` を使います。

```js
import { useState } from "react";

function SpotSearchForm({ onSearch }) {
  const [from, setFrom] = useState(""); // 現在地
  const [to, setTo] = useState("");     // 目的地

  // この続きをステップ2以降で書いていく
}

export default SpotSearchForm;
```

ポイント：
- `from` が現在地、`to` が目的地です（[00_overview.md](./00_overview.md)の名前の約束に合わせています）
- `{ onSearch }` は親（App.jsx）から渡される関数です。担当Dが用意します。

### ステップ2：入力欄のJSXを作る

`<input>` を2つと、送信用の `<button>`（またはフォームの `<form>`）を用意します。

- 1つ目の`<input>`：`value={from}`、文字が変わったら `setFrom(...)` で更新
- 2つ目の`<input>`：`value={to}`、文字が変わったら `setTo(...)` で更新
- 入力欄には `placeholder="現在地（例：新宿駅）"` のようなヒント文言を入れると親切

初心者向けヒント：`<input>`の`onChange`イベントには、入力された今の文字列が `event.target.value` に入っています。

### ステップ3：送信処理を作る

ボタンが押された（またはフォームがsubmitされた）ときに呼ばれる関数を作り、その中で親から受け取った `onSearch` を呼び出します。

```js
function handleSubmit(event) {
  event.preventDefault(); // ページ再読み込みを防ぐ（<form>を使う場合）
  onSearch(from, to);     // 親（App.jsx）に現在地・目的地を渡す
}
```

この `handleSubmit` を `<form onSubmit={handleSubmit}>` や `<button onClick={handleSubmit}>` に紐づけます。

### ステップ4：空欄チェック（最低限でOK）

`from` か `to` が空文字のときはボタンを押しても何も起きないようにする、程度の簡単なチェックで十分です（例：`if (!from || !to) return;` を`handleSubmit`の先頭に追加）。

### ステップ5：動作確認

まだ担当C・Dの実装が終わっていない場合は、`onSearch` の代わりに一時的に以下のようにして、入力した値が正しく取れているか確認してください。

```js
// 動作確認用（あとで削除してOK）
function handleSubmit(event) {
  event.preventDefault();
  console.log("入力値の確認:", from, to);
}
```

ブラウザの開発者ツール（コンソール）に入力した文字が表示されればOKです。

## 完成チェックリスト

- [ ] 現在地・目的地の2つの入力欄がある
- [ ] 入力した文字が画面の入力欄にちゃんと反映される
- [ ] ボタンを押すと `onSearch(from, to)` が呼ばれる
- [ ] 空欄のまま送信してもエラーにならない
