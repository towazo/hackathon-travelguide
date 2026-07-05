export async function getSpots(searchParams) {
  // ダミー版：まずはこれで担当A・B・Dに渡して結合を進めてもらう
  return [
    {
      name: "上野公園",
      description: "自然を楽しみながら休憩できる",
      reason: "移動ルートの近くにあり気分転換になるため",
      nearestStation: "上野駅",
      travelTime: "電車で約15分",
      budget: "0円〜500円",
      stayDuration: "30分〜1時間",
      link: "https://www.google.com/maps/search/?api=1&query=上野公園",
    },
    {
      name: "秋葉原",
      description: "買い物や観光に立ち寄りやすい",
      reason: "乗り換え駅から近いため",
      nearestStation: "秋葉原駅",
      travelTime: "電車で約10分",
      budget: "500円〜2000円",
      stayDuration: "1時間〜2時間",
      link: "https://www.google.com/maps/search/?api=1&query=秋葉原",
    },
  ];
}