import "./Information.scss";
import { useState } from "react";
import { AccountModal } from "./AccountModal";
import { useContactInfo } from "../../ContactInfoProvider";

export function Information() {
  const [openModal, setOpenModal] = useState<null | "groom" | "bride">(null);

  return (
    <div className="information">
      <h2>혼주 정보</h2>

      {/* 신랑 측 버튼 */}
      <button
        className="account-btn"
        onClick={() => setOpenModal("groom")}
      >
        신랑 측 계좌번호 보기
      </button>

      {/* 신부 측 버튼 */}
      <button
        className="account-btn"
        onClick={() => setOpenModal("bride")}
      >
        신부 측 계좌번호 보기
      </button>

      {openModal && (
        <AccountModal
          type={openModal}
          onClose={() => setOpenModal(null)}
        />
      )}
    </div>
  );
}
