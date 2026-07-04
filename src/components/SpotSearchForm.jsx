import { useState } from "react";

function SpotSearchForm({ onSearch }) {
  // 入力値を覚える場所（State）
  const [from, setFrom] = useState(""); // 現在地の入力値
  const [to, setTo] = useState("");     // 目的地の入力値

  // 送信処理
  const handleSubmit = (event) => {
    event.preventDefault(); 

    // どちらかが空欄時（空文字）、これ以上先の処理に行かない
    if (!from || !to) {
      return; 
    }

    // 親コンポーネント（App.jsx）から渡された関数を実行し、値を渡す
   console.log("入力値の確認",from,to);
    onSearch(from, to);
  };

  // 入力欄とボタン（UI）
  return (
    <form onSubmit={handleSubmit} style={styles.formContainer}>
      <div style={styles.inputGroup}>
        <label htmlFor="from-input">現在地：</label>
        <input
          id="from-input"
          type="text"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          placeholder="現在地（例：新宿駅）"
        />
      </div>

      <div style={styles.inputGroup}>
        <label htmlFor="to-input">目的地：</label>
        <input
          id="to-input"
          type="text"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          placeholder="目的地（例：浅草）"
        />
      </div>

      <button type="submit" style={styles.button}>
        検索する
      </button>
    </form>
  );
}

// 見た目を整える簡易デザイン（CSS）
const styles = {
  formContainer: {
    border: "1px solid #ccc",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "400px",
    margin: "20px auto",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  inputGroup: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    padding: "10px",
    backgroundColor: "#007eff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default SpotSearchForm;