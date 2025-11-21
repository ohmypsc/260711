import "./AccountModal.scss";
import { Modal } from "@/components/common/Modal/Modal";
import { useContactInfo } from "@/ContactInfoProvider";
import Button from "@/components/common/Button/Button";

interface AccountModalProps {
  type: "groom" | "bride";
  onClose: () => void;
}


function formatAccountNumber(account: string) {
  if (!account) return "";
  const digits = account.replace(/\D/g, "");
  return digits; 
}

export function AccountModal({ type, onClose }: AccountModalProps) {
  const contactInfo = useContactInfo();

  const filtered = contactInfo.filter((item) => item.type === type);
  const title = type === "groom" ? "신랑 측 계좌번호" : "신부 측 계좌번호";

  const copy = (raw: string) => {
    const cleaned = raw.replace(/-/g, "");
    navigator.clipboard.writeText(cleaned);
    alert("📌 계좌번호가 복사되었습니다!");
  };

  return (
    <Modal onClose={onClose}>
      <div className="account-modal-content">
        <h2 className="account-modal-title modal-heading modal-divider">{title}</h2>

        <div className="account-list">
          {filtered.map((item) => (
            <div key={item.id} className="account-entry">
              <p className="account-relation">
                {item.relation} <span className="name">{item.name}</span>
              </p>

              {item.bank && item.account ? (
                <div className="account-info-line">
                  <p className="bank-line">
                    <strong>{item.bank}</strong>
                    {/* ✅ 계좌번호만 별도 span으로 분리하여 SCSS에서 스타일링 */}
                    <span className="account-number">
                       {formatAccountNumber(item.account)}
                    </span>
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
    </Modal>
  );
}
