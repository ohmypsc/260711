import { useState } from "react";
import { AccountModal } from "./AccountModal";

export function Information({ brideInfo, groomInfo }) {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="information">
      <h2>혼주 정보</h2>

      <button onClick={() => setOpenModal(true)} className="account-btn">
        계좌번호 보기
      </button>

      {openModal && (
        <AccountModal 
          onClose={() => setOpenModal(false)}
          brideInfo={brideInfo}
          groomInfo={groomInfo}
        />
      )}
    </div>
  );
}
