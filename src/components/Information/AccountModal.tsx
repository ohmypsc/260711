import { ModalBase } from "../modal/ModalBase";
import { useContactInfo } from "../../ContactInfoProvider";

interface AccountModalProps {
  type: "groom" | "bride";
  onClose: () => void;
}

export function AccountModal({ type, onClose }: AccountModalProps) {
  const contactInfo = useContactInfo();

  // 🔎 신랑 또는 신부 쪽 정보만 가져오기
  const filtered = contactInfo.filter((item) => item.type.startsWith(type));

  const title = type === "groom" ? "신랑 측 계좌번호" : "신부 측 계좌번호";

  // 📌 하이픈 제거 후 복사
  const copy = (raw: string) => {
    if (!raw) return;

    const cleaned = raw.replace(/-/g, ""); // ← 하이픈 제거
    navigator.clipboard.writeText(cleaned);
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

        {/* 닫기 버튼 제거 — ModalBase 안에 있는 기본 닫기 버튼만 사용 */}
      </div>
    </ModalBase>
  );
}
