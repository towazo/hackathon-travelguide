import SpotCard from "./SpotCard";

const dummySpots = [
  { name: "上野公園", description: "自然を楽しみながら休憩できる", reason: "移動ルートの近くにあり気分転換になるため" },
  { name: "秋葉原", description: "買い物や観光に立ち寄りやすい", reason: "乗り換え駅から近いため" },
];

function SpotResultList({ spots }) {
  const displaySpots = spots && spots.length > 0 ? spots : dummySpots;

  return (
    <div className="spot-result-list" style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>【担当B プレビュー中】</h2>
      
      {/* 💡 3. すり替えた displaySpots を使ってループを回す */}
      {displaySpots.map((spot) => (
        <SpotCard key={spot.name} spot={spot} />
      ))}
    </div>
  );
}

export default SpotResultList;