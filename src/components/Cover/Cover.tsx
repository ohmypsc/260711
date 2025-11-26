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
        {/* 상단 긴 장식 라인 ✅ (자유분방 + 일부 잎 살짝 분리) */}
        <div className="parent-line top">
          <svg viewBox="0 0 320 30" aria-hidden="true">
            {/* 메인 넝쿨 라인: 자연스럽게 흐르는 리듬 */}
            <path
              d="M6 16
                 C55 3, 120 7, 160 13
                 C205 20, 260 23, 314 11"
              stroke="currentColor"
              strokeWidth="0.85"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.9"
            />

            {/* 잎사귀: 규칙 X, 일부는 라인에서 살짝 떨어뜨림 */}
            <g fill="currentColor" opacity="0.55">
              {/* left small leaf (on line) */}
              <path d="M58 9 C54 6, 48 7, 47 10 C49 13, 55 13, 58 9 Z" />
              {/* left-mid leaf (on line, longer) */}
              <path d="M108 8 C103 4, 95 6, 95 10 C97 14, 105 13, 108 8 Z" />

              {/* tiny sprout leaf (detached, 살짝 위로 떠 있음) */}
              <path
                d="M145 9 C143 7, 139 7, 138 9 C139 11, 143 11, 145 9 Z"
                transform="rotate(-8 141.5 9)"
                opacity="0.5"
              />

              {/* right-mid leaf (on line, flipped 느낌) */}
              <path d="M214 14 C218 10, 226 11, 227 15 C225 19, 217 18, 214 14 Z" />

              {/* right leaf (detached, 라인에서 살짝 아래로) */}
              <path
                d="M266 18 C271 14, 279 15, 280 19 C278 23, 270 22, 266 18 Z"
                transform="rotate(6 273 18)"
              />
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

        {/* 하단 긴 장식 라인 ✅ (자유분방 + 일부 잎 살짝 분리) */}
        <div className="parent-line bottom">
          <svg viewBox="0 0 320 30" aria-hidden="true">
            {/* 메인 넝쿨 라인 */}
            <path
              d="M6 14
                 C55 27, 120 23, 160 17
                 C205 9, 260 6, 314 18"
              stroke="currentColor"
              strokeWidth="0.85"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.9"
            />

            {/* 잎사귀 */}
            <g fill="currentColor" opacity="0.55">
              {/* left small leaf (on line) */}
              <path d="M58 21 C54 24, 48 23, 47 20 C49 17, 55 17, 58 21 Z" />
              {/* left-mid leaf (on line, longer) */}
              <path d="M108 22 C103 26, 95 24, 95 20 C97 16, 105 17, 108 22 Z" />

              {/* tiny sprout leaf (detached, 살짝 아래로 떠 있음) */}
              <path
                d="M145 20 C143 22, 139 22, 138 20 C139 18, 143 18, 145 20 Z"
                transform="rotate(10 141.5 20)"
                opacity="0.5"
              />

              {/* right-mid leaf (on line) */}
              <path d="M214 16 C218 20, 226 19, 227 15 C225 11, 217 12, 214 16 Z" />

              {/* right leaf (detached, 살짝 위로) */}
              <path
                d="M266 11 C271 15, 279 14, 280 10 C278 6, 270 7, 266 11 Z"
                transform="rotate(-6 273 11)"
              />
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
