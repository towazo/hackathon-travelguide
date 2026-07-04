function SpotCard({ spot }) {
  return (
    <div className="spot-card">
      <h3>{spot.name}</h3>
      <p>{spot.description}</p>
      <p className="reason">おすすめ理由：{spot.reason}</p>
    </div>
  );
}

export default SpotCard;