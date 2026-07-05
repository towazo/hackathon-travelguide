import SpotCard from "./SpotCard";
import "../styles/App.css";

function SpotResultList({ spots = [] }) {
  return (
    <div className="spot-result-container p-4">
      
      <hr className="my-4" />

      {spots.length === 0 ? (
        
        <div className="alert alert-info shadow-md rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <h3 className="font-bold">観光ルートが見つかりませんでした</h3>
            <div className="text-xs opacity-80">出発地と到着地を入力して、新しくルートを設定してください。</div>
          </div>
        </div>

      ) : (

        <div className="spot-result-list flex flex-col gap-4">
          {spots.map((spot, index) => (
            <SpotCard key={index} spot={spot} />
          ))}
        </div>

      )}

    </div>
  );
}

export default SpotResultList;