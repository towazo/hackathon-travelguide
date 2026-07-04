# 担当C：AI連携 手順書

担当ファイル：`src/services/aiSpotService.js`、`server/index.js`（新規追加）

> このページだけを読んでも作業できるように書いていますが、`spots`や`API`といった言葉が分からない場合は、先に [00_overview.md](./00_overview.md) を読んでください。特に「4. 用語集」「5. データの形」は必ず目を通してください。

---

## 1. このファイルは何をするものか

このサイトの一番の特徴である「AIが寄り道スポットを考えてくれる」部分の、裏側の処理を作るのが担当Cの仕事です。

最終的に作るものは、以下の入出力を行う仕組みです。

- **入力**：現在地（例：`"新宿駅"`）と目的地（例：`"浅草"`）という2つの文字列
- **中でやること**：AI（人工知能のサービス）に「この2つの間で寄り道できる場所を教えて」と問い合わせる
- **出力**：[00_overview.md](./00_overview.md)で決めた形の配列（`[{name, description, reason}, ...]`）

**この手順書には重要な変更があります。** 当初は`src/services/aiSpotService.js`だけでAI呼び出しまで完結させる想定でしたが、その作り方には「AIサービスのAPIキーがブラウザ（お客さんのパソコン）に漏れてしまう」という重大な問題があることが分かりました。そのため、今回から**AIへの問い合わせ処理を行う小さな裏方サーバー（`server/index.js`）を新しく1つ追加**し、担当Cはその両方を作る形に変わります。

**注意：ここでは画面の見た目や、入力フォームは作りません。** それは担当A・Bの仕事です。担当Cは「AIとやり取りして、決まった形のデータに変換して返す」ところまでが担当範囲です。

---

## 2. なぜサーバーを1つ追加するのか（重要）

### 2-1. 何が問題だったのか

これまでの作り方では、ブラウザ上で動く`aiSpotService.js`が、直接AIサービス（OpenRouter）にAPIキーを付けて問い合わせていました。

```js
"Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
```

`VITE_`という接頭辞がついた環境変数は、Viteがビルドするときに**そのままブラウザ向けのJSファイルに埋め込まれます**。つまり、サイトを開いた人が「開発者ツール」の「Network（通信）」タブを見たり、配信されているJSファイルの中身を見たりすれば、APIキーの文字列をそのまま読み取れてしまいます。読み取られると、他人が自分たちのAPIキーを使って勝手にAIを呼び出せてしまい、料金が発生する・利用制限にかかる、といった被害につながります。

### 2-2. どう解決するか

**ブラウザ（フロントエンド）が直接AIサービスに問い合わせるのをやめ、間に「自分たちだけのサーバー」を1つ挟みます。** このサーバーは自分たちのパソコン（開発中）や、将来的には自分たちが管理するクラウド上で動くプログラムで、APIキーはこのサーバーだけが知っている状態にします。

- ブラウザは「自分たちのサーバー」にだけ話しかける（今まで通り現在地・目的地を送るだけ）
- 「自分たちのサーバー」がAPIキーを使ってOpenRouterに問い合わせる
- OpenRouterからの返事を「自分たちのサーバー」が受け取り、ブラウザに返す

ブラウザとOpenRouterの間に自分たちのサーバーが割り込むイメージです。ブラウザは一度もAPIキーを目にしないため、APIキーが漏れる心配がなくなります。

### 2-3. 新しい全体の流れ図

```
【ブラウザ（フロントエンド）】
┌─────────────────────────┐
│ App（担当D）                  │
└─────────────────────────┘
    ↓ getSpots("新宿駅", "浅草") を呼び出す
┌─────────────────────────┐
│ aiSpotService.js（★担当C・前半）│
│ ・自分たちのサーバーに問い合わせるだけ  │
│ ・APIキーはここには一切書かない       │
└─────────────────────────┘
    ↓ fetch("/api/spots", ...)  ※ここではAPIキーを一切送らない
- - - - - - - - - - - - - - - - - -（ネットワークを越える）- - -
┌─────────────────────────┐
│ server/index.js（★担当C・後半） │  ← 自分たちのサーバー（新規）
│ ・ここでだけAPIキーを使う            │
│ ・OpenRouterに問い合わせる          │
│ ・返事をJSONとして整理する           │
└─────────────────────────┘
    ↓ OpenRouterに問い合わせ（APIキーを付けるのはここだけ）
【OpenRouter（外部のAIサービス）】
```

