import "../styles/App.css";

function SpotCard({ spot }) {
  return (
    <div className="spot-card">
      <h3>{spot.name}</h3>

      <p>{spot.description}</p>

      <div className="reason">
        <strong>おすすめ理由：</strong> {spot.reason}
      </div>

      <div>
        <p>最寄り駅：{spot.nearestStation}</p>
        <p>移動時間：{spot.travelTime}</p>
        <p>推定予算：{spot.budget}</p>
        <p>滞在時間：{spot.stayDuration}</p>
      </div>

      {spot.link && (
        <p>
          <a
            href={spot.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            地図で見る
          </a>
        </p>
      )}
    </div>
  );
}

export default SpotCard;