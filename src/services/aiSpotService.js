export async function getSpots(from, to) {
  // ダミー版：まずはこれで担当Dに渡して結合テストしてもらう
  return [
    { name: "上野公園", description: "自然を楽しみながら休憩できる", reason: "ルート上で気分転換しやすいため" },
    { name: "秋葉原", description: "買い物や観光に立ち寄りやすい", reason: "乗り換え駅から近いため" },
  ];
}