import { ModalBase } from "../modal/ModalBase";
import { useContactInfo } from "../../ContactInfoProvider";

export function AccountModal({ onClose }) {
  const contactInfo = useContactInfo();

  // 전역 데이터에서 신랑/신부 정보 나누기
  const groomInfo = contactInfo.filter((item) => item.type === "groom");
  const brideInfo = contactInfo.filter((item) => item.type === "bride");

  const copy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("📌 계좌번호가 복사되었습니다!");
  };

  const renderList = (list: any[]) => (
    <>
      {list.map((item) => (
        <div key={item.id} className="account-item">
          <p className="account-title">
            {item.relation} ({item.name})
          </p>

          {item.bank && item.account ? (
            <div className="account-box">
              <p className="account-number">
                <strong>{item.bank}</strong> {item.account}
              </p>

              <button className="copy-btn" onClick={() => copy(item.account)}>
                복사
              </button>
            </div>
          ) : (
            <p className="no-account">계좌 정보가 제공되지 않았습니다.</p>
          )}
        </div>
      ))}
    </>
  );

  return (
    <ModalBase onClose={onClose}>
      <div className="account-modal-content">
        <h3 className="modal-title">계좌 정보</h3>

        <h4 className="modal-subtitle">신랑 측</h4>
        {renderList(groomInfo)}

        <h4 className="modal-subtitle">신부 측</h4>
        {renderList(brideInfo)}

        <button onClick={onClose} className="modal-close-btn">
          닫기
        </button>
      </div>
    </ModalBase>
  );
}
