# 担当B：カード表示の拡張 手順書

担当ファイル：`src/components/SpotCard.jsx`（`src/components/SpotResultList.jsx`は変更不要です）

> このページは[05_overview_v2.md](./05_overview_v2.md)を読んだ前提で書いています。まだの場合は先にそちらを読んでください。基本用語（props・配列など）が分からない場合は[00_overview.md](./00_overview.md)も参照してください。

---

## 1. このページでやること

すでに完成している`SpotCard.jsx`（名前・説明・おすすめ理由の表示）に、以下の項目を追加表示します。

- 最寄り駅（`nearestStation`）
- 現在地からの移動時間（`travelTime`）
- 推定予算（`budget`）
- 推定滞在時間（`stayDuration`）
- スポットの詳細を見るためのリンク（`link`）

`SpotResultList.jsx`は、これまで通り`spots`を1件ずつ`SpotCard`に渡すだけなので、**変更は不要**です。1件分のオブジェクト（`spot`）に項目が増えるだけで、渡し方自体は変わりません。

---

## 2. 新しいデータの形（おさらい）

[05_overview_v2.md](./05_overview_v2.md)で決めた通り、`spot`は以下の形になります。

```js
{
  name: "上野公園",
  description: "自然を楽しみながら休憩できる",
  reason: "移動ルートの近くにあり気分転換になるため",
  nearestStation: "上野駅",
  travelTime: "電車で約15分",
  budget: "0円〜500円",
  stayDuration: "30分〜1時間",
  link: "https://www.google.com/maps/search/?api=1&query=上野公園",
}
```

担当Cの作業が終わるまでは、上記のような**ダミーデータ**を使って先に見た目を作って構いません。

---

## 3. 事前に知っておく言葉のおさらい

- **`<a>`タグ**：クリックするとリンク先に移動する、HTMLの標準的な「リンク」タグです。`href`にリンク先のURLを指定します。
- **`target="_blank"`**：リンクを「新しいタブ」で開く指定です。ユーザーが元のページ（自分たちのサイト）を離れずに、地図を別タブで確認できるようにするために使います。
- **`rel="noopener noreferrer"`**：`target="_blank"`とセットで使う、セキュリティ上のおまじないです。新しいタブで開いたページから、元のページを操作されてしまう可能性を防ぎます。`target="_blank"`を使うときは必ずセットで書くようにしてください。

---

## 4. 手順

### ステップ1：新しい項目を表示する部分を追加する

既存の`name`・`description`・`reason`を表示している部分の下に追加します。

```jsx
function SpotCard({ spot }) {
  return (
    <div className="card w-full bg-base-100 shadow-xl border border-base-300">
      <div className="card-body p-4">
        <h3 className="card-title text-lg font-bold text-primary">{spot.name}</h3>
        <p className="text-sm text-base-content/80">{spot.description}</p>

        <div className="mt-2 p-2 bg-base-200 rounded-lg text-xs">
          <span className="font-semibold text-secondary">おすすめ理由：</span>
          <span className="text-base-content/70">{spot.reason}</span>
        </div>

        <div className="mt-2 text-xs text-base-content/70 grid grid-cols-2 gap-1">
          <span>最寄り駅：{spot.nearestStation}</span>
          <span>移動時間：{spot.travelTime}</span>
          <span>推定予算：{spot.budget}</span>
          <span>滞在時間：{spot.stayDuration}</span>
        </div>

        {spot.link && (
          <a
            href={spot.link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline btn-primary mt-2"
          >
            地図で見る
          </a>
        )}
      </div>
    </div>
  );
}

export default SpotCard;
```

1行ずつ説明します。

- `<span>最寄り駅：{spot.nearestStation}</span>`：既存の`spot.name`などと同じ考え方で、`spot`オブジェクトの中の新しい項目をそのまま表示しています。
- `{spot.link && ( <a ...>地図で見る</a> )}`：`spot.link`が存在するとき（空文字や`undefined`でないとき）だけ、リンクボタンを表示します。もしAIがリンクを作れなかった場合に備えて、リンクが無くてもカード自体は壊れないようにする安全策です。
- `href={spot.link}`：リンク先のURL（担当Cがコード側で組み立てたGoogleマップの検索URL）を指定します。
- `target="_blank" rel="noopener noreferrer"`：新しいタブで安全に開くための2点セットです。

**クラス名（`className`）について**：既存のコードは`card`や`btn`のようなクラス名を使ったデザイン（フレームワークのクラス）が使われています。同じ書き方に揃えていますが、見た目を独自に調整したい場合は自由に変更して構いません。重要なのは**表示する項目とロジック（`spot.〜`の参照、`&&`によるガード）**の部分です。

### ステップ2：動作確認

ダミーデータ（このページの「2. 新しいデータの形」に載っている例）を使って、以下を確認してください。

- 最寄り駅・移動時間・推定予算・推定滞在時間が、カードの中にきちんと表示される
- 「地図で見る」のようなリンクボタンが表示され、クリックするとGoogleマップが新しいタブで開く
- 試しに`link`を`spot`から一時的に削除したダミーデータを使い、リンクボタンが表示されないだけでカード自体はエラーにならないことを確認する

---

## 5. つまずきやすいポイント

- **`Cannot read properties of undefined`のようなエラーが出る**：担当Cの作業がまだ終わっておらず、AIからの返事に`nearestStation`などの項目がまだ含まれていない可能性があります。その間はダミーデータで確認を進めてください。
- **リンクを押しても何も起きない、別タブが開かない**：`target="_blank"`のスペルミスや、`href`に正しいURLが入っているか確認してください。
- **リンクが常に表示されてしまい、リンクが無いときに壊れた表示になる**：`{spot.link && (...)}`のガードが正しく書けているか確認してください。

---

## 6. 完成チェックリスト

- [ ] 最寄り駅・移動時間・推定予算・推定滞在時間がカードに表示される
- [ ] リンクボタンをクリックすると、Googleマップが新しいタブで開く
- [ ] `link`が無いデータでも、カード自体はエラーにならず表示される
- [ ] `SpotResultList.jsx`は変更していない（変更不要なことを確認済み）
