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
      </div>
    </div>
  );
}

export default SpotCard;
