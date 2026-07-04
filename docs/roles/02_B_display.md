# 担当B：結果表示 手順書

担当ファイル：`src/components/SpotResultList.jsx`、`src/components/SpotCard.jsx`、`src/styles/App.css`

先に [00_overview.md](./00_overview.md) の「データの形」を必ず読んでください。

## ゴール

AIが提案したスポットの配列（`spots`）を受け取り、1件ずつカードのような見た目で並べて表示する。

## このファイルが持つもの／持たないもの

- 持つもの：一覧の並べ方、1件分の見た目、全体の最低限のデザイン
- 持たないもの：AIの呼び出し、入力フォーム（それは担当C・Aの仕事）

## 手順

### ステップ1：ダミーデータで確認できるようにする

担当C（AI連携）の実装を待たずに作業を進めるため、最初は[00_overview.md](./00_overview.md)に載っているダミーの配列をそのまま使って画面を組んでください。あとで担当Dが本物のデータに差し替えます。

### ステップ2：SpotCard.jsx を作る（1件分の表示）

先に「部品」から作ると分かりやすいです。1件分のスポット情報を受け取り、名前・説明・理由を表示します。

```js
function SpotCard({ spot }) {
  return (
    <div className="spot-card">
      <h3>{spot.name}</h3>
      <p>{spot.description}</p>
      <p className="reason">おすすめ理由：{spot.reason}</p>
    </div>
  );
}

export default SpotCard;
```

ポイント：`spot` は `{ name, description, reason }` の形のオブジェクト1個です（配列ではありません）。

### ステップ3：SpotResultList.jsx を作る（一覧表示）

`spots`（配列）を受け取り、`.map()` を使って1件ずつ `SpotCard` に渡します。

```js
import SpotCard from "./SpotCard";

function SpotResultList({ spots }) {
  if (spots.length === 0) {
    return <p>寄り道スポットはまだありません。</p>;
  }

  return (
    <div className="spot-result-list">
      {spots.map((spot) => (
        <SpotCard key={spot.name} spot={spot} />
      ))}
    </div>
  );
}

export default SpotResultList;
```

初心者向けヒント：
- `.map()` は配列の中身を1つずつ取り出して、別の形（ここではJSX）に変換するための関数です
- `key={spot.name}` はReactが「どのカードがどれか」を区別するために必要です（今回は名前が重複しない前提でOK）

### ステップ4：App.css で最低限の見た目を整える

凝ったデザインは不要です。以下のような最低限のクラスがあれば十分です。

- `.spot-result-list`：カードを縦に並べる、間隔を空ける（例：`display: flex; flex-direction: column; gap: 12px;`）
- `.spot-card`：枠線・角丸・余白をつける（例：`border: 1px solid #ccc; border-radius: 8px; padding: 12px;`）
- `.reason`：文字色を少し薄くする、など

### ステップ5：動作確認

担当Aが作った動作確認用の `console.log` の代わりに、Appの中に一時的にダミーの`spots`配列を用意してもらい（担当Dに依頼、または自分で一時的に書いて後で消す）、実際に画面にカードが3件くらい並ぶか確認してください。

## 完成チェックリスト

- [ ] ダミーデータで3件程度のカードが画面に並ぶ
- [ ] 各カードに名前・説明・おすすめ理由が表示される
- [ ] `spots` が空配列のときにエラーにならず、代わりのメッセージが出る
- [ ] 最低限見やすいレイアウトになっている
