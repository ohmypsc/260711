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

        {/* 상단 긴 장식 라인 ✅ (선 없이, 작은 잎들이 자르르 흐르는 느낌 / 방향 자유) */}
        <div className="parent-line top">
          <svg viewBox="0 0 320 30" aria-hidden="true">
            <g fill="currentColor" opacity="0.72">
              {/* 왼쪽 → 오른쪽으로 “사선 흐름”을 타는 작은 잎들 */}
              <path d="M26 18 C24 15, 19 15, 18 18 C19 21, 24 21, 26 18 Z"
                    transform="rotate(-35 22 18)" opacity="0.55" />
              <path d="M48 13 C46 10, 41 10, 40 13 C41 16, 46 16, 48 13 Z"
                    transform="rotate(18 44 13)" opacity="0.6" />
              <path d="M70 19 C68 16, 63 16, 62 19 C63 22, 68 22, 70 19 Z"
                    transform="rotate(-10 66 19)" opacity="0.5" />
              <path d="M92 11 C90 8, 85 9, 84 11 C85 14, 90 14, 92 11 Z"
                    transform="rotate(32 88 11)" opacity="0.62" />
              <path d="M114 17 C112 14, 106 14, 105 17 C106 20, 112 20, 114 17 Z"
                    transform="rotate(-22 109.5 17)" opacity="0.56" />
              <path d="M138 12 C136 9, 131 9, 130 12 C131 15, 136 15, 138 12 Z"
                    transform="rotate(8 134 12)" opacity="0.48" />

              {/* 중앙 근처: 더 촘촘하고 작은 잎 리듬 */}
              <path d="M158 9 C156 7, 153 7, 152 9 C153 11, 156 11, 158 9 Z"
                    transform="rotate(-18 155 9)" opacity="0.45" />
              <path d="M170 15 C168 13, 165 13, 164 15 C165 17, 168 17, 170 15 Z"
                    transform="rotate(26 167 15)" opacity="0.5" />
              <path d="M184 10 C182 8, 179 8, 178 10 C179 12, 182 12, 184 10 Z"
                    transform="rotate(-40 181 10)" opacity="0.42" />

              {/* 오른쪽으로 갈수록 가볍게 흩어지는 느낌 */}
              <path d="M206 18 C204 15, 199 15, 198 18 C199 21, 204 21, 206 18 Z"
                    transform="rotate(14 202 18)" opacity="0.55" />
              <path d="M230 12 C228 9, 223 9, 222 12 C223 15, 228 15, 230 12 Z"
                    transform="rotate(-28 226 12)" opacity="0.6" />
              <path d="M254 19 C252 16, 247 16, 246 19 C247 22, 252 22, 254 19 Z"
                    transform="rotate(6 250 19)" opacity="0.5" />
              <path d="M280 13 C278 10, 273 10, 272 13 C273 16, 278 16, 280 13 Z"
                    transform="rotate(38 276 13)" opacity="0.58" />
              <path d="M300 18 C298 15, 293 15, 292 18 C293 21, 298 21, 300 18 Z"
                    transform="rotate(-12 296 18)" opacity="0.52" />
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

        {/* 하단 긴 장식 라인 ✅ (상단과 결 맞춘 잎 흐름 / 방향 자유) */}
        <div className="parent-line bottom">
          <svg viewBox="0 0 320 30" aria-hidden="true">
            <g fill="currentColor" opacity="0.72">
              {/* 하단은 반대 리듬으로 “아래 사선 흐름” */}
              <path d="M26 12 C24 15, 19 15, 18 12 C19 9, 24 9, 26 12 Z"
                    transform="rotate(28 22 12)" opacity="0.55" />
              <path d="M48 18 C46 21, 41 20, 40 18 C41 15, 46 15, 48 18 Z"
                    transform="rotate(-20 44 18)" opacity="0.6" />
              <path d="M70 11 C68 14, 63 14, 62 11 C63 8, 68 8, 70 11 Z"
                    transform="rotate(12 66 11)" opacity="0.5" />
              <path d="M92 19 C90 22, 85 21, 84 19 C85 16, 90 16, 92 19 Z"
                    transform="rotate(-34 88 19)" opacity="0.62" />
              <path d="M114 13 C112 16, 106 16, 105 13 C106 10, 112 10, 114 13 Z"
                    transform="rotate(24 109.5 13)" opacity="0.56" />
              <path d="M138 18 C136 21, 131 21, 130 18 C131 15, 136 15, 138 18 Z"
                    transform="rotate(-6 134 18)" opacity="0.48" />

              {/* 중앙 근처: 촘촘한 작은 잎 */}
              <path d="M158 20 C156 22, 153 22, 152 20 C153 18, 156 18, 158 20 Z"
                    transform="rotate(16 155 20)" opacity="0.45" />
              <path d="M170 14 C168 16, 165 16, 164 14 C165 12, 168 12, 170 14 Z"
                    transform="rotate(-26 167 14)" opacity="0.5" />
              <path d="M184 19 C182 21, 179 21, 178 19 C179 17, 182 17, 184 19 Z"
                    transform="rotate(40 181 19)" opacity="0.42" />

              {/* 오른쪽 */}
              <path d="M206 11 C204 14, 199 14, 198 11 C199 8, 204 8, 206 11 Z"
                    transform="rotate(-14 202 11)" opacity="0.55" />
              <path d="M230 18 C228 21, 223 20, 222 18 C223 15, 228 15, 230 18 Z"
                    transform="rotate(30 226 18)" opacity="0.6" />
              <path d="M254 11 C252 14, 247 14, 246 11 C247 8, 252 8, 254 11 Z"
                    transform="rotate(-8 250 11)" opacity="0.5" />
              <path d="M280 18 C278 21, 273 21, 272 18 C273 15, 278 15, 280 18 Z"
                    transform="rotate(-38 276 18)" opacity="0.58" />
              <path d="M300 12 C298 15, 293 15, 292 12 C293 9, 298 9, 300 12 Z"
                    transform="rotate(10 296 12)" opacity="0.52" />
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
