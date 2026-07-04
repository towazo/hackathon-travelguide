# 担当D：状態管理・結合 手順書

担当ファイル：`src/App.jsx`

> このページだけを読んでも作業できるように書いていますが、`spots`や`props`といった言葉が分からない場合は、先に [00_overview.md](./00_overview.md) を読んでください。特に「4. 用語集」「6. 名前の約束」は必ず目を通してください。

---

## 1. このファイルは何をするものか

担当A（入力フォーム）・担当B（結果表示）・担当C（AI連携）は、それぞれ「部品」を別々に作ります。それらの部品を1つにまとめ、「入力→AIに問い合わせ→結果表示」という一連の流れを実際に動かすのが、担当Dの仕事です。

イメージとしては、担当Dは「司令塔」です。自分では入力欄もカードの見た目も作りませんが、「今どういう状態か（入力待ちか、AIの返事待ちか、結果が出たか、失敗したか）」を覚えておき、他の部品に「今の状態」を伝える役割を持ちます。

**注意：ここでは入力欄自体の見た目や、カード自体の見た目、AIへの問い合わせの中身は作りません。** それぞれ担当A・B・Cの仕事です。担当Dは「みんなが作った部品をつなげて、正しい順番で動かす」ところが担当範囲です。

---

## 2. 全体の中でのこのファイルの位置

`App`は、[00_overview.md](./00_overview.md)の流れ図に登場するほぼすべての矢印に関わります。

```
┌─────────────────────────┐
│ SpotSearchForm（担当A）        │
└─────────────────────────┘
    ↓ onSearch("新宿駅", "浅草") を呼び出す
┌─────────────────────────┐
│ App（★ここが担当D）            │
│ ・loading を true にする（読込中）  │
└─────────────────────────┘
    ↓ getSpots("新宿駅", "浅草") を呼び出す
┌─────────────────────────┐
│ aiSpotService（担当C）         │
└─────────────────────────┘
    ↓ [{name, description, reason}, ...] を返す
┌─────────────────────────┐
│ App（★ここが担当D）            │
│ ・spots にAIの返事を保存する         │
│ ・loading を false にする         │
└─────────────────────────┘
    ↓ spots を渡す
┌─────────────────────────┐
│ SpotResultList（担当B）        │
└─────────────────────────┘
```

---

## 3. 事前に知っておく言葉のおさらい

- **state（ステート）／useState**：コンポーネントが覚えておく必要がある値のことです。今回は「AIの提案結果（`spots`）」「読み込み中かどうか（`loading`）」「エラーメッセージ（`error`）」の3つを覚えておく必要があります。
- **async/await**：時間がかかる処理（AIへの問い合わせ）が終わるのを待ってから、次の処理に進むための書き方です。
- **try/catch/finally**：`try`の中の処理を試し、失敗したら`catch`の中身が実行されます。`finally`は、成功しても失敗しても必ず最後に実行される部分です。今回は「AIへの問い合わせが終わったら、成功でも失敗でも読み込み中の表示を消す」ために使います。
- **条件付きレンダリング（`{条件 && <p>...</p>}`）**：ある条件が`true`のときだけ、画面に何かを表示する書き方です。「読み込み中のときだけ『探しています…』を表示する」といった場面で使います。

---

## 4. 手順

### ステップ1：管理する状態（state）を用意する

このアプリ全体で覚えておく必要がある情報は、以下の3つです。

```js
import { useState } from "react";
import SpotSearchForm from "./components/SpotSearchForm";
import SpotResultList from "./components/SpotResultList";
import { getSpots } from "./services/aiSpotService";

function App() {
  const [spots, setSpots] = useState([]);        // AIが提案したスポット一覧
  const [loading, setLoading] = useState(false); // AI問い合わせ中かどうか
  const [error, setError] = useState(null);       // エラーメッセージ

  // この続きをステップ2以降で書いていく
}

export default App;
```

- `import SpotSearchForm from "./components/SpotSearchForm";`のような行で、担当A・B・Cがそれぞれ作った部品や関数を、このファイルで使えるように読み込みます。
- `useState([])`：`spots`は最初「まだ何も提案されていない」状態なので、空の配列`[]`から始めます。
- `useState(false)`：`loading`は最初「読み込み中ではない」状態なので、`false`から始めます。
- `useState(null)`：`error`は最初「エラーは起きていない」状態なので、`null`（何もないことを表す値）から始めます。

### ステップ2：検索処理をつくる

