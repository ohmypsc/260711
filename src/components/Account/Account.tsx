import "./Account.scss";
import { useMemo, useState } from "react";

import { Button } from "@/components/common/Button/Button";
import { Modal } from "@/components/common/Modal/Modal";
import { useContactInfo } from "@/ContactInfoProvider";

type ModalType = null | "groom" | "bride";

export function Account() {
  const [openModal, setOpenModal] = useState<ModalType>(null);

  return (
    <section className="account section-inner">
      <h2 className="section-title">마음 전하실 곳</h2>

      <p className="account__desc">
        참석이 어려워 직접 축하해 주기 어려운 분들을 위해
        <br />
        계좌번호를 안내드립니다.
        <br />
        따뜻한 마음만 감사히 받겠습니다.
      </p>

      <div className="account-buttons">
        <Button
          variant="basic"
          className="account-btn groom"
          onClick={() => setOpenModal("groom")}
        >
          신랑 측 계좌번호
        </Button>

        <Button
          variant="basic"
          className="account-btn bride"
          onClick={() => setOpenModal("bride")}
        >
          신부 측 계좌번호
        </Button>
      </div>

      {openModal && (
        <AccountModal type={openModal} onClose={() => setOpenModal(null)} />
      )}
    </section>
  );
}

/* ------------------------------------------------------------------
   AccountModal
------------------------------------------------------------------ */

interface AccountModalProps {
  type: "groom" | "bride";
  onClose: () => void;
}

function formatAccountNumber(account: string) {
  if (!account) return "";
  return account.replace(/\D/g, "");
}

function AccountModal({ type, onClose }: AccountModalProps) {
  const contactInfo = useContactInfo();

  const filtered = useMemo(
    () => contactInfo.filter((item) => item.type === type),
    [contactInfo, type]
  );

  const title = type === "groom" ? "신랑 측 계좌번호" : "신부 측 계좌번호";

  const copy = (raw: string) => {
    const cleaned = raw.replace(/-/g, "");
    navigator.clipboard.writeText(cleaned);
    alert("📌 계좌번호가 복사되었습니다!");
  };

  return (
    <Modal onClose={onClose}>
      <div className="account-modal-content">
        <h2 className="account-modal-title modal-title">{title}</h2>

        <div className="account-list">
          {filtered.map((item) => (
            <div key={item.id} className="account-card">
              <div className="account-card__top">
                <span className="chip">{item.relation}</span>
                <span className="name">{item.name}</span>
              </div>

              {item.bank && item.account ? (
                <div className="account-card__bottom">
                  <div className="bank-line">
                    <strong>{item.bank}</strong>
                    <span className="account-number">
                      {formatAccountNumber(item.account)}
                    </span>
                  </div>

                  <button
                    className="copy-btn"
                    onClick={() => copy(item.account)}
                    aria-label="계좌번호 복사"
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
