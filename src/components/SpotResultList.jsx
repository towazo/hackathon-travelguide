import SpotCard from "./SpotCard";

function SpotResultList({ spots = [] }) {
  return (
  <div className="spot-result-list">
        {spots.map((spot) => (
          <SpotCard key={spot.name} spot={spot} />
        ))}
      </div>
    );
}

export default SpotResultList;
