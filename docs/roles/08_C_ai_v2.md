# 担当C：Netlify Functions完成＋AI連携の拡張 手順書

担当ファイル：`src/services/aiSpotService.js`、`server/index.js`、`netlify/functions/spots.js`、`netlify.toml`

> このページは[05_overview_v2.md](./05_overview_v2.md)を読んだ前提で書いています。まだの場合は先にそちらを読んでください。サーバー・Netlify Functionsの基本用語は[03_C_ai.md](./03_C_ai.md)にまとめてあるので、分からない言葉が出たらそちらも参照してください。

---

## 1. このページでやること（2つあります）

現在の状況を確認したところ、以下の2つの作業が必要です。

- **パートA：積み残しのNetlify Functions対応を終わらせる** — `netlify/functions/spots.js`はほぼ空、`netlify.toml`もまだ作られておらず、公開後のサイトではAIが一切動きません。これを最優先で終わらせます。
- **パートB：日付・条件チェックボックスをAIへの問い合わせに反映し、新しい項目（最寄り駅・移動時間・推定予算・推定滞在時間・リンク）を取得できるようにする**

**パートAを終えてからパートBに進んでください。** 土台（公開後も動く状態）ができていないまま項目を増やしても、動作確認ができません。

---

## 2. パートA：Netlify Functionsを完成させる

### 2-1. 今の状況

- `server/index.js`：完成済みで、ローカルでは動く状態です
- `netlify/functions/spots.js`：ファイルはありますが中身がほぼ空です
- `netlify.toml`：まだ存在しません

このままNetlifyに公開しても、`/api/spots`宛のリクエストは404になります（実際に確認済みです）。

### 2-2. `netlify/functions/spots.js`の中身を作る

`server/index.js`にすでにある`buildPrompt`・`callAI`・`parseSpots`をほぼそのまま使い、Expressの`req`/`res`の部分だけをNetlify Functions向けの書き方に変えます。

```js
require("dotenv").config();

function buildPrompt(from, to) {
  return `
${from}から${to}まで移動する途中で立ち寄れる「寄り道スポット」を3つ提案してください。
以下のJSON配列の形式だけで出力してください。説明文や前置きは不要です。

[
  { "name": "スポット名", "description": "どんな場所か", "reason": "おすすめ理由" }
]
`;
}

async function callAI(prompt) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouterへの問い合わせに失敗しました（ステータス: ${response.status}）`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

function parseSpots(responseText) {
  try {
    return JSON.parse(responseText);
  } catch (e) {
    console.error("AIの返事をJSONとして読み取れませんでした:", responseText);
    return [];
  }
}

exports.handler = async function (event) {
  const { from, to } = JSON.parse(event.body);

  try {
    const prompt = buildPrompt(from, to);
    const responseText = await callAI(prompt);
    const spots = parseSpots(responseText);

    return {
      statusCode: 200,
      body: JSON.stringify(spots),
    };
  } catch (e) {
    console.error("AIへの問い合わせに失敗しました:", e);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "寄り道スポットの取得に失敗しました。" }),
    };
  }
};
```

`server/index.js`との違いは以下の2点だけです。

- `req`・`res`の代わりに`event`という1つの引数を受け取り、ブラウザが送ったデータは`event.body`に**文字列のまま**入っているため`JSON.parse(event.body)`で自分で変換します。
- 返事は`res.json(...)`ではなく、`{ statusCode, body }`という形のオブジェクトを`return`します（`body`は文字列である必要があるので`JSON.stringify(...)`します）。

このステップの時点では`buildPrompt`・`callAI`・`parseSpots`は`server/index.js`と同じ内容のままで構いません（パートBでまとめて拡張します）。

### 2-3. `netlify.toml`を作る

プロジェクトのルート（`package.json`と同じ階層）に新規作成します。

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

`[[redirects]]`の設定により、`/api/spots`宛のリクエストが自動で`/.netlify/functions/spots`に転送されます。これにより`aiSpotService.js`側は`fetch("/api/spots")`のままで変更不要です。

### 2-4. ローカルで確認する

```
npx netlify dev
```

表示されたURL（例：`http://localhost:8888`）を開いて、いつも通り検索を試してください。うまくいけば、これまでの「2ターミナル方式（`npm run dev` + `node server/index.js`）」の代わりに、この1コマンドで確認できます。

### 2-5. Netlifyの管理画面で環境変数を設定する

`.env`はあなたのパソコンの中だけのファイルで、Netlifyには自動で送られません。

