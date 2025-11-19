import { ModalBase } from "../modal/ModalBase";
import { useContactInfo } from "../../ContactInfoProvider";

interface AccountModalProps {
  type: "groom" | "bride";
  onClose: () => void;
}

export function AccountModal({ type, onClose }: AccountModalProps) {
  const contactInfo = useContactInfo();

  // 선택된 타입에 따른 필터링 (신랑 & 부모 / 신부 & 부모)
  const filtered = contactInfo.filter((item) => item.type.startsWith(type));

  const title = type === "groom" ? "신랑 측 계좌번호" : "신부 측 계좌번호";

  const copy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("📌 계좌번호가 복사되었습니다!");
  };

  return (
    <ModalBase onClose={onClose}>
      <div className="account-modal-content">
        <h3 className="modal-title">{title}</h3>

        <div className="account-list">
          {filtered.map((item) => (
            <div key={item.id} className="account-entry">
              <p className="account-relation">
                {item.relation} <span className="name">{item.name}</span>
              </p>

              {item.bank && item.account ? (
                <div className="account-box">
                  <p className="bank-line">
                    <strong>{item.bank}</strong> {item.account}
                  </p>

                  <button
                    className="copy-btn"
                    onClick={() => copy(item.account!)}
                  >
                    복사하기
                  </button>
                </div>
              ) : (
                <p className="no-account">계좌 정보가 없습니다.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </ModalBase>
  );
}
