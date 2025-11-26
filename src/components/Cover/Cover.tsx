import { useState } from "react";
import { Button } from "@/components/common/Button/Button";
import { ContactModal } from "@/components/Cover/ContactModal";
import { useContactInfo } from "@/ContactInfoProvider";
import "./Cover.scss";

export function Cover() {
  const [open, setOpen] = useState(false);

  const info = useContactInfo();

  const GROOM = info.find((c) => c.id === "groom");
  const BRIDE = info.find((c) => c.id === "bride");

  const GROOM_FATHER = info.find((c) => c.id === "groom-father")?.name;
  const GROOM_MOTHER = info.find((c) => c.id === "groom-mother")?.name;
  const BRIDE_FATHER = info.find((c) => c.id === "bride-father")?.name;
  const BRIDE_MOTHER = info.find((c) => c.id === "bride-mother")?.name;

  const GROOM_TITLE = "아들";
  const BRIDE_TITLE = "딸";

  const GROOM_FULLNAME = GROOM?.name;
  const BRIDE_FULLNAME = BRIDE?.name;

  return (
    <div className="w-cover">

      {/* 신랑·신부 이름 */}
      <h1 className="names">
        <span>{GROOM_FULLNAME}</span>
        <span className="diamond">♥</span>
        <span>{BRIDE_FULLNAME}</span>
      </h1>

      {/* 날짜/장소 */}
      <p className="date">2026.07.11. (토) 오전 11시</p>
      <p className="place">유성컨벤션웨딩홀 3층 그랜드홀</p>

      {/* 부모님 박스 */}
      <div className="family-section">

        {/* 상단 긴 장식 라인 ✅ (자연스러운 넝쿨 곡선 + 미세 잎) */}
        <div className="parent-line top">
          <svg viewBox="0 0 320 26" aria-hidden="true">
            {/* 메인 넝쿨 라인: 자연스럽게 흐르는 단일 곡선 */}
            <path
              d="M8 14
                 C70 4, 120 6, 160 12
                 C205 19, 250 20, 312 12"
              stroke="currentColor"
              strokeWidth="0.85"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.9"
            />

            {/* 잎사귀: 라인 흐름 따라 아주 작게 3~4개 */}
            <g fill="currentColor" opacity="0.55">
              {/* left leaf */}
              <path d="M74 10 C70 7, 64 8, 63 11 C64 14, 70 14, 74 10 Z" />
              {/* left-mid leaf */}
              <path d="M118 9 C114 6, 109 7, 108 10 C109 13, 114 13, 118 9 Z" />
              {/* right-mid leaf */}
              <path d="M208 13 C212 10, 218 11, 219 14 C218 17, 212 17, 208 13 Z" />
              {/* right leaf */}
              <path d="M252 14 C256 11, 262 12, 263 15 C262 18, 256 18, 252 14 Z" />
            </g>
          </svg>
        </div>

        {/* 부모님 정보 — 공백 포함 절대 수정 금지 구역 */}
        <div className="name">
          <span className="parent-names">
            {GROOM_FATHER} · {GROOM_MOTHER}의
          </span>{" "}
          <span className="relation-name relation-name--adjust">{GROOM_TITLE}</span>{" "}
          {GROOM_FULLNAME}
        </div>

        <div className="name">
          <span className="parent-names">
            {BRIDE_FATHER} · {BRIDE_MOTHER}의
          </span>{" "}
          <span className="relation-name relation-name--adjust">{BRIDE_TITLE}</span>{" "}
          {BRIDE_FULLNAME}
        </div>
        {/* END */}

        {/* 하단 긴 장식 라인 ✅ (자연스러운 넝쿨 곡선 + 미세 잎) */}
        <div className="parent-line bottom">
          <svg viewBox="0 0 320 26" aria-hidden="true">
            {/* 메인 넝쿨 라인 */}
            <path
              d="M8 12
                 C70 22, 120 20, 160 14
                 C205 7, 250 6, 312 14"
              stroke="currentColor"
              strokeWidth="0.85"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.9"
            />

            {/* 잎사귀 */}
            <g fill="currentColor" opacity="0.55">
              {/* left leaf */}
              <path d="M74 16 C70 19, 64 18, 63 15 C64 12, 70 12, 74 16 Z" />
              {/* left-mid leaf */}
              <path d="M118 17 C114 20, 109 19, 108 16 C109 13, 114 13, 118 17 Z" />
              {/* right-mid leaf */}
              <path d="M208 13 C212 16, 218 15, 219 12 C218 9, 212 9, 208 13 Z" />
              {/* right leaf */}
              <path d="M252 12 C256 15, 262 14, 263 11 C262 8, 256 8, 252 12 Z" />
            </g>
          </svg>
        </div>

      </div>

      <Button variant="basic" onClick={() => setOpen(true)}>
        축하 인사 전하기
      </Button>

      {open && <ContactModal onClose={() => setOpen(false)} />}
    </div>
  );
}
