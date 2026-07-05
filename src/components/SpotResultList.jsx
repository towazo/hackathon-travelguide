import SpotCard from "./SpotCard";
import "./../styles/App.css";

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
