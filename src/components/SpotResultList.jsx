import SpotCard from "./SpotCard";

function SpotResultList({ spots }) {
  if (spots.length === 0) {
    return <p>寄り道スポットはまだありません。</p>;
  }

  return (
    <div className="spot-result-list">
      {spots.map((spot) => (
        <SpotCard key={spot.name} spot={spot} />
      ))}
    </div>
  );
}

export default SpotResultList;