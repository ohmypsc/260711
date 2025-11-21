import "./AccountModal.scss";
import { Modal } from "@/components/common/Modal/Modal";
import { useContactInfo } from "@/ContactInfoProvider";

interface AccountModalProps {
  type: "groom" | "bride";
  onClose: () => void;
}

function formatAccountNumber(account: string) {
  if (!account) return "";
  const digits = account.replace(/\D/g, "");
  return digits.replace(/(\d{4})(?=\d)/g, "$1-");
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
                // 폰트 스타일을 적용하기 위해 account-box 제거, info-group으로 대체
                <div className="account-info-group">
                  <p className="bank-line">
                    <strong>{item.bank}</strong>{" "}
                    {formatAccountNumber(item.account)}
                  </p>

                  <button
                    className="copy-btn"
                    onClick={() => copy(item.account!)}
                  >
                    계좌번호 복사하기
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
