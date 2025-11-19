import "./Information.scss";
import { useState } from "react";
import { AccountModal } from "./AccountModal";
import { useContactInfo } from "../../ContactInfoProvider";

export function Information() {
  const [openModal, setOpenModal] = useState(false);

  // 전역 데이터 가져오기
  const contactInfo = useContactInfo();

  // 신랑 / 신부 정보 필터링
  const brideInfo = contactInfo.filter((item) => item.type.startsWith("bride"));
  const groomInfo = contactInfo.filter((item) => item.type.startsWith("groom"));

  return (
    <div className="information">
      <h2>혼주 정보</h2>

      <button className="account-btn" onClick={() => setOpenModal(true)}>
        계좌번호 보기
      </button>

      {openModal && (
        <AccountModal
          onClose={() => setOpenModal(false)}
          // ❗ 이제 props로 brideInfo/groomInfo 안 넘겨도 됨!
        />
      )}
    </div>
  );
}
