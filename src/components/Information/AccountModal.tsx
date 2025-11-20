// -----------------------------------------
// AccountModal.tsx (최종 완성본)
// -----------------------------------------

import { ModalBase } from "../modal/ModalBase";
import { useContactInfo } from "../../ContactInfoProvider";

interface AccountModalProps {
  type: "groom" | "bride";
  onClose: () => void;
}

// 계좌번호 보기 좋게 하이픈(-) 자동 삽입
function formatAccountNumber(account: string) {
  if (!account) return "";
  const digits = account.replace(/\D/g, "");
  return digits.replace(/(\d{4})(?=\d)/g, "$1-");
}

export function AccountModal({ type, onClose }: AccountModalProps) {
  const contactInfo = useContactInfo();

  // 신랑 or 신부 측만 필터링
  const filtered = contactInfo.filter((item) => item.type === type);

  const title = type === "groom" ? "신랑 측 계좌번호" : "신부 측 계좌번호";

  const copy = (raw: string) => {
    const cleaned = raw.replace(/-/g, "");
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
                    <strong>{item.bank}</strong>{" "}
                    {formatAccountNumber(item.account)}
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
