import { useState } from "react";
//今日の日付
function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function SpotSearchForm({ onSearch }) {
  // 入力値を覚える場所（State）
  const [from, setFrom] = useState(""); // 現在地の入力値
  const [to, setTo] = useState("");     // 目的地の入力値
//日付のState
const[date,setDate]=useState(getTodayString())

//チェックボックス用のState（初期値はすべてfalse）
  const [meal, setMeal] = useState(false);
  const [indoorOnly, setIndoorOnly] = useState(false);
  const [parking, setParking] = useState(false);
// 送信処理
  const handleSubmit = (event) => {
    event.preventDefault(); 

    // どちらかが空欄時（空文字）、これ以上先の処理に行かない
    if (!from || !to) {
      return; 
    }

    // 親コンポーネント（App.jsx）から渡された関数を実行し、値を渡す
   console.log("入力値の確認",{from,to,date,meal,indoorOnly,parking});
    onSearch({from, to,date,meal,indoorOnly,parking});
  };

  // 入力欄とボタン（UI）
  return (
    <form onSubmit={handleSubmit} style={styles.formContainer}>
 {/* 現在地*/}
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
{/*目的地*/}
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
{/* 日付入力欄 */}
      <div style={styles.inputGroup}>
        <label htmlFor="date-input">日付：</label>
        <input
          id="date-input"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>

      {/* チェックボックス：食事 */}
      <div style={styles.checkboxGroup}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={meal}
            onChange={(event) => setMeal(event.target.checked)}
          />
          食事ができる場所を希望する
        </label>
      </div>

      {/* チェックボックス：屋内 */}
      <div style={styles.checkboxGroup}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={indoorOnly}
            onChange={(event) => setIndoorOnly(event.target.checked)}
          />
          屋内の場所を希望する
        </label>
      </div>

      {/* チェックボックス：駐車場 */}
      <div style={styles.checkboxGroup}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={parking}
            onChange={(event) => setParking(event.target.checked)}
          />
          駐車場がある場所を希望する
        </label>
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
  // チェックボックス用のスタイルを追加（左寄せで見やすくする）
  checkboxGroup: {
    display: "flex",
    alignItems: "center",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    userSelect: "none",
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