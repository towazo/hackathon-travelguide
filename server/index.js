const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});