担当Aから呼ばれる関数（`onSearch`として渡すもの）の中身をここで作ります。担当Cが用意した`getSpots`を呼び出すのがポイントです。

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

1行ずつ説明します。

- `async function handleSearch(from, to) {`：検索が始まったときに実行する関数です。`async`がついているのは、中でAIへの問い合わせ（時間がかかる処理）を`await`で待つ必要があるためです。
- `setLoading(true);`：検索が始まったので、「読み込み中」の状態にします。この直後、画面には「探しています…」のような表示が出るようにします（ステップ3で作ります）。
- `setError(null);`：前回の検索でエラーが残っていた場合に備えて、エラー表示を一度リセットします。
- `const result = await getSpots(from, to);`：担当Cの`getSpots`を呼び出し、AIからの返事（整形済みの配列）が返ってくるのを待ちます。
- `setSpots(result);`：受け取った結果を`spots`に保存します。この瞬間、画面が自動的に描き直され、担当Bの`SpotResultList`にカードが表示されます。
- `catch (e) { setError(...); }`：`getSpots`の中でエラーが`throw`された場合（[03_C_ai.md](./03_C_ai.md)のステップ5参照）、ここで受け止めて、ユーザー向けのエラーメッセージを保存します。
- `finally { setLoading(false); }`：成功した場合も失敗した場合も、最後に必ず「読み込み中」の状態を解除します。

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

- `<SpotSearchForm onSearch={handleSearch} />`：担当Aが作ったフォーム部品に、「入力が完了したらこの関数を呼んでね」と`handleSearch`を渡します。担当Aの[01_A_form.md](./01_A_form.md)ステップ1で説明した`{ onSearch }`が、ここで渡している関数です。
- `{loading && <p>探しています...</p>}`：`loading`が`true`のときだけ、この`<p>`が表示されます。`false`のときは何も表示されません（`&&`は「左側が`true`なら右側を評価する」という意味です）。
- `{error && <p className="error">{error}</p>}`：`error`に何か文字列が入っているときだけ、エラーメッセージを表示します。`error`が`null`のときは何も表示されません。
- `<SpotResultList spots={spots} />`：担当Bが作った一覧表示部品に、今の`spots`（配列）を渡します。

### ステップ4：先にダミーデータで結合しておく

担当Cの本物のAI処理ができあがる前でも、担当Cが用意する「ダミー版の`getSpots`」（[03_C_ai.md](./03_C_ai.md)のステップ1）を使えば、ステップ1〜3をそのまま先に組み立てて動作確認できます。まずはこちらを優先して進めてください。理由は[00_overview.md](./00_overview.md)の「8. 進め方のコツ」で説明した通り、他の担当を待たせないためです。

### ステップ5：本物のAI処理に差し替える

担当Cが本物の`getSpots`を仕上げたら、`import { getSpots } from "./services/aiSpotService";`の行が指しているファイルの中身が差し替わるだけなので、`App.jsx`側は基本的に変更不要です。動作確認だけ行ってください。

### ステップ6：通し動作確認

実際にブラウザで画面を開き、以下を確認してください。

- 「新宿駅」「浅草」などを入力してボタンを押す
- 一瞬「探しています...」が表示され、その後スポット一覧が表示される
- わざと片方の入力を空にしてボタンを押しても、アプリが壊れない（担当Aの空欄チェックが効いている）
- （可能であれば）AI呼び出しをわざと失敗させて（例：APIキーを一時的に間違った値にするなど）、エラーメッセージが表示されるか確認し、確認後は元に戻す

---

## 5. つまずきやすいポイント

- **ボタンを押しても何も起きない**：`SpotSearchForm`に`onSearch={handleSearch}`を渡し忘れている、またはprops名のスペルが違う（`onSerch`など）可能性があります。
- **「探しています…」が消えない**：`finally`ブロックで`setLoading(false)`を呼び忘れていないか確認してください。
- **カードが表示されない**：`SpotResultList`に`spots={spots}`を渡し忘れている、または`getSpots`が期待した形の配列を返していない可能性があります。担当B・Cと合わせて確認してください。

---

## 6. 完成チェックリスト

- [ ] ダミー版の`getSpots`で一通りの画面遷移が確認できた
- [ ] 本物のAI処理に差し替えても正しく動く
- [ ] 読み込み中の表示が出る
- [ ] エラー時の表示が出る
- [ ] 「新宿駅→浅草」の例で寄り道スポットが画面に表示される
