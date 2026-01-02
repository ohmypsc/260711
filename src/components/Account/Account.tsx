import "./Account.scss";
import { useMemo, useState, useEffect } from "react"; // ✅ useEffect 추가
import { Button } from "@/components/common/Button/Button";
import { Modal } from "@/components/common/Modal/Modal";
import { useContactInfo } from "@/ContactInfoProvider";

type ModalType = null | "groom" | "bride";

export function Account() {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const contactInfo = useContactInfo();

  // ✅ [1] 토스트 메시지 상태 추가
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // ✅ [2] 2초 뒤에 자동으로 사라지는 타이머 설정
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => {
        setToastMsg(null);
      }, 2000); // 2초 유지
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // 데이터 필터링
  const filtered = useMemo(
    () => contactInfo.filter((item) => item.type === openModal),
    [contactInfo, openModal]
  );

  const modalTitle = openModal === "groom" ? "신랑 측 계좌번호" : "신부 측 계좌번호";

  // ✅ [3] 복사 기능 수정 (alert -> setToastMsg)
  const copyToClipboard = (account: string) => {
    const numericAccount = account.replace(/[^0-9]/g, "");
    navigator.clipboard.writeText(numericAccount)
      .then(() => {
        setToastMsg("계좌번호가 복사되었습니다");
      })
      .catch(() => {
        setToastMsg("복사에 실패했습니다. 다시 시도해주세요.");
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

      {/* ✅ [4] 토스트 메시지 UI (전역 app.scss의 .custom-toast 사용) */}
      {toastMsg && (
        <div className="custom-toast">
          <i className="fa-solid fa-check"></i>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
