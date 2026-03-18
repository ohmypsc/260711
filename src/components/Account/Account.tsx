import "./Account.scss";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/common/Button/Button";
import { Modal } from "@/components/common/Modal/Modal";
import { useContactInfo } from "@/ContactInfoProvider";

type ModalType = null | "groom" | "bride";
type ToastState = { msg: string; type: "success" | "error" } | null;

// 이제 모든 기기에서 토스트를 띄울 것이므로 isMobileDevice 함수는 사용하지 않아도 되지만, 
// 다른 곳에서 쓰실 수 있으니 남겨두었습니다.

export function Account() {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const contactInfo = useContactInfo();

  const filtered = useMemo(
    () => contactInfo.filter((item) => item.type === openModal),
    [contactInfo, openModal]
  );

  const modalTitle =
    openModal === "groom" ? "신랑 측 계좌번호" : "신부 측 계좌번호";

  // 토스트 타이머
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  // 복사 함수 (괄호 누락 수정 및 모바일 제한 해제)
  const copyToClipboard = async (account: string) => {
    const numericAccount = account.replace(/[^0-9]/g, "");

    try {
      await navigator.clipboard.writeText(numericAccount);
      // 모든 기기에서 토스트 표시
      setToast({ msg: "계좌번호가 복사되었습니다", type: "success" });
    } catch {
      setToast({ msg: "복사에 실패했습니다", type: "error" });
    }
  }; // <--- 함수 닫는 괄호 누락되었던 부분

  return (
    <div className="account-wrapper">
      <h2 className="section-title">마음 전하실 곳</h2>

      <div className="section-desc">
        <p>참석이 어려우신 분들을 위해</p>
        <p>계좌번호를 기재하였습니다.</p>
        <p>너그러운 마음으로 양해 부탁드립니다.</p>
      </div>

      <div className="account-buttons">
        <Button
          variant="basic"
          className="account-btn"
          onClick={() => setOpenModal("groom")}
        >
          신랑 측 계좌번호
        </Button>

        <Button
          variant="basic"
          className="account-btn"
          onClick={() => setOpenModal("bride")}
        >
          신부 측 계좌번호
        </Button>
      </div>

      {openModal && (
        <Modal onClose={() => setOpenModal(null)}>
          <h2 className="modal-title">{modalTitle}</h2>

          <div className="account-list">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <div key={item.id} className="account-card">
                  <div className="account-card__top">
                    <span className="chip">{item.relation}</span>
                    <span className="name">{item.name}</span>
                  </div>

                  <div className="account-card__bottom">
                    <div className="bank-line">
                      <strong className="bank-name">{item.bank}</strong>
                      <span className="account-number">{item.account}</span>
                    </div>

                    <button
                      type="button"
                      className="copy-btn"
                      onClick={() => copyToClipboard(item.account)}
                      aria-label="계좌번호 복사"
                    >
                      복사
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-account">등록된 계좌 정보가 없습니다.</p>
            )}
          </div>
        </Modal>
      )}

      {toast &&
        createPortal(
          <div className="custom-toast">
            <i
              className={
                toast.type === "success"
                  ? "fa-solid fa-check"
                  : "fa-solid fa-circle-exclamation"
              }
            ></i>
            {toast.msg}
          </div>,
          document.body
        )}
    </div>
  );
}
