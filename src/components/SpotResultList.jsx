import SpotCard from "./SpotCard";

function SpotResultList({ spots = [] }) {
  return (
    <div className="p-4">
      {/* 💡 HTML風のコード（タグ）はここに書きます！ */}
      <div className="join w-full mb-6 shadow-md">
        <input 
          type="text" 
          placeholder="キーワードを入力..." 
          className="input input-bordered join-item w-full bg-base-100" 
        />
        <button className="btn btn-primary join-item">検索</button>
      </div>

      {/* スポット一覧 */}
      <div className="flex flex-col gap-4">
        {spots.map((spot) => (
          <SpotCard key={spot.name} spot={spot} />
        ))}
      </div>
    </div>
  );
}

export default SpotResultList;