function SpotCard({ spot }) {
  return (
    <div className="card w-full bg-base-100 shadow-xl border border-base-300">
      <div className="card-body p-4">
        <h3 className="card-title text-lg font-bold text-primary">{spot.name}</h3>
        <p className="text-sm text-base-content/80">{spot.description}</p>

        <div className="mt-2 p-2 bg-base-200 rounded-lg text-xs">
          <span className="font-semibold text-secondary">おすすめ理由：</span>
          <span className="text-base-content/70">{spot.reason}</span>
        </div>

        <div className="mt-2 text-xs text-base-content/70 grid grid-cols-2 gap-1">
          <span>最寄り駅：{spot.nearestStation}  </span>
          <span>移動時間：{spot.travelTime}  </span>
          <span>推定予算：{spot.budget}  </span>
          <span>滞在時間：{spot.stayDuration}  </span>
        </div>

        {spot.link && (
          <a
            href={spot.link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline btn-primary mt-2"
          >
            地図で見る
          </a>
        )}
      </div>
    </div>
  );
}

export default SpotCard;