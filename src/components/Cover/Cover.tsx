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

        {/* 상단 긴 장식 라인 ✅ (선 없이 잎만으로 구성된 미니멀 넝쿨) */}
        <div className="parent-line top">
          <svg viewBox="0 0 320 28" aria-hidden="true">
            <g fill="currentColor" opacity="0.75">
              {/* 왼쪽에서 오른쪽으로 “흐르는” 잎 리듬 */}
              <path
                d="M42 16 C36 11, 26 12, 25 16 C26 20, 36 21, 42 16 Z"
                transform="rotate(-18 33.5 16)"
                opacity="0.7"
              />
              <path
                d="M78 13 C72 7, 60 9, 60 14 C62 19, 74 18, 78 13 Z"
                transform="rotate(12 69 13)"
              />
              <path
                d="M112 18 C106 12, 96 13, 95 18 C96 23, 106 23, 112 18 Z"
                transform="rotate(-8 103.5 18)"
                opacity="0.65"
              />
              <path
                d="M148 11 C144 7, 136 8, 136 11 C137 14, 145 14, 148 11 Z"
                transform="rotate(20 142 11)"
                opacity="0.55"
              />

              {/* 중앙 근처 작은 새싹(살짝 떠 있는 느낌) */}
              <path
                d="M165 8 C163 6, 159 6, 158 8 C159 10, 163 10, 165 8 Z"
                transform="rotate(-10 161.5 8)"
                opacity="0.5"
              />

              {/* 오른쪽으로 갈수록 잎이 살짝 커졌다가 가벼워지는 리듬 */}
              <path
                d="M192 18 C198 12, 208 13, 209 18 C208 23, 198 23, 192 18 Z"
                transform="rotate(10 200.5 18)"
                opacity="0.65"
              />
              <path
                d="M228 12 C234 7, 246 9, 246 14 C244 19, 232 17, 228 12 Z"
                transform="rotate(-16 237 12)"
              />
              <path
                d="M264 17 C270 12, 280 13, 281 17 C280 21, 270 22, 264 17 Z"
                transform="rotate(8 272.5 17)"
                opacity="0.7"
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

        {/* 하단 긴 장식 라인 ✅ (선 없이 잎만, 상단과 리듬 통일) */}
        <div className="parent-line bottom">
          <svg viewBox="0 0 320 28" aria-hidden="true">
            <g fill="currentColor" opacity="0.75">
              <path
                d="M42 12 C36 17, 26 16, 25 12 C26 8, 36 7, 42 12 Z"
                transform="rotate(18 33.5 12)"
                opacity="0.7"
              />
              <path
                d="M78 15 C72 21, 60 19, 60 14 C62 9, 74 10, 78 15 Z"
                transform="rotate(-12 69 15)"
              />
              <path
                d="M112 10 C106 16, 96 15, 95 10 C96 5, 106 5, 112 10 Z"
                transform="rotate(8 103.5 10)"
                opacity="0.65"
              />
              <path
                d="M148 17 C144 21, 136 20, 136 17 C137 14, 145 14, 148 17 Z"
                transform="rotate(-20 142 17)"
                opacity="0.55"
              />

              {/* 중앙 근처 작은 새싹 */}
              <path
                d="M165 20 C163 22, 159 22, 158 20 C159 18, 163 18, 165 20 Z"
                transform="rotate(10 161.5 20)"
                opacity="0.5"
              />

              <path
                d="M192 10 C198 16, 208 15, 209 10 C208 5, 198 5, 192 10 Z"
                transform="rotate(-10 200.5 10)"
                opacity="0.65"
              />
              <path
                d="M228 16 C234 21, 246 19, 246 14 C244 9, 232 11, 228 16 Z"
                transform="rotate(16 237 16)"
              />
              <path
                d="M264 11 C270 16, 280 15, 281 11 C280 7, 270 6, 264 11 Z"
                transform="rotate(-8 272.5 11)"
                opacity="0.7"
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