- `aiSpotService.js`（ブラウザ側）：以前は「プロンプトを作る」「AIに問い合わせる」「JSONを読み取る」を全部やっていましたが、これからは**「自分たちのサーバーに現在地・目的地を送って、返事を受け取るだけ」**のとてもシンプルなファイルになります。
- `server/index.js`（サーバー側・新規）：以前`aiSpotService.js`に書いていた「プロンプトを作る」「AIに問い合わせる」「JSONを読み取る」の中身が、そのままこちらに引っ越してきます。中身のロジック自体はほぼ変わりません。**置き場所が変わるだけ**です。

---

## 3. 事前に知っておく言葉のおさらい

- **API（エーピーアイ）**：あるプログラムが、別のプログラムに対して「これをやってほしい」とお願いするための窓口です。
- **プロンプト**：AIに対して送る「お願いの文章」のことです。
- **非同期処理（async/await）**：時間がかかる処理の結果を待ってから、次の処理に進むための書き方です。
- **JSON／JSON.parse()**：データを表現する決まった書き方と、それを読み取るための関数です。
- **try/catch**：失敗するかもしれない処理を試し、失敗したら代わりの処理を行うための書き方です。
- **サーバー（バックエンド）**：ブラウザ（フロントエンド）からのお願いを受け取り、裏側で処理をして返事をするプログラムのことです。今回は自分たちのパソコン上で、Node.jsというプログラムで動かします。
- **Express（エクスプレス）**：Node.jsでサーバーを作るときによく使われる、部品集（ライブラリ）です。「このURLにお願いが来たら、この処理をする」という窓口をとても少ないコードで作れます。
- **エンドポイント**：サーバーが用意している「窓口のURL」のことです。今回は`/api/spots`という名前の窓口を1つ作ります。
- **環境変数（サーバー用）**：これまでの`VITE_〜`はブラウザ向けの環境変数でした。今回サーバー側で使う環境変数は`VITE_`を付けません。付けないことで、Viteがブラウザ向けのファイルに埋め込む対象から外れ、サーバーの中だけで秘密に保たれます。
- **プロキシ（proxy）**：ある窓口宛のお願いを、別の場所にこっそり転送してあげる仕組みのことです。開発中、ブラウザから見ると「自分のサイトの`/api/spots`にお願いしただけ」に見えるようにするために使います。

---

## 4. 事前準備

- チームで「どのAIサービスを使うか」を最初に決めてください（例：OpenRouter経由でgpt-4o-miniなど）。
- 使用するAIのAPIキーを取得してください。
- ターミナルで、サーバー作成に使う部品（ライブラリ）を2つ追加でインストールします。

```
npm install express dotenv
```

- `express`：サーバー本体を作るための部品です。
- `dotenv`：`.env`ファイルに書いた環境変数を、Node.jsのプログラム（サーバー）から読み込むための部品です（ブラウザ側は元々Viteが自動でこの役割をしてくれていましたが、サーバー側は自分で読み込む必要があります）。

- `.env`ファイルの中身を、ブラウザに見えないサーバー専用の名前に変更（または追加）します。

```
OPENROUTER_API_KEY=（ここに実際のAPIキー
```

`VITE_`を付けていない点に注意してください。付けてしまうと、また同じ問題（ブラウザへの露出）が起きます。もし以前`VITE_OPENROUTER_API_KEY`という名前で`.env`に書いていた場合は、`VITE_`を外した`OPENROUTER_API_KEY`という名前に直してください（両方残っていても動作はしますが、混乱を避けるため`VITE_`の付いた方は削除することをおすすめします）。

---

## 5. 手順

### ステップ1：サーバー用のファイルの置き場所を作る

プロジェクトのフォルダの一番上（`src`フォルダや`package.json`と同じ階層）に、`server`という名前の新しいフォルダを作り、その中に`index.js`という名前のファイルを作ります。

```
hackathon-travelguide/
├── src/               ← これまで通り。フロントエンド（画面側）
├── server/            ← 新規追加
│   └── index.js       ← サーバー本体をこれから書く
├── package.json
└── ...
```

`src`フォルダの中はブラウザ向け（Viteが処理する）、`server`フォルダの中はNode.jsが直接実行する場所、というように役割がはっきり分かれます。

### ステップ2：サーバーの土台を作る

`server/index.js`に、以下のような最小限の土台を書きます。

```js
const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

app.post("/api/spots", async (req, res) => {
  const { from, to } = req.body;

  // この続きをステップ3以降で書いていく
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});
```

1行ずつ説明します。

