import "../styles/App.css";

function SpotCard({ spot }) {
  return (
    <div className="spot-card">
      <h3>{spot.name}</h3>

      <p>{spot.description}</p>

      <div className="reason">
        <strong>おすすめ理由：</strong>
        {spot.reason}
      </div>
    </div>
  );
}

export default SpotCard;