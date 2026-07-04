import SpotCard from "./SpotCard";

function SpotResultList({ spots = [] }) {
  return (
    <div className="spot-result-container">
      
      <h1 className="site-title">
        寄り道を楽しもう
      </h1>
      
      {/* 1. 出発・到着の入力フォームエリア（先ほど追加した部分） */}
      <div className="route-input-form">
        <div className="form-group">
          <label>出発場所</label>
          <input type="text" placeholder="例：東京駅" className="input-field" />
        </div>

        <div className="form-group">
          <label>到着場所</label>
          <input type="text" placeholder="例：大阪駅" className="input-field" />
        </div>

        <div className="time-group">
          <div className="form-group flex-1">
            <label>出発時間</label>
            <input type="time" className="input-field" />
          </div>
          <div className="form-group flex-1">
            <label>到着時間</label>
            <input type="time" className="input-field" />
          </div>
        </div>

        <button type="button" className="submit-btn">
          ルートを設定する
        </button>
      </div>

      <hr className="divider" />

      {/* 2. スポット一覧エリア */}
      <div className="spot-result-list">
        {spots.map((spot) => (
          <SpotCard key={spot.name} spot={spot} />
        ))}
      </div>

    </div>
  );
}

export default SpotResultList;
