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
      {/* 신랑/신부 */}
      <h1 className="names">
        <span>{groom?.name}</span>


        <span className="diamond" aria-hidden="true">♥</span>

        <span>{bride?.name}</span>
      </h1>

      {/* 날짜 · 장소 */}
      <p className="date">2026.07.11. (토) 오전 11시</p>
      <p className="place">유성컨벤션웨딩홀 3층 그랜드홀</p>

      {/* 부모님 박스 */}
      <div className="parents">

        {/* 상단 혼합형 라인 */}
<div className="parent-line top">
  <svg viewBox="0 0 260 24">
    <path
      d="M5 12 C60 2, 200 22, 255 12"
      stroke="currentColor"
      strokeWidth="0.8"
      fill="none"
      strokeLinecap="round"
      strokeDasharray="2 3"
    />

    <circle cx="40" cy="10" r="1.2" fill="currentColor" />
    <circle cx="90" cy="14" r="1.2" fill="currentColor" />
    <circle cx="160" cy="11" r="1.2" fill="currentColor" />


    <rect x="62" y="8" width="2.4" height="2.4" fill="currentColor" transform="rotate(45 63 9)" />
    <rect x="125" y="10" width="2.4" height="2.4" fill="currentColor" transform="rotate(45 126 11)" />
    <rect x="200" y="9" width="2.4" height="2.4" fill="currentColor" transform="rotate(45 201 10)" />
  </svg>
</div>

{/* 하단 혼합형 라인 */}
<div className="parent-line bottom">
  <svg viewBox="0 0 260 24">
    <path
      d="M5 12 C60 22, 200 2, 255 12"
      stroke="currentColor"
      strokeWidth="0.8"
      fill="none"
      strokeLinecap="round"
      strokeDasharray="2 3"
    />

    <circle cx="50" cy="13" r="1.2" fill="currentColor" />
    <circle cx="120" cy="9" r="1.2" fill="currentColor" />
    <circle cx="185" cy="15" r="1.2" fill="currentColor" />


    <rect x="75" y="11" width="2.4" height="2.4" fill="currentColor" transform="rotate(45 76 12)" />
    <rect x="145" y="7" width="2.4" height="2.4" fill="currentColor" transform="rotate(45 146 8)" />
    <rect x="215" y="13" width="2.4" height="2.4" fill="currentColor" transform="rotate(45 216 14)" />
  </svg>
</div>


      <Button variant="outline" onClick={() => setOpen(true)}>
        축하 인사 전하기
      </Button>

      {open && <ContactModal onClose={() => setOpen(false)} />}
    </div>
  );
}
