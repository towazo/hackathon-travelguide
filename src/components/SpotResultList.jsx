import SpotCard from "./SpotCard";

// 画面確認用のダミーデータ
const dummySpots = [
  { name: "上野公園", description: "自然を楽しみながら休憩できる", reason: "移動ルートの近くにあり気分転換になるため" },
  { name: "秋葉原", description: "買い物や観光に立ち寄りやすい", reason: "乗り換え駅から近いため" },
];

function SpotResultList() {
  return (
    <div className="p-6 max-w-md mx-auto bg-base-200 min-h-screen">
      <h2 className="text-xl font-bold mb-4 text-center border-b pb-2">
        【担当B プレビュー画面】
      </h2>
      
      <div className="flex flex-col gap-4">
        {dummySpots.map((spot) => (
          <SpotCard key={spot.name} spot={spot} />
        ))}
      </div>
    </div>
  );
}

// 💡 画面を乗っ取るための魔法：
// App.jsxがこのファイルを呼び出していなくても、この部品自体を「App」という名前で偽装してエクスポートします
export default SpotResultList;