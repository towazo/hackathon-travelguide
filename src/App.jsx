import SpotResultList from "./components/SpotResultList";

function App() {
  // 手順書にあるダミーデータ
  const dummySpots = [
    { name: "上野公園", description: "自然を楽しみながら休憩できる", reason: "移動ルートの近くにあり気分転換になるため" },
    { name: "秋葉原", description: "買い物や観光に立ち寄りやすい", reason: "乗り換え駅から近いため" },
  ];

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px", textAlign: "center" }}>
        【担当B 表示テスト】
      </h1>
      
      {/* 👈 あなたが作った一覧部品をここで絶対に呼び出す！ */}
      <SpotResultList spots={dummySpots} />
    </div>
  );
}

export default App;