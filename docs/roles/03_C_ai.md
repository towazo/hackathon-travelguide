# 担当C：AI連携 手順書

担当ファイル：`src/services/aiSpotService.js`

先に [00_overview.md](./00_overview.md) の「データの形」を必ず読んでください。

## ゴール

現在地・目的地の文字列を受け取り、AIに「間にある寄り道スポット」を尋ね、[00_overview.md](./00_overview.md)で決めた形の配列 `[{name, description, reason}, ...]` に整えて返す関数 `getSpots(from, to)` を作る。

## このファイルが持つもの／持たないもの

- 持つもの：AIへの問い合わせ、プロンプトの文面、レスポンスの整形
- 持たないもの：画面の表示、状態管理（それは担当B・Dの仕事）

## 事前準備

- 使用するAIのAPIキーを取得し、`.env` ファイルなどに保存する（キーをコードに直接書かない）
- チームで「どのAI（例：Claude APIなど）を使うか」を最初に決めておく

## 手順

### ステップ1：関数の入り口だけ先に作る（ダミー版）

他の担当を待たせないために、まずは中身がダミーでも良いので、決められた形を返す関数を用意します。

```js
export async function getSpots(from, to) {
  // ダミー版：まずはこれで担当Dに渡して結合テストしてもらう
  return [
    { name: "上野公園", description: "自然を楽しみながら休憩できる", reason: "ルート上で気分転換しやすいため" },
    { name: "秋葉原", description: "買い物や観光に立ち寄りやすい", reason: "乗り換え駅から近いため" },
  ];
}
```

この時点で担当Dに「ダミー版ができた」と共有し、結合を先に進めてもらってください。

### ステップ2：AIに送る文章（プロンプト）を組み立てる

現在地・目的地を埋め込んで、AIに「JSON形式で返して」と明確に指定する文章を作ります。JSON形式を指定すると、後で読み取る処理が楽になります。

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
```

初心者向けヒント：AIは「文章の続きを予測する」仕組みなので、出力してほしい形を具体的に見せてあげるほど、狙った形式で返ってきやすくなります。

### ステップ3：AI APIを実際に呼び出す

使用するAIのSDK・fetch方法に沿って、ステップ2のプロンプトを送信します（具体的な呼び出し方法はチームで選んだAIサービスのドキュメントを参照してください）。

```js
export async function getSpots(from, to) {
  const prompt = buildPrompt(from, to);

  // ここでAI APIを呼び出す（使用するSDK/fetchに置き換える）
  const responseText = await callAI(prompt); // callAIは呼び出すAI次第で実装が変わる部分

  return parseSpots(responseText);
}
```

### ステップ4：AIの返事をJSONとして読み取る

AIの返事（文字列）を、実際に使える配列に変換します。

```js
function parseSpots(responseText) {
  try {
    const spots = JSON.parse(responseText);
    return spots;
  } catch (e) {
    console.error("AIの返事をJSONとして読み取れませんでした:", responseText);
    return []; // 失敗したときは空配列を返し、画面側でエラー表示させる
  }
}
```

初心者向けヒント：AIは指定通りJSONだけを返すとは限らず、前後に余計な文章がつくことがあります。うまくいかない場合は、プロンプトで「JSON以外は絶対に出力しないで」のように念押しするか、余計な部分を取り除く処理を追加してください。

### ステップ5：エラー処理

APIキーが間違っている、通信に失敗した、などのケースに備えて、`try/catch` で囲み、失敗時は空配列やエラーを返すようにします（呼び出し元の担当Dが `error` state で受け止めます）。

## 完成チェックリスト

- [ ] `getSpots(from, to)` がダミーの配列を返す状態で、担当Dに一度共有した
- [ ] 実際にAIへ問い合わせて、寄り道スポットが返ってくる
- [ ] AIの返事を `{name, description, reason}` の配列に変換できている
- [ ] AIの返事がJSONとして読み取れなかった場合でもアプリが落ちない
