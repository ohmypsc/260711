import "./Account.scss";
import { useMemo, useState } from "react";
import { Button } from "@/components/common/Button/Button";
import { Modal } from "@/components/common/Modal/Modal";
import { useContactInfo } from "@/ContactInfoProvider";

type ModalType = null | "groom" | "bride";

export function Account() {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const contactInfo = useContactInfo();

  // 데이터 로직: 모달 타입에 따른 데이터 필터링
  const filtered = useMemo(
    () => contactInfo.filter((item) => item.type === openModal),
    [contactInfo, openModal]
  );

  const modalTitle = openModal === "groom" ? "신랑 측 계좌번호" : "신부 측 계좌번호";

  // 데이터 로직: 클립보드 복사 시 숫자만 추출
  const copyToClipboard = (account: string) => {
    const numericAccount = account.replace(/[^0-9]/g, "");
    navigator.clipboard.writeText(numericAccount);
    alert("📌 계좌번호가 복사되었습니다.");
  };

  return (
    <section className="account">
      <div className="section-inner">
        <h2 className="section-title">마음 전하실 곳</h2>

        <div className="account__desc">
          <p className="keep-all">축하해 주시는 따뜻한 마음만으로도 충분히 감사드립니다.</p>
          <p className="keep-all">혹여 직접 찾아뵙지 못해 아쉬워하시는 분들을 위해</p>
          <p className="keep-all">조심스럽게 계좌번호를 안내드립니다.</p>
          <p className="keep-all">보내주시는 따뜻한 마음, 잊지 않고 감사히 받겠습니다.</p>
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
      </div>

      {openModal && (
        <Modal onClose={() => setOpenModal(null)}>
          <div className="account-modal-content">
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
                        복사하기
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-account">등록된 계좌 정보가 없습니다.</p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