- `const express = require("express");`：`src`フォルダの中では`import`という書き方をしていましたが、`server/index.js`はNode.jsが直接実行するファイルのため、`require`という少し違う書き方で部品を読み込みます（今はそういうものだと捉えてもらって大丈夫です）。
- `require("dotenv").config();`：`.env`ファイルの中身を読み込み、`process.env.OPENROUTER_API_KEY`のような形で使えるようにします。
- `const app = express();`：サーバー本体を作ります。
- `app.use(express.json());`：ブラウザから送られてくるデータ（JSON形式）を、プログラムで扱いやすい形に自動変換してくれるおまじないです。
- `app.post("/api/spots", async (req, res) => { ... });`：「`/api/spots`という窓口にお願い（POST）が来たら、この中の処理を行う」という意味です。
  - `req`（リクエスト）：ブラウザから送られてきたお願いの内容が入っています。`req.body`の中に、ブラウザが送った現在地・目的地が入ります。
  - `res`（レスポンス）：ブラウザに返事を返すための道具です。
- `const { from, to } = req.body;`：ブラウザが送ってきたデータの中から、`from`（現在地）と`to`（目的地）を取り出します。
- `app.listen(PORT, ...)`：このサーバーを、パソコンの3001番の「ポート（窓口の番号）」で待機させます。

### ステップ3：これまでの「プロンプト作成・AI呼び出し・JSON読み取り」をサーバー側に書く

もし以前のバージョンの`aiSpotService.js`に、すでに「プロンプトを作る関数」「AIを呼び出す関数」「JSONを読み取る関数」を書いていた場合、その中身をほぼそのまま`server/index.js`に移してきます。考え方や書き方は変わりません。**変わるのは、APIキーの読み込み方だけです。**

```js
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
```

変わったポイントだけ説明します。

- `` `Bearer ${process.env.OPENROUTER_API_KEY}` `` ：ブラウザ向けの`import.meta.env.VITE_〜`ではなく、Node.js（サーバー）向けの`process.env.〜`という書き方でAPIキーを読み込みます。この値はサーバーの中だけで使われ、ブラウザには一切送られません。
- `if (!response.ok) { throw new Error(...); }`：OpenRouterからの返事がエラー（APIキー間違い・利用制限など）だった場合に、はっきりとエラーとして扱うようにしています。これがないと、エラーなのか「0件でした」なのか区別がつかなくなってしまいます。
- `buildPrompt`と`parseSpots`は、以前ブラウザ側で考えた内容のままで問題ありません。

### ステップ4：ステップ2の窓口の処理を完成させる

ステップ2で「この続きをステップ3以降で書いていく」としていた部分に、ステップ3で用意した関数を呼び出す処理を書きます。

```js
app.post("/api/spots", async (req, res) => {
  const { from, to } = req.body;

  try {
    const prompt = buildPrompt(from, to);
    const responseText = await callAI(prompt);
    const spots = parseSpots(responseText);
    res.json(spots);
  } catch (e) {
    console.error("AIへの問い合わせに失敗しました:", e);
    res.status(500).json({ message: "寄り道スポットの取得に失敗しました。" });
  }
});
```

- `res.json(spots);`：`spots`の配列を、ブラウザへの返事としてJSON形式で送り返します。
- `res.status(500).json({ message: "..." });`：エラーが起きたときは、ステータスコード500（サーバー側の失敗を表す番号）と、エラーメッセージをブラウザに返します。

### ステップ5：ブラウザ側の`aiSpotService.js`を、自分のサーバーを呼ぶだけのシンプルな形に書き換える

これまで`aiSpotService.js`に書いていた「プロンプトを作る」「AIに直接問い合わせる」「JSONを読み取る」処理は、すべてステップ3・4で`server/index.js`に移したので、`aiSpotService.js`側からは削除します。代わりに、自分たちのサーバーの`/api/spots`に問い合わせるだけの処理に書き換えます。

```js
export async function getSpots(from, to) {
  const response = await fetch("/api/spots", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from, to }),
  });

  if (!response.ok) {
    throw new Error("寄り道スポットの取得に失敗しました。");
  }

  return response.json();
}
```

- `fetch("/api/spots", ...)`：問い合わせ先が、OpenRouterのURLではなく`/api/spots`という「自分のサイトの中の窓口」に変わっている点に注目してください。ここにAPIキーは一切登場しません。
- `body: JSON.stringify({ from, to })`：現在地・目的地を、サーバーに送るデータとして詰め込みます。
- ここで受け取った`response`は、ステップ4で`server/index.js`が`res.json(spots)`で返したものです。

