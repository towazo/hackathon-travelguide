# 担当A：検索条件の追加（日付・チェックボックス） 手順書

担当ファイル：`src/components/SpotSearchForm.jsx`

> このページは[05_overview_v2.md](./05_overview_v2.md)を読んだ前提で書いています。まだの場合は先にそちらを読んでください。基本用語（useState・propsなど）が分からない場合は[00_overview.md](./00_overview.md)も参照してください。

---

## 1. このページでやること

すでに完成している`SpotSearchForm.jsx`（現在地・目的地の入力欄）に、以下を追加します。

- 日付の入力欄（デフォルトは当日）
- チェックボックス3つ（食事の有無・屋内外・駐車場の有無）
- ボタンを押したときに親（`App.jsx`）へ渡す内容を、[05_overview_v2.md](./05_overview_v2.md)で決めた新しいデータの形（オブジェクト1つ）に変更する

**注意：`onSearch`に渡す形が`onSearch(from, to)`という2引数から、`onSearch({ from, to, date, meal, indoorOnly, parking })`という1つのオブジェクトに変わります。** 担当Dがこの新しい形を受け取れるように[09_D_app_v2.md](./09_D_app_v2.md)を用意しているので、安心して変更してください。

---

## 2. 事前に知っておく言葉のおさらい

- **`<input type="date">`**：ブラウザが標準でカレンダーのUIを出してくれる日付専用の入力欄です。値は`"2026-07-05"`のような`"YYYY-MM-DD"`形式の文字列で扱います。
- **`<input type="checkbox">`**：チェックボックスです。文字を入力する`<input>`とは扱い方が少し違い、`value`ではなく**`checked`**（チェックが入っているかどうか、true/false）を使います。
- **`Dateオブジェクト`**：JavaScriptで「今日の日付」や「時刻」を扱うための標準の道具です。今回は「今日の日付を`YYYY-MM-DD`の文字列にする」ために使います。

---

## 3. 手順

### ステップ1：今日の日付を「YYYY-MM-DD」の文字列にする関数を用意する

`SpotSearchForm.jsx`の一番上（`import`のすぐ下）に、今日の日付を文字列で取得する関数を用意します。

```js
function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
```

**なぜこう書くのか（注意点）**：`new Date().toISOString()`という書き方でも日付文字列は作れますが、これは**世界標準時（UTC）**に変換されてしまいます。日本時間の深夜0時〜9時ごろは、UTCではまだ前日のままなので、`toISOString()`を使うと「今日のはずなのに昨日の日付になる」というズレたバグが起きます。上記の書き方は`getFullYear()`・`getMonth()`・`getDate()`という**パソコンが今いる場所の時刻（ローカルタイム）**を使う関数なので、このズレが起きません。

- `today.getMonth()`は0〜11で返ってくる（1月が0）ため、`+ 1`して実際の月に直します。
- `String(...).padStart(2, "0")`は、例えば`7`を`"07"`のように2桁に揃えるためのものです。`YYYY-MM-DD`は月・日とも2桁で表す決まりのためです。

### ステップ2：日付を覚えておくstateを追加する

既存の`from`・`to`のstateの近くに追加します。

```js
const [date, setDate] = useState(getTodayString());
```

- `useState(getTodayString())`：一番最初の値（初期値）を「今日の日付」にしています。ユーザーが何も操作しなくても、最初から今日の日付が入っている状態になります。

### ステップ3：チェックボックス用のstateを3つ追加する

```js
const [meal, setMeal] = useState(false);
const [indoorOnly, setIndoorOnly] = useState(false);
const [parking, setParking] = useState(false);
```

3つとも「最初はチェックなし（希望しない）」を意味する`false`から始めます。

### ステップ4：日付の入力欄をJSXに追加する

現在地・目的地の`<input>`の下あたりに追加します。

