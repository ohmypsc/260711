import "./Account.scss";
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/common/Button/Button";
import { Modal } from "@/components/common/Modal/Modal";
import { useContactInfo } from "@/ContactInfoProvider";

type ModalType = null | "groom" | "bride";

// ✅ 토스트 메시지 타입 정의 (성공/실패 구분)
type ToastState = {
  msg: string;
  type: "success" | "error";
} | null;

export function Account() {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const contactInfo = useContactInfo();

  // ✅ [1] 토스트 상태를 객체로 관리 ({ 메시지, 타입 })
  const [toast, setToast] = useState<ToastState>(null);

  // ✅ [2] 자동 사라짐 타이머
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // 데이터 필터링
  const filtered = useMemo(
    () => contactInfo.filter((item) => item.type === openModal),
    [contactInfo, openModal]
  );

  const modalTitle = openModal === "groom" ? "신랑 측 계좌번호" : "신부 측 계좌번호";

  // ✅ [3] 복사 로직 (성공/실패에 따라 아이콘 타입 설정)
  const copyToClipboard = (account: string) => {
    const numericAccount = account.replace(/[^0-9]/g, "");
    navigator.clipboard.writeText(numericAccount)
      .then(() => {
        // 성공 시: success 타입
        setToast({ msg: "계좌번호가 복사되었습니다", type: "success" });
      })
      .catch(() => {
        // 실패 시: error 타입
        setToast({ msg: "복사에 실패했습니다. 직접 입력해주세요.", type: "error" });
      });
  };

  return (
    <div className="account-wrapper">
      <h2 className="section-title">마음 전하실 곳</h2>

      <div className="account__desc">
        <p className="keep-all">참석이 어려우신 분들을 위해</p>
        <p className="keep-all">계좌번호를 기재하였습니다.</p>
        <p className="keep-all">너그러운 마음으로 양해 부탁드립니다.</p>
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

      {/* 모달 */}
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

      {/* ✅ [4] 토스트 메시지 UI (타입에 따라 아이콘 변경) */}
      {toast && (
        <div className="custom-toast">
          {/* 성공하면 체크, 실패하면 느낌표 아이콘 */}
          <i className={toast.type === "success" ? "fa-solid fa-check" : "fa-solid fa-circle-exclamation"}></i>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
