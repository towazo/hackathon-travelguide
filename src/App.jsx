import { useState } from "react";
import SpotSearchForm from "./components/SpotSearchForm";
import SpotResultList from "./components/SpotResultList";
import { getSpots } from "./services/aiSpotService";
import logo from "./images/logo.png";

function App() {
    const [spots, setSpots] = useState([]);        // AIが提案したスポット一覧
    const [loading, setLoading] = useState(false); // AI問い合わせ中かどうか
    const [error, setError] = useState(null);       // エラーメッセージ

    async function handleSearch(searchParams) {
        setLoading(true);
        setError(null);

        try {
            const result = await getSpots(searchParams);
            setSpots(result);
        } catch (e) {
            setError("寄り道スポットの取得に失敗しました。");
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="app">
            <img src={logo} alt="寄り道スポット提案" className="logo" />
            <SpotSearchForm onSearch={handleSearch} />
            {loading && <p>探しています...</p>}
            {error && <p className="error">{error}</p>}
            <SpotResultList spots={spots} />
        </div>
    );
}

export default App;