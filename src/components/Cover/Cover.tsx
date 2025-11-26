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
        {/* 상단 긴 장식 라인 ✅ (넝쿨 흐름 + 자유로운 잎 방향) */}
        <div className="parent-line top">
          <svg viewBox="0 0 320 32" aria-hidden="true">
            {/* 메인 넝쿨 라인: 자연스러운 S-리듬 */}
            <path
              d="M6 18
                 C58 4, 118 8, 160 14
                 C208 21, 262 24, 314 12"
              stroke="currentColor"
              strokeWidth="0.85"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.9"
            />

            {/* 넝쿨 잔가지(아주 미세한 보조 줄기) */}
            <path
              d="M86 12 C92 10, 96 8, 101 6"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.35"
            />
            <path
              d="M214 17 C220 19, 226 20, 232 22"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.35"
            />

            {/* 잎사귀: 라인 따라 방향/각도/크기 다르게 + 일부 살짝 분리 */}
            <g fill="currentColor" opacity="0.6">
              {/* left leaf (살짝 위로 틀어진) */}
              <path
                d="M70 12 C66 8, 59 9, 58 12 C59 15, 66 16, 70 12 Z"
                transform="rotate(-22 64 12)"
              />
              {/* left-mid leaf (길쭉, 반대 방향) */}
              <path
                d="M105 10 C101 5, 92 7, 92 11 C94 15, 102 14, 105 10 Z"
                transform="rotate(14 98 10)"
              />
              {/* tiny sprout (라인에서 조금 떠 있음) */}
              <path
                d="M138 8 C136 6, 132 6, 131 8 C132 10, 136 10, 138 8 Z"
                transform="rotate(-8 134.5 8)"
                opacity="0.5"
              />
              {/* right-mid leaf (아래쪽으로 툭 꺾인 느낌) */}
              <path
                d="M214 16 C219 12, 227 13, 228 17 C226 21, 218 20, 214 16 Z"
                transform="rotate(26 221 16)"
              />
              {/* right leaf (살짝 분리 + 바람 방향) */}
              <path
                d="M262 19 C268 15, 276 16, 277 20 C275 24, 267 23, 262 19 Z"
                transform="rotate(-12 269.5 19)"
                opacity="0.55"
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

        {/* 하단 긴 장식 라인 ✅ (넝쿨 흐름 + 자유로운 잎 방향) */}
        <div className="parent-line bottom">
          <svg viewBox="0 0 320 32" aria-hidden="true">
            {/* 메인 넝쿨 라인 */}
            <path
              d="M6 14
                 C58 28, 118 24, 160 18
                 C208 11, 262 8, 314 20"
              stroke="currentColor"
              strokeWidth="0.85"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.9"
            />

            {/* 넝쿨 잔가지 */}
            <path
              d="M86 20 C92 22, 96 24, 101 26"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.35"
            />
            <path
              d="M214 15 C220 13, 226 12, 232 10"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.35"
            />

            {/* 잎사귀 */}
            <g fill="currentColor" opacity="0.6">
              {/* left leaf */}
              <path
                d="M70 20 C66 24, 59 23, 58 20 C59 17, 66 16, 70 20 Z"
                transform="rotate(20 64 20)"
              />
              {/* left-mid leaf */}
              <path
                d="M105 22 C101 27, 92 25, 92 21 C94 17, 102 18, 105 22 Z"
                transform="rotate(-16 98 22)"
              />
              {/* tiny sprout (살짝 분리) */}
              <path
                d="M138 24 C136 26, 132 26, 131 24 C132 22, 136 22, 138 24 Z"
                transform="rotate(10 134.5 24)"
                opacity="0.5"
              />
              {/* right-mid leaf */}
              <path
                d="M214 16 C219 20, 227 19, 228 15 C226 11, 218 12, 214 16 Z"
                transform="rotate(-24 221 16)"
              />
              {/* right leaf */}
              <path
                d="M262 12 C268 16, 276 15, 277 11 C275 7, 267 8, 262 12 Z"
                transform="rotate(12 269.5 12)"
                opacity="0.55"
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
