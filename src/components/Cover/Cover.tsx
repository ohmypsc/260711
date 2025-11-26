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

        {/* 상단 긴 장식 라인 ✅ (잎사귀 미니멀) */}
        <div className="parent-line top">
          <svg viewBox="0 0 320 24" aria-hidden="true">
            {/* 단일 곡선 */}
            <path
              d="M10 12 C90 5, 230 5, 310 12"
              stroke="currentColor"
              strokeWidth="0.9"
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
            />

            {/* 중앙 아주 작은 잎 2개 */}
            <path
              d="M156 12
                 C152 9, 148 9, 147 12
                 C148 15, 152 15, 156 12 Z"
              fill="currentColor"
              opacity="0.55"
            />
            <path
              d="M164 12
                 C168 9, 172 9, 173 12
                 C172 15, 168 15, 164 12 Z"
              fill="currentColor"
              opacity="0.55"
            />
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

        {/* 하단 긴 장식 라인 ✅ (잎사귀 미니멀) */}
        <div className="parent-line bottom">
          <svg viewBox="0 0 320 24" aria-hidden="true">
            {/* 단일 곡선 */}
            <path
              d="M10 12 C90 19, 230 19, 310 12"
              stroke="currentColor"
              strokeWidth="0.9"
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
            />

            {/* 중앙 아주 작은 잎 2개 */}
            <path
              d="M156 12
                 C152 9, 148 9, 147 12
                 C148 15, 152 15, 156 12 Z"
              fill="currentColor"
              opacity="0.55"
            />
            <path
              d="M164 12
                 C168 9, 172 9, 173 12
                 C172 15, 168 15, 164 12 Z"
              fill="currentColor"
              opacity="0.55"
            />
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
