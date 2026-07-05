# 担当D：拡張された検索条件の中継 手順書

担当ファイル：`src/App.jsx`

> このページは[05_overview_v2.md](./05_overview_v2.md)を読んだ前提で書いています。まだの場合は先にそちらを読んでください。基本用語（state・async/awaitなど）が分からない場合は[00_overview.md](./00_overview.md)・[04_D_app.md](./04_D_app.md)も参照してください。

---

## 1. このページでやること

担当A（[06_A_conditions.md](./06_A_conditions.md)）と担当C（[08_C_ai_v2.md](./08_C_ai_v2.md)）の作業により、以下の2点が変わります。

- `SpotSearchForm`から渡ってくる`onSearch`の引数が、`onSearch(from, to)`から`onSearch({ from, to, date, meal, indoorOnly, parking })`という**1つのオブジェクト**に変わる
- `aiSpotService.js`の`getSpots`も、同じく`getSpots(from, to)`から`getSpots(searchParams)`という**1つのオブジェクト**を受け取る形に変わる

`App.jsx`は「AからCへの橋渡し役」なので、この2つの変更に合わせて`handleSearch`を書き換えます。**表示部分（JSX）は変更不要です。**

---

## 2. 手順

### ステップ1：`handleSearch`の引数をオブジェクトに変更する

現在の`handleSearch`はこうなっています。

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

これを、以下のように変更します。

```js
async function handleSearch(searchParams) {
  setLoading(true);
  setError(null);

  try {
    const result = await getSpots(searchParams);
    setSpots(result);
  } catch (e) {
    setError("寄り道スポットの取得に失敗しました。");
  } finally {
    setLoading(false);
  }
}
```

変更点は2箇所だけです。

- 引数が`(from, to)`から`(searchParams)`という1つの名前に変わりました。`searchParams`の中には、担当Aが作った`{ from, to, date, meal, indoorOnly, parking }`がそのまま入っています。
- `getSpots(from, to)`が`getSpots(searchParams)`に変わりました。受け取った`searchParams`を、分解せずにそのまま`getSpots`に渡しています。

**`loading`・`error`・`spots`まわりの処理（`setLoading`・`try/catch/finally`など）は一切変更不要です。** これは[04_D_app.md](./04_D_app.md)で説明した「担当Dは司令塔で、中身がどう実装されているかを知らなくても、決められた名前で呼び出すだけでよい」という設計の効果です。データの中身が増えても、中継する側のコードはほとんど変わりません。

### ステップ2：JSXは変更不要であることを確認する

```jsx
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

`<SpotSearchForm onSearch={handleSearch} />`の書き方は変わっていません。`handleSearch`が受け取る引数の中身が変わっただけで、「渡す関数の名前」自体は同じだからです。同じ理由で`<SpotResultList spots={spots} />`も変更不要です。

### ステップ3：動作確認

- 担当Aの日付・チェックボックスを操作してから検索し、`App.jsx`側でエラーが出ないことを確認する
- 担当Cの作業が終わっていれば、最寄り駅・移動時間・推定予算・推定滞在時間を含んだ結果が画面に表示されることを確認する
- 担当Cの作業がまだ途中の場合は、一時的に`aiSpotService.js`をダミー版（[05_overview_v2.md](./05_overview_v2.md)のダミーデータをそのまま返す関数）に差し替えて、`App.jsx`側だけ先に動作確認してもよい

---

## 3. つまずきやすいポイント

- **`searchParams.from`のように分解して渡してしまい、`date`などが抜け落ちる**：ステップ1では`searchParams`を分解せず、そのまま`getSpots(searchParams)`に渡してください。個別に取り出す必要はありません。
- **担当Aと担当Cの作業タイミングがズレて、片方だけ新しい形になっている**：例えば担当Aだけが`onSearch`をオブジェクト渡しに変えていて、担当Cの`getSpots`がまだ`(from, to)`のままだと、エラーになります。[05_overview_v2.md](./05_overview_v2.md)の「3. 新しいデータ契約」を全員が同じタイミングで見ながら進めてください。
- **`onSearch`や`getSpots`という名前自体を変えてしまう**：今回変わるのは「渡す中身の形」だけで、関数の「名前」は変えません。名前を変えると、他の担当のコードとつながらなくなります。

---

## 4. 完成チェックリスト

- [ ] `handleSearch`が`searchParams`という1つのオブジェクトを受け取る形になっている
- [ ] `getSpots(searchParams)`のように、分解せずそのまま渡している
- [ ] JSX部分（`<SpotSearchForm />`・`<SpotResultList />`）は変更していない
- [ ] 日付・チェックボックスを変えて検索しても、エラーにならず結果が表示される
- [ ] 最寄り駅・移動時間・推定予算・推定滞在時間を含む結果が、これまで通りの読み込み中・エラー表示の仕組みと一緒に動く
