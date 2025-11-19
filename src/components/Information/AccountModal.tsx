export function AccountModal({ onClose, brideInfo, groomInfo }) {
  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("📌 복사되었습니다!");
  };

  return (
    <div className="account-modal-overlay">
      <div className="account-modal">
        <h3>계좌 정보</h3>

        {/* 신랑 측 */}
        {groomInfo.map((item) => (
          <div key={item.id} className="account-item">
            <p className="account-title">{item.relation} ({item.name})</p>
            <p className="account-number">{item.account}</p>
            <button
              className="copy-btn"
              onClick={() => copy(item.account)}
            >
              복사하기
            </button>
          </div>
        ))}

        {/* 신부 측 */}
        {brideInfo.map((item) => (
          <div key={item.id} className="account-item">
            <p className="account-title">{item.relation} ({item.name})</p>
            <p className="account-number">{item.account}</p>
            <button
              className="copy-btn"
              onClick={() => copy(item.account)}
            >
              복사하기
            </button>
          </div>
        ))}

        <button onClick={onClose} className="close-btn">
          닫기
        </button>
      </div>
    </div>
  );
}
