import { useState } from "react";
import { Button } from "@/components/common/Button/Button";
import { ContactModal } from "@/components/Cover/ContactModal";
import { useContactInfo } from "@/ContactInfoProvider";
import "./Cover.scss";

export function Cover() {
  const [open, setOpen] = useState(false);

  const contactInfo = useContactInfo();

  const groom = contactInfo.find((c) => c.id === "groom");
  const bride = contactInfo.find((c) => c.id === "bride");
  const groomFather = contactInfo.find((c) => c.id === "groom-father");
  const groomMother = contactInfo.find((c) => c.id === "groom-mother");
  const brideFather = contactInfo.find((c) => c.id === "bride-father");
  const brideMother = contactInfo.find((c) => c.id === "bride-mother");

  return (
    <div className="w-cover">
      {/* 신랑 + 아이콘 + 신부 */}
      <h1 className="names">
        <span>{groom?.name}</span>

        {/* ✨ 스파클 아이콘 (Font Awesome) */}
        <span className="icon-between">
          <i className="fa-solid fa-sparkles" aria-hidden="true"></i>
        </span>

        <span>{bride?.name}</span>
      </h1>

      {/* 날짜 & 장소 */}
      <p className="date">2026.07.11. (토) 오전 11시</p>
      <p className="place">유성컨벤션웨딩홀 3층 그랜드홀</p>

      {/* 부모님 박스 */}
      <div className="parents">
        <p>
          {groomFather?.name} · {groomMother?.name}의{" "}
          <span className="relation-name relation-name--adjust">아들</span>{" "}
          <strong>{groom?.name}</strong>
        </p>

        <p className="daughter">
          {brideFather?.name} · {brideMother?.name}의{" "}
          <span className="relation-name relation-name--adjust">딸</span>{" "}
          <strong>{bride?.name}</strong>
        </p>
      </div>

      {/* 버튼 */}
      <Button variant="outline" onClick={() => setOpen(true)}>
        축하 인사 전하기
      </Button>

      {open && <ContactModal onClose={() => setOpen(false)} />}
    </div>
  );
}