```jsx
<div style={styles.inputGroup}>
  <label htmlFor="date-input">日付：</label>
  <input
    id="date-input"
    type="date"
    value={date}
    onChange={(event) => setDate(event.target.value)}
  />
</div>
```

これまでの`from`・`to`の入力欄と考え方は同じで、`type="date"`にしている点だけが違います。

### ステップ5：チェックボックスをJSXに追加する

チェックボックスは`value`ではなく`checked`と`onChange`の中身が少し違うので注意してください。

```jsx
<div style={styles.inputGroup}>
  <label>
    <input
      type="checkbox"
      checked={meal}
      onChange={(event) => setMeal(event.target.checked)}
    />
    食事ができる場所を希望する
  </label>
</div>

<div style={styles.inputGroup}>
  <label>
    <input
      type="checkbox"
      checked={indoorOnly}
      onChange={(event) => setIndoorOnly(event.target.checked)}
    />
    屋内の場所を希望する
  </label>
</div>

<div style={styles.inputGroup}>
  <label>
    <input
      type="checkbox"
      checked={parking}
      onChange={(event) => setParking(event.target.checked)}
    />
    駐車場がある場所を希望する
  </label>
</div>
```

- `checked={meal}`：今の`meal`の値（true/false）を、チェックが入っているかどうかに反映します。
- `onChange={(event) => setMeal(event.target.checked)}`：チェックボックスがクリックされるたびに、`event.target.checked`（クリック後の状態、true/false）で`meal`を書き換えます。文字入力の`event.target.value`との違いに注意してください。
- `<label>`の中に`<input>`と説明文を一緒に入れると、文字をクリックしてもチェックが切り替わるようになり、ユーザーにとって押しやすくなります。

### ステップ6：送信処理を新しいデータの形に書き換える

これまでの`handleSubmit`を、[05_overview_v2.md](./05_overview_v2.md)で決めたオブジェクトの形に変更します。

```js
const handleSubmit = (event) => {
  event.preventDefault();

  if (!from || !to) {
    return;
  }

  onSearch({ from, to, date, meal, indoorOnly, parking });
};
```

- `onSearch(from, to)`という2つの値の渡し方から、`onSearch({ from, to, date, meal, indoorOnly, parking })`という**1つのオブジェクト**の渡し方に変わっている点が今回の一番大事な変更です。
- `{ from, to, date, meal, indoorOnly, parking }`という書き方は、「`from: from, to: to, ...`」の省略形です（変数名とプロパティ名が同じときに使えるショートカットです）。

### ステップ7：動作確認

ブラウザで画面を開き、以下を確認してください。

- 日付欄に最初から今日の日付が入っている
- 日付を変更できる
- 3つのチェックボックスがそれぞれ独立してON/OFFできる
- 検索ボタンを押したときに、ブラウザの開発者ツールのコンソールで一時的に`console.log({ from, to, date, meal, indoorOnly, parking })`のように出力して、意図した値が全部揃っているか確認する（確認できたら削除する）

---

## 4. つまずきやすいポイント

- **チェックボックスに`value`を使ってしまい、チェックしても見た目が変わらない**：チェックボックスは`value`ではなく`checked`を使います。文字入力欄との書き方の違いに注意してください。
- **日付が1日ズレる**：`toISOString()`を使っていないか確認してください（ステップ1の注意点を参照）。
- **`onSearch is not a function`のようなエラーが出る**：担当D側（`App.jsx`）がまだ新しい形（オブジェクト1つ）に対応していない可能性があります。[09_D_app_v2.md](./09_D_app_v2.md)の対応が終わっているか確認してください。

---

## 5. 完成チェックリスト

- [ ] 日付欄に、最初から今日の日付が自動で入っている
- [ ] 日付を自由に変更できる
- [ ] 食事・屋内・駐車場の3つのチェックボックスがそれぞれ独立して動く
- [ ] 検索を押すと、`{ from, to, date, meal, indoorOnly, parking }`という形のオブジェクトが`onSearch`に渡っている