これで、担当Dの`App.jsx`から見た`getSpots(from, to)`という関数の「呼び出し方」や「返ってくるデータの形」は、今までと一切変わりません。中身の実装だけが安全な形に変わった、というのがポイントです。

### ステップ6：フロントエンドとサーバーをつなげる（開発中の設定）

このままだと、ブラウザ（Viteの開発サーバー、通常`http://localhost:5173`）に対して`/api/spots`とお願いしても、Vite側にはその窓口がないため「見つかりません（404）」になってしまいます。開発中は、Viteの「プロキシ」という機能を使い、「`/api`から始まるお願いは、`server/index.js`（`http://localhost:3001`）に転送してね」という設定を追加します。

`vite.config.js`に、以下のように`server.proxy`を追記します。

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
```

この設定により、ブラウザからは「同じサイトの中の`/api/spots`にお願いしただけ」に見え、実際にはVite開発サーバーが裏で`server/index.js`にそのお願いを横流ししてくれます。これにより、CORS（違うサイト同士が通信するときに発生する制限）のエラーも避けられます。

### ステップ7：2つのサーバーを同時に起動して動作確認する

今までは`npm run dev`（フロントエンド用）だけ起動すればよかったですが、これからは**フロントエンド用とサーバー用の、2つのプログラムを同時に起動する**必要があります。ターミナルを2つ開いてください。

- ターミナル1（フロントエンド）：`npm run dev`（これまで通り）
- ターミナル2（サーバー）：`node server/index.js`

ターミナル2で「サーバーが起動しました: http://localhost:3001」のような表示が出れば、サーバーは正しく起動しています。

その状態でブラウザから通常通りサイトを開き、「新宿駅」「浅草」のように入力してボタンを押し、今まで通り寄り道スポットが表示されれば成功です。

**確認のポイント**：ブラウザの開発者ツールの「Network」タブを開いた状態で検索してみてください。通信先が`openrouter.ai`ではなく、`/api/spots`（自分のサイト宛て）になっていることを確認してください。これが確認できれば、APIキーがブラウザ側から見えなくなったということです。

（毎回2つのターミナルを起動するのが面倍な場合は、`package.json`の`scripts`に`"server": "node server/index.js"`のような行を追加しておくと、`npm run server`だけで起動できるようになります。これは任意です。）

---

## 6. つまずきやすいポイント

- **`Failed to fetch`のようなエラーが出る**：`server/index.js`（ターミナル2）を起動し忘れている可能性が高いです。2つのターミナルがどちらも起動しているか確認してください。
- **`vite.config.js`を書き換えたのに反映されない**：Viteの設定ファイルを変更した場合、開発サーバーの再起動が必要なことがあります。ターミナル1を一度止めて、`npm run dev`をやり直してください。
- **3001番のポートがすでに使われているというエラーが出る**：他のプログラムが同じポート番号を使っている可能性があります。`server/index.js`内の`PORT`の値を`3002`など別の番号に変え、`vite.config.js`側の`"http://localhost:3001"`も同じ番号に合わせてください。
- **AIの返事が期待通りのJSONにならない**：この問題は場所が変わっても起こり得ます。`server/index.js`側の`console.error`のログ（ターミナル2に表示されます）を確認してください。
- **`.env`の値が`undefined`になる**：`server/index.js`の先頭で`require("dotenv").config();`を書き忘れていないか、`.env`ファイルの変数名が`OPENROUTER_API_KEY`になっているか（`VITE_`が付いていないか）を確認してください。
- **本番公開について**：ハッカソンの発表がローカルでのデモだけであれば、上記の「2つのターミナルを起動する」までで十分です。もしサイトをインターネット上に公開する場合は、`server/index.js`側も公開先のサーバー（クラウドサービスなど）にホスティングする必要があります。これは今回の最低限のスコープには含めず、将来の課題として扱ってください。

---

## 7. 完成チェックリスト

- [ ] `express`と`dotenv`をインストールした
- [ ] `.env`に`OPENROUTER_API_KEY`（`VITE_`なし）を設定した
- [ ] `server/index.js`を作り、`/api/spots`宛のお願いに対してAIへ問い合わせ、結果を返せる
- [ ] `aiSpotService.js`が、OpenRouterではなく自分のサーバー（`/api/spots`）に問い合わせる形に書き換わっている
- [ ] `vite.config.js`にプロキシ設定を追加した
- [ ] ターミナルを2つ起動した状態で、今まで通り「新宿駅→浅草」の検索が画面上で動く
- [ ] ブラウザの開発者ツールのNetworkタブで、OpenRouter宛の通信が見えなくなっている（＝APIキーが見えなくなった）
