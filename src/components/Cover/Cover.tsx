import { useState } from "react";
import { Button } from "@/components/common/Button/Button";
import { ContactModal } from "@/components/Cover/ContactModal";
import "./Cover.scss";

export function Cover() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <section className="w-cover">
      <div className="inner">
        <p className="tagline">초대합니다</p>

        <h1 className="names">
          백승철 <span>&</span> 오미영
        </h1>

        <p className="date">2026.07.11. (토) 오전 11시</p>
        <p className="place">유성컨벤션웨딩홀 3층 그랜드홀</p>

        <div className="parents">
          <p>백문기 · 김경희의 아들 <strong>백승철</strong></p>
          <p>오세진 · 박근석의 딸 <strong>오미영</strong></p>
        </div>

        <div className="button-area">
          <Button variant="outline" onClick={() => setOpenModal(true)}>
            연락하기
          </Button>
        </div>
      </div>

      {openModal && <ContactModal onClose={() => setOpenModal(false)} />}
    </section>
  );
}