1. [app.netlify.com](https://app.netlify.com)で対象のサイトを開く
2. 「Site configuration」→「Environment variables」
3. 「Add a variable」から`OPENROUTER_API_KEY`という名前で、実際のAPIキーの値を設定する

### 2-6. push して公開後の動作を確認する

コミット・プッシュ後、Netlifyが自動で再デプロイします。公開URLを開き、開発者ツールのNetworkタブで`/api/spots`が**404ではなく200**になっていることを確認してください。

**ここまで確認できたら、パートAは完了です。** 次のパートBに進んでください。

---

## 3. パートB：日付・条件・新しい項目への対応

### 3-1. 新しいデータの形（おさらい）

[05_overview_v2.md](./05_overview_v2.md)で決めた通り、これからは`from, to`の2つだけでなく、以下のオブジェクトをまとめてやり取りします。

```js
// リクエスト（フロントエンド → サーバー）
{ from, to, date, meal, indoorOnly, parking }

// レスポンス（サーバー → フロントエンド、spotsの中の1件）
{ name, description, reason, nearestStation, travelTime, budget, stayDuration, link }
```

### 3-2. `aiSpotService.js`を新しい形に書き換える

これまでの`getSpots(from, to)`という2引数を、1つのオブジェクトを受け取る形に変えます。

```js
export async function getSpots(searchParams) {
  const response = await fetch("/api/spots", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(searchParams),
  });

  if (!response.ok) {
    throw new Error("寄り道スポットの取得に失敗しました。");
  }

  return response.json();
}
``

- `searchParams`には、担当Aが作った`{ from, to, date, meal, indoorOnly, parking }`がそのまま渡ってきます。
- `body: JSON.stringify(searchParams)`：オブジェクトをそのままサーバーに送ります。以前のように`{ from, to }`と組み立て直す必要がなく、受け取った形をそのまま送るだけなので、むしろシンプルになります。

### 3-3. プロンプトを拡張する（`server/index.js`と`netlify/functions/spots.js`の両方）

`buildPrompt`を、日付・条件・新しい出力項目に対応させます。**この関数の中身は、`server/index.js`と`netlify/functions/spots.js`の両方に同じ内容を反映してください**（ロジックが2箇所にあるため、片方だけ直すと動作がズレます）。

```js
function buildPrompt({ from, to, date, meal, indoorOnly, parking }) {
  const conditions = [];
  if (meal) conditions.push("食事ができる場所を優先してください。");
  if (indoorOnly) conditions.push("屋内の場所を優先してください。");
  if (parking) conditions.push("駐車場がある場所を優先してください。");

  return `
${date}に、${from}から${to}まで移動する途中で立ち寄れる「寄り道スポット」を3つ提案してください。
${conditions.join("\n")}

それぞれのスポットについて、以下の情報を含めてください。
- name：スポット名
- description：どんな場所か
- reason：おすすめ理由
- nearestStation：最寄り駅
- travelTime：${from}からの移動時間の目安（例："電車で約15分"のような文字列）
- budget：推定予算の目安（例："0円〜500円"のような文字列）
- stayDuration：推定滞在時間の目安（例："30分〜1時間"のような文字列）

以下のJSON配列の形式だけで出力してください。説明文や前置きは不要です。linkという項目は含めないでください（こちらで別途用意します）。

[
  {
    "name": "スポット名",
    "description": "どんな場所か",
    "reason": "おすすめ理由",
    "nearestStation": "最寄り駅",
    "travelTime": "移動時間の目安",
    "budget": "推定予算の目安",
    "stayDuration": "推定滞在時間の目安"
  }
]
`;
}
```

説明します。

- 引数が`(from, to)`から`({ from, to, date, meal, indoorOnly, parking })`という1つのオブジェクトを受け取る形に変わっています。呼び出す側も合わせて`buildPrompt(searchParams)`のように、オブジェクトをそのまま渡す形に変えてください。
- `conditions`という配列に、チェックが入っている条件の文章だけを詰めていき、`conditions.join("\n")`で改行区切りの文章にしてプロンプトに埋め込みます。チェックが1つも入っていなければ、この部分は空文字になり、AIには特に条件を伝えません。
- 出力してほしい項目を、見本のJSONに増やしています。AIは基本的に、見本に忠実な形で返してくれやすくなります。
- **`link`はAIに生成させないよう、あえて指示しています。** 理由は次の項目で説明します。

### 3-4. `link`（リンク）はAIに作らせず、コードで組み立てる

AIに直接URLを作らせると、実在しないURLを作り出してしまう（ハルシネーション）リスクがあります。かわりに、AIが返してきた`name`（スポット名）を使って、Googleマップの検索結果に飛ぶURLを**プログラム側で機械的に組み立てます**。

`parseSpots`のすぐ後ろに、以下の関数を追加します。

```js
function addMapLink(spots) {
  return spots.map((spot) => ({
    ...spot,
    link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name)}`,
  }));
}
```

- `...spot`：スポットオブジェクトの中身（`name`・`description`など）をすべてそのままコピーする書き方です。
- `link: "https://www.google.com/maps/search/?api=1&query=" + スポット名`：Googleマップの「この文字で検索する」というURLの形式です。
- `encodeURIComponent(spot.name)`：スポット名に日本語や記号が含まれていても、URLとして正しく使える形に変換してくれる関数です（これを忘れると、日本語を含むURLが正しく開けないことがあります）。

`server/index.js`・`netlify/functions/spots.js`それぞれの、`parseSpots`を呼び出している部分を以下のように変更します。

```js
const spotsWithoutLink = parseSpots(responseText);
const spots = addMapLink(spotsWithoutLink);
```

この`spots`を、これまで通り`res.json(spots)`（Express）または`{ statusCode: 200, body: JSON.stringify(spots) }`（Netlify Functions）で返します。

### 3-5. ルート処理側で、新しい引数の受け取り方に変更する

`server/index.js`と`netlify/functions/spots.js`の両方で、リクエストから`from, to`だけでなく全項目を受け取るようにします。

**`server/index.js`（Express版）:**

```js
app.post("/api/spots", async (req, res) => {
  const searchParams = req.body; // { from, to, date, meal, indoorOnly, parking }

  try {
    const prompt = buildPrompt(searchParams);
    const responseText = await callAI(prompt);
    const spots = addMapLink(parseSpots(responseText));
    res.json(spots);
  } catch (e) {
    console.error("AIへの問い合わせに失敗しました:", e);
    res.status(500).json({ message: "寄り道スポットの取得に失敗しました。" });
  }
});
```

**`netlify/functions/spots.js`（Netlify Functions版）:**

```js
exports.handler = async function (event) {
  const searchParams = JSON.parse(event.body); // { from, to, date, meal, indoorOnly, parking }

  try {
    const prompt = buildPrompt(searchParams);
    const responseText = await callAI(prompt);
    const spots = addMapLink(parseSpots(responseText));

    return {
      statusCode: 200,
      body: JSON.stringify(spots),
    };
  } catch (e) {
    console.error("AIへの問い合わせに失敗しました:", e);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "寄り道スポットの取得に失敗しました。" }),
    };
  }
};
```

`from, to`だけを取り出すのではなく、`req.body`（または`JSON.parse(event.body)`）を丸ごと`searchParams`という名前で受け取り、そのまま`buildPrompt`に渡す点がポイントです。

### 3-6. 動作確認

- ローカル（`netlify dev`、または`npm run dev`+`node server/index.js`）で、日付とチェックボックスを変えて検索し、結果に最寄り駅・移動時間・推定予算・推定滞在時間が含まれることを確認する
- カードの「地図で見る」リンクを押して、Googleマップにスポット名で検索された状態のページが開くことを確認する
- 公開後のURLでも同様に確認する

---

## 4. つまずきやすいポイント

- **`server/index.js`と`netlify/functions/spots.js`の内容がズレる**：`buildPrompt`などのロジックは2つのファイルに別々に存在しています。片方だけ直して動作確認してしまうと、もう片方（特に公開後に使われるNetlify Functions側）が古いままになりがちです。両方直したか、都度チェックしてください。
- **AIが指定した項目を返してくれない**：プロンプトの見本（JSON）に項目を追加しても、AIが省略してしまうことがあります。「必ずすべての項目を含めてください」のように念を押す、または`parseSpots`後に足りない項目を`|| "情報なし"`のようなデフォルト値で補う対策を検討してください。
- **リンクの日本語が文字化けする・正しく開かない**：`encodeURIComponent`を付け忘れていないか確認してください。
- **`from, to`だけ取り出してしまい、`date`などが`undefined`になる**：ステップ3-5のように、`req.body`（または`event.body`をパースしたもの）を丸ごと`searchParams`として扱っているか確認してください。

---

## 5. 完成チェックリスト

### パートA（公開後も動く土台）

- [ ] `netlify/functions/spots.js`が完成し、`netlify.toml`も作成した
- [ ] Netlifyの環境変数に`OPENROUTER_API_KEY`を設定した
- [ ] 公開URLでNetworkタブを見て、`/api/spots`が200になる

### パートB（新しい項目への対応）

- [ ] `aiSpotService.js`の`getSpots`が、オブジェクト1つ（`searchParams`）を受け取る形になっている
- [ ] `buildPrompt`が日付・条件・新しい出力項目に対応し、`server/index.js`と`netlify/functions/spots.js`の両方で揃っている
- [ ] `link`はAIに生成させず、`addMapLink`でプログラム側から組み立てている
- [ ] 検索結果に最寄り駅・移動時間・推定予算・推定滞在時間が含まれ、リンクからGoogleマップが開ける
