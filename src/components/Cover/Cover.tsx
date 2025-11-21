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

        {/* 중앙 심플 다이아몬드 오너먼트 */}
        <span className="diamond" aria-hidden="true">◆</span>

        <span>{bride?.name}</span>
      </h1>

      {/* 날짜 · 장소 */}
      <p className="date">2026.07.11. (토) 오전 11시</p>
      <p className="place">유성컨벤션웨딩홀 3층 그랜드홀</p>

      {/* 부모님 박스 */}
      <div className="parents">

        {/* 위 넝쿨 라인 */}
        <div className="vine-line top">
          <svg viewBox="0 0 260 28">
            <path
              d="M5 14 C40 5, 80 23, 130 14 C180 5, 220 23, 255 14"
              stroke="currentColor"
              strokeWidth="1.3"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="42" cy="10" r="2" fill="currentColor" opacity="0.6"/>
            <circle cx="218" cy="16" r="2" fill="currentColor" opacity="0.6"/>
          </svg>
        </div>

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

        {/* 아래 넝쿨 라인 */}
        <div className="vine-line bottom">
          <svg viewBox="0 0 260 28">
            <path
              d="M5 14 C40 23, 80 5, 130 14 C180 23, 220 5, 255 14"
              stroke="currentColor"
              strokeWidth="1.3"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="82" cy="18" r="2" fill="currentColor" opacity="0.6"/>
            <circle cx="178" cy="6" r="2" fill="currentColor" opacity="0.6"/>
          </svg>
        </div>
      </div>

      <Button variant="outline" onClick={() => setOpen(true)}>
        축하 인사 전하기
      </Button>

      {open && <ContactModal onClose={() => setOpen(false)} />}
    </div>
  );
}
