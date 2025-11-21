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
      {/* 신랑/신부 이름 */}
      <h1 className="names">
        <span>{groom?.name}</span>

        {/* ✨ 로맨틱 SVG 오너먼트 */}
        <span className="name-ornament" aria-hidden="true">
          <svg viewBox="0 0 110 32" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M5 16 C22 2, 88 2, 105 16"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="55" cy="16" r="3.2" fill="currentColor" />
            <path
              d="M5 16 C22 30, 88 30, 105 16"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <span>{bride?.name}</span>
      </h1>

      {/* 날짜 · 장소 */}
      <p className="date">2026.07.11. (토) 오전 11시</p>
      <p className="place">유성컨벤션웨딩홀 3층 그랜드홀</p>

      {/* 부모님 박스 */}
      <div className="parents">

        {/* 상단 장식 라인 */}
        <div className="parent-line top">
          <svg viewBox="0 0 200 28" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 14 C40 4, 160 4, 190 14"
              stroke="currentColor"
              strokeWidth="1.4"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="100" cy="14" r="2.6" fill="currentColor" />
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

        {/* 하단 장식 라인 */}
        <div className="parent-line bottom">
          <svg viewBox="0 0 200 28" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 14 C40 24, 160 24, 190 14"
              stroke="currentColor"
              strokeWidth="1.4"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="100" cy="14" r="2.6" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* 버튼 - 전역 스타일 그대로 */}
      <Button variant="outline" onClick={() => setOpen(true)}>
        축하 인사 전하기
      </Button>

      {open && <ContactModal onClose={() => setOpen(false)} />}
    </div>
  );
}
