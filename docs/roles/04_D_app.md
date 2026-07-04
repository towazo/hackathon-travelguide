# 担当D：状態管理・結合 手順書

担当ファイル：`src/App.jsx`

先に [00_overview.md](./00_overview.md) の「データの形」「名前の約束」を必ず読んでください。

## ゴール

担当A（フォーム）・担当B（表示）・担当C（AI連携）が作った部品を1つにつなぎ、
「入力→AIに問い合わせ→結果表示」の一連の流れを動かす。

## このファイルが持つもの／持たないもの

- 持つもの：アプリ全体の状態（入力値・結果・読み込み中・エラー）、A/B/Cをつなぐ処理
- 持たないもの：入力欄自体の見た目、カード自体の見た目、AIへの問い合わせの中身（それぞれA・B・Cの仕事）

## 手順

### ステップ1：管理する状態を用意する

このアプリで覚えておく必要がある情報は3つです。

```js
import { useState } from "react";
import SpotSearchForm from "./components/SpotSearchForm";
import SpotResultList from "./components/SpotResultList";
import { getSpots } from "./services/aiSpotService";

function App() {
  const [spots, setSpots] = useState([]);     // AIが提案したスポット一覧
  const [loading, setLoading] = useState(false); // AI問い合わせ中かどうか
  const [error, setError] = useState(null);       // エラーメッセージ

  // この続きをステップ2以降で書いていく
}

export default App;
```

### ステップ2：検索処理をつくる

担当Aから呼ばれる関数（`onSearch`）の中身をここで作ります。担当Cが用意した `getSpots` を呼び出すのがポイントです。

```js
async function handleSearch(from, to) {
  setLoading(true);
  setError(null);

  try {
    const result = await getSpots(from, to);
    setSpots(result);
  } catch (e) {
    setError("寄り道スポットの取得に失敗しました。");
  } finally {
    setLoading(false);
  }
}
```

初心者向けヒント：`async/await` は「AIからの返事が来るまで待つ」ための書き方です。`getSpots` は時間がかかる処理なので、待っている間は `loading` を `true` にして、待ち状態であることを画面に出せるようにします。

### ステップ3：画面を組み立てる（A・Bをつなぐ）

担当Aの`SpotSearchForm`に`handleSearch`を渡し、担当Bの`SpotResultList`に`spots`を渡します。

```js
return (
  <div className="app">
    <h1>寄り道スポット提案</h1>
    <SpotSearchForm onSearch={handleSearch} />
    {loading && <p>探しています...</p>}
    {error && <p className="error">{error}</p>}
    <SpotResultList spots={spots} />
  </div>
);
```

### ステップ4：先にダミーデータで結合しておく

担当Cの本物のAI処理ができあがる前でも、担当Cが用意する「ダミー版の`getSpots`」（[03_C_ai.md](./03_C_ai.md)のステップ1）を使えば、ステップ1〜3をそのまま先に組み立てて動作確認できます。まずはこちらを優先して進めてください。

### ステップ5：本物のAI処理に差し替える

担当Cが本物の`getSpots`を仕上げたら、`import`しているファイルの中身が差し替わるだけなので、`App.jsx`側は基本的に変更不要です。動作確認だけ行ってください。

### ステップ6：通し動作確認

- 「新宿駅」「浅草」などを入力してボタンを押す
- 「探しています...」が一瞬表示され、その後スポット一覧が表示される
- わざと片方の入力を空にしてボタンを押しても壊れないか確認
- （可能であれば）AI呼び出しをわざと失敗させて、エラーメッセージが表示されるか確認

## 完成チェックリスト

- [ ] ダミー版の`getSpots`で一通りの画面遷移が確認できた
- [ ] 本物のAI処理に差し替えても正しく動く
- [ ] 読み込み中の表示が出る
- [ ] エラー時の表示が出る
- [ ] 「新宿駅→浅草」の例で寄り道スポットが画面に表示される
