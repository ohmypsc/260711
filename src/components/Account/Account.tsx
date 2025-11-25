import "./Account.scss";
import { useState } from "react";

import { Button } from "@/components/common/Button/Button";
import { Modal } from "@/components/common/Modal/Modal";
import { useContactInfo } from "@/ContactInfoProvider";

type ModalType = null | "groom" | "bride";

export function Account() {
  const [openModal, setOpenModal] = useState<ModalType>(null);

  return (
    <div className="account">
      <h2 className="section-title">마음 전하실 곳</h2>

      <p className="account__desc">
        참석이 어려워 직접 축하해 주식 어려운 분들을 위해 계좌번호를 기재하였습니다.
        <br />
        넓은 마음으로 양해 부탁드립니다.
      </p>

      <div className="account-buttons">
        <Button variant="basic" onClick={() => setOpenModal("groom")}>
          신랑 측 계좌번호 보기
        </Button>

        <Button variant="basic" onClick={() => setOpenModal("bride")}>
          신부 측 계좌번호 보기
        </Button>
      </div>

      {openModal && (
        <AccountModal type={openModal} onClose={() => setOpenModal(null)} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   AccountModal (내부 컴포넌트)
------------------------------------------------------------------ */

interface AccountModalProps {
  type: "groom" | "bride";
  onClose: () => void;
}

function formatAccountNumber(account: string) {
  if (!account) return "";
  const digits = account.replace(/\D/g, "");
  return digits;
}

function AccountModal({ type, onClose }: AccountModalProps) {
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
        <h2 className="account-modal-title modal-heading modal-divider">
          {title}
        </h2>

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
                    <span className="account-number">
                      {formatAccountNumber(item.account)}
                    </span>
                  </p>

                  <button
                    className="copy-btn"
                    onClick={() => copy(item.account)}
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
