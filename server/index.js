const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

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

function buildPrompt({ from, to, date, meal, indoorOnly, parking }) {
  const conditions = [];
  if (meal) conditions.push("・食事ができる場所を優先してください。");
  if (indoorOnly) conditions.push("・屋内の場所を優先してください。");
  if (parking) conditions.push("・駐車場がある場所を優先してください。");
  const conditionsBlock = conditions.length > 0 ? `\n【希望条件】\n${conditions.join("\n")}\n` : "";

  return `あなたは地元の事情に詳しい旅行ガイドです。${date}に${from}から${to}まで移動する人に、その途中で立ち寄れる「寄り道スポット」を3つ提案してください。

【ルートの条件】
${from}の最寄り駅と${to}の最寄り駅を結ぶ移動ルート（電車・沿線）を考え、その沿線上、または実際に立ち寄りやすい範囲にあるスポットだけを選んでください。移動ルートから大きく外れる場所は提案しないでください。
${conditionsBlock}
【文体】
description・reasonは、堅苦しい説明文ではなく、友人にすすめるような温かみのある親しみやすい文章にしてください。

【スポット名の選び方】
・「◯◯周辺のカフェ」のような曖昧な表現は避け、必ず具体的な店名・施設名まで挙げてください。
・コンビニ・大手カフェチェーン・大手飲食チェーンなど、全国チェーン店は提案しないでください。その土地ならではの個性的なスポットを選んでください。
・実在するか自信のない無名の個人店を創作しないでください。自信が持てない場合は、チェーン店ではなく、有名な公園・観光地・地域で親しまれている場所など、実在が確実な場所を選んでください。

【各スポットに含める情報】
- name：スポット名（上記の条件を満たすもの）
- description：どんな場所か（温かみのある文章で）
- reason：おすすめ理由（温かみのある文章で）
- nearestStation：そのスポット自体の最寄り駅（${from}や${to}の駅と同じでなくても構いません）
- travelTime：${from}からの移動時間の目安（大まかでよい。例："電車で約15分"）
- budget：推定予算の目安（大まかでよい。例："1000円前後"）
- stayDuration：推定滞在時間の目安（大まかでよい。例："30分〜1時間くらい"）

【出力形式】
以下のJSON配列の形式だけで出力してください。説明文や前置き、Markdownのコードブロック（\`\`\`）は一切不要です。linkという項目は含めないでください（こちらで別途用意します）。

出力例（内容はあくまで書き方の見本です。実際の提案先はそのつど考えて選んでください）：
[
  {
    "name": "上野公園",
    "description": "駅からすぐの場所にある、大きな緑が気持ちいい公園です。ちょっと一息つきたいときにぴったりですよ。",
    "reason": "移動の合間に自然を感じてリフレッシュできるので、次の目的地に向かう前の休憩にちょうどいいと思います。",
    "nearestStation": "上野駅",
    "travelTime": "電車で約15分",
    "budget": "0円〜500円くらい",
    "stayDuration": "30分〜1時間くらい"
  }
]`;
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
      temperature: 0.5, // 低めにして、実在しない店名の創作（ハルシネーション）を抑える
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
  // AIが指示に反してMarkdownのコードブロック（```json ... ```）で
  // 囲んで返してくることがあるため、あれば取り除いてから読み取る
  const cleaned = responseText
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "");

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("AIの返事をJSONとして読み取れませんでした:", responseText);
    return [];
  }
}

function addMapLink(spots) {
  return spots.map((spot) => ({
    ...spot,
    link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${spot.name} ${spot.nearestStation}`)}`,
  }));
}

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});
