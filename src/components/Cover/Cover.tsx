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

        {/* 상단 긴 장식 라인 */}
        <div className="parent-line top">
          <svg viewBox="0 0 320 28">
            <path
              d="M5 14 C80 2, 240 26, 315 14"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeDasharray="2 3"
              fill="none"
            />

            {/* 점 */}
            <circle cx="70" cy="11" r="1.2" fill="currentColor" />
            <circle cx="140" cy="17" r="1.2" fill="currentColor" />
            <circle cx="240" cy="12" r="1.2" fill="currentColor" />

            {/* 다이아 */}
            <rect x="105" y="9" width="2.4" height="2.4" fill="currentColor" transform="rotate(45 106 10)" />
            <rect x="185" y="12" width="2.4" height="2.4" fill="currentColor" transform="rotate(45 186 13)" />
            <rect x="275" y="10" width="2.4" height="2.4" fill="currentColor" transform="rotate(45 276 11)" />
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

        {/* 하단 긴 장식 라인 */}
        <div className="parent-line bottom">
          <svg viewBox="0 0 320 28">
            <path
              d="M5 14 C80 26, 240 2, 315 14"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeDasharray="2 3"
              fill="none"
            />

            {/* 점 */}
            <circle cx="60" cy="15" r="1.2" fill="currentColor" />
            <circle cx="150" cy="9" r="1.2" fill="currentColor" />
            <circle cx="245" cy="16" r="1.2" fill="currentColor" />

            {/* 다이아 */}
            <rect x="95" y="13" width="2.4" height="2.4" fill="currentColor" transform="rotate(45 96 14)" />
            <rect x="205" y="7" width="2.4" height="2.4" fill="currentColor" transform="rotate(45 206 8)" />
            <rect x="285" y="15" width="2.4" height="2.4" fill="currentColor" transform="rotate(45 286 16)" />
          </svg>
        </div>

      </div>

      <Button variant="solid" onClick={() => setOpen(true)}> 
        축하 인사 전하기
      </Button>

      {open && <ContactModal onClose={() => setOpen(false)} />}
    </div>
  );
}
