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
        {/* 상단 긴 장식 라인 ✅ (더 원만한 아치 + 비대칭 리듬) */}
        <div className="parent-line top">
          <svg viewBox="0 0 320 34" aria-hidden="true">
            <g fill="currentColor">
              {/* TOP: 높낮이 변화가 부드러운 “완만한 아치” 흐름 */}
              <path
                d="M18 20 C16 17, 11 17, 10 20 C11 23, 16 23, 18 20 Z"
                transform="translate(14 20) rotate(-18) scale(0.9) translate(-14 -20)"
                opacity="0.44"
              />
              <path
                d="M38 16 C36 13, 31 13, 30 16 C31 19, 36 19, 38 16 Z"
                transform="translate(34 16) rotate(12) scale(1.1) translate(-34 -16)"
                opacity="0.66"
              />
              <path
                d="M58 21 C56 18, 51 18, 50 21 C51 24, 56 24, 58 21 Z"
                transform="translate(54 21) rotate(-6) scale(0.82) translate(-54 -21)"
                opacity="0.36"
              />
              <path
                d="M78 15 C76 12, 71 12, 70 15 C71 18, 76 18, 78 15 Z"
                transform="translate(74 15) rotate(22) scale(1.02) translate(-74 -15)"
                opacity="0.6"
              />
              <path
                d="M98 19 C96 16, 90 16, 89 19 C90 22, 96 22, 98 19 Z"
                transform="translate(93.5 19) rotate(-14) scale(0.92) translate(-93.5 -19)"
                opacity="0.5"
              />
              <path
                d="M118 14 C116 11, 111 11, 110 14 C111 17, 116 17, 118 14 Z"
                transform="translate(114 14) rotate(6) scale(0.8) translate(-114 -14)"
                opacity="0.34"
              />
              <path
                d="M140 18 C138 15, 133 15, 132 18 C133 21, 138 21, 140 18 Z"
                transform="translate(136 18) rotate(-24) scale(1.05) translate(-136 -18)"
                opacity="0.58"
              />

              {/* 중앙 근처: 작고 옅은 잎이 “자르르” */}
              <path
                d="M158 12 C156 10, 153 10, 152 12 C153 14, 156 14, 158 12 Z"
                transform="translate(155 12) rotate(14) scale(0.65) translate(-155 -12)"
                opacity="0.24"
              />
              <path
                d="M170 16 C168 14, 165 14, 164 16 C165 18, 168 18, 170 16 Z"
                transform="translate(167 16) rotate(-18) scale(0.7) translate(-167 -16)"
                opacity="0.3"
              />
              <path
                d="M182 11 C180 9, 177 9, 176 11 C177 13, 180 13, 182 11 Z"
                transform="translate(179 11) rotate(-32) scale(0.6) translate(-179 -11)"
                opacity="0.22"
              />
              <path
                d="M194 18 C192 16, 189 16, 188 18 C189 20, 192 20, 194 18 Z"
                transform="translate(191 18) rotate(20) scale(0.72) translate(-191 -18)"
                opacity="0.28"
              />

              {/* 오른쪽: 완만하게 내려왔다가 살짝 올라오는 자유 아치 */}
              <path
                d="M210 16 C208 13, 203 13, 202 16 C203 19, 208 19, 210 16 Z"
                transform="translate(206 16) rotate(8) scale(0.9) translate(-206 -16)"
                opacity="0.5"
              />
              <path
                d="M230 20 C228 17, 223 17, 222 20 C223 23, 228 23, 230 20 Z"
                transform="translate(226 20) rotate(-16) scale(1.15) translate(-226 -20)"
                opacity="0.64"
              />
              <path
                d="M250 17 C248 14, 243 14, 242 17 C243 20, 248 20, 250 17 Z"
                transform="translate(246 17) rotate(4) scale(0.8) translate(-246 -17)"
                opacity="0.38"
              />
              <path
                d="M270 22 C268 19, 263 19, 262 22 C263 25, 268 25, 270 22 Z"
                transform="translate(266 22) rotate(18) scale(1.0) translate(-266 -22)"
                opacity="0.56"
              />
              <path
                d="M292 19 C290 16, 285 16, 284 19 C285 22, 290 22, 292 19 Z"
                transform="translate(288 19) rotate(-10) scale(0.92) translate(-288 -19)"
                opacity="0.46"
              />

              {/* 흩날림 보조 잎(탑은 살짝 위쪽으로) */}
              <path
                d="M86 7 C84 5, 81 5, 80 7 C81 9, 84 9, 86 7 Z"
                transform="translate(83 7) rotate(28) scale(0.55) translate(-83 -7)"
                opacity="0.16"
              />
              <path
                d="M244 9 C242 7, 239 7, 238 9 C239 11, 242 11, 244 9 Z"
                transform="translate(241 9) rotate(-12) scale(0.6) translate(-241 -9)"
                opacity="0.18"
              />
            </g>
          </svg>
        </div>

        {/* 부모님 정보 — 공백 포함 절대 수정 금지 구역 */}
        <div className="name">
          <span className="parent-names">
            {GROOM_FATHER} · {GROOM_MOTHER}의
          </span>{" "}
          <span className="relation-name relation-name--adjust">
            {GROOM_TITLE}
          </span>{" "}
          {GROOM_FULLNAME}
        </div>

        <div className="name">
          <span className="parent-names">
            {BRIDE_FATHER} · {BRIDE_MOTHER}의
          </span>{" "}
          <span className="relation-name relation-name--adjust">
            {BRIDE_TITLE}
          </span>{" "}
          {BRIDE_FULLNAME}
        </div>
        {/* END */}

        {/* 하단 긴 장식 라인 ✅ (상단과 다른 흐름/밀도/곡률로 비대칭) */}
        <div className="parent-line bottom">
          <svg viewBox="0 0 320 34" aria-hidden="true">
            <g fill="currentColor">
              {/* BOTTOM: 탑보다 “조금 낮게 깔리고”, 중간이 더 무거운 흐름 */}
              <path
                d="M26 12 C24 15, 19 15, 18 12 C19 9, 24 9, 26 12 Z"
                transform="translate(22 12) rotate(20) scale(0.85) translate(-22 -12)"
                opacity="0.4"
              />
              <path
                d="M48 18 C46 21, 41 21, 40 18 C41 15, 46 15, 48 18 Z"
                transform="translate(44 18) rotate(-10) scale(1.05) translate(-44 -18)"
                opacity="0.58"
              />
              <path
                d="M70 14 C68 17, 63 17, 62 14 C63 11, 68 11, 70 14 Z"
                transform="translate(66 14) rotate(6) scale(0.78) translate(-66 -14)"
                opacity="0.32"
              />
              <path
                d="M90 20 C88 23, 83 23, 82 20 C83 17, 88 17, 90 20 Z"
                transform="translate(86 20) rotate(-22) scale(1.1) translate(-86 -20)"
                opacity="0.62"
              />
              <path
                d="M112 17 C110 20, 104 20, 103 17 C104 14, 110 14, 112 17 Z"
                transform="translate(107.5 17) rotate(14) scale(0.95) translate(-107.5 -17)"
                opacity="0.5"
              />

              {/* 바텀은 중앙 쪽 잎이 조금 더 큼/짙음 */}
              <path
                d="M134 22 C132 25, 127 25, 126 22 C127 19, 132 19, 134 22 Z"
                transform="translate(130 22) rotate(-4) scale(1.12) translate(-130 -22)"
                opacity="0.68"
              />
              <path
                d="M154 16 C152 18, 149 18, 148 16 C149 14, 152 14, 154 16 Z"
                transform="translate(151 16) rotate(18) scale(0.7) translate(-151 -16)"
                opacity="0.3"
              />
              <path
                d="M168 22 C166 24, 163 24, 162 22 C163 20, 166 20, 168 22 Z"
                transform="translate(165 22) rotate(-26) scale(0.75) translate(-165 -22)"
                opacity="0.34"
              />
              <path
                d="M184 18 C182 20, 179 20, 178 18 C179 16, 182 16, 184 18 Z"
                transform="translate(181 18) rotate(30) scale(0.8) translate(-181 -18)"
                opacity="0.36"
              />

              {/* 오른쪽: 탑보다 더 완만하게 “펼쳐지는” 끝맺음 */}
              <path
                d="M206 21 C204 24, 199 24, 198 21 C199 18, 204 18, 206 21 Z"
                transform="translate(202 21) rotate(-8) scale(0.95) translate(-202 -21)"
                opacity="0.52"
              />
              <path
                d="M230 15 C228 18, 223 18, 222 15 C223 12, 228 12, 230 15 Z"
                transform="translate(226 15) rotate(22) scale(0.9) translate(-226 -15)"
                opacity="0.46"
              />
              <path
                d="M254 20 C252 23, 247 23, 246 20 C247 17, 252 17, 254 20 Z"
                transform="translate(250 20) rotate(-12) scale(1.05) translate(-250 -20)"
                opacity="0.6"
              />
              <path
                d="M276 14 C274 17, 269 17, 268 14 C269 11, 274 11, 276 14 Z"
                transform="translate(272 14) rotate(-18) scale(0.8) translate(-272 -14)"
                opacity="0.34"
              />
              <path
                d="M298 17 C296 20, 291 20, 290 17 C291 14, 296 14, 298 17 Z"
                transform="translate(294 17) rotate(8) scale(0.9) translate(-294 -17)"
                opacity="0.44"
              />

              {/* 흩날림 보조 잎(바텀은 살짝 아래쪽으로) */}
              <path
                d="M96 30 C94 32, 91 32, 90 30 C91 28, 94 28, 96 30 Z"
                transform="translate(93 30) rotate(-14) scale(0.55) translate(-93 -30)"
                opacity="0.16"
              />
              <path
                d="M262 29 C260 31, 257 31, 256 29 C257 27, 260 27, 262 29 Z"
                transform="translate(259 29) rotate(18) scale(0.6) translate(-259 -29)"
                opacity="0.18"
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
