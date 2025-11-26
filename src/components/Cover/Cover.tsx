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
        {/* 상단 긴 장식 라인 ✅ (선 없이, 잎이 흩날리며 곡선을 “만드는” 느낌 + 크기/농도 제각각) */}
        <div className="parent-line top">
          <svg viewBox="0 0 320 34" aria-hidden="true">
            {/* 각각의 잎에 opacity/scale/각도 다르게 */}
            <g fill="currentColor">
              {/* LEFT FLOW */}
              <path
                d="M20 21 C18 18, 13 18, 12 21 C13 24, 18 24, 20 21 Z"
                transform="translate(16 21) rotate(-28) scale(0.9) translate(-16 -21)"
                opacity="0.45"
              />
              <path
                d="M40 15 C38 12, 33 12, 32 15 C33 18, 38 18, 40 15 Z"
                transform="translate(36 15) rotate(22) scale(1.15) translate(-36 -15)"
                opacity="0.7"
              />
              <path
                d="M60 23 C58 20, 53 20, 52 23 C53 26, 58 26, 60 23 Z"
                transform="translate(56 23) rotate(-8) scale(0.8) translate(-56 -23)"
                opacity="0.38"
              />
              <path
                d="M82 13 C80 10, 75 10, 74 13 C75 16, 80 16, 82 13 Z"
                transform="translate(78 13) rotate(35) scale(1.05) translate(-78 -13)"
                opacity="0.62"
              />
              <path
                d="M102 20 C100 17, 94 17, 93 20 C94 23, 100 23, 102 20 Z"
                transform="translate(97.5 20) rotate(-18) scale(0.95) translate(-97.5 -20)"
                opacity="0.52"
              />
              <path
                d="M124 12 C122 9, 117 9, 116 12 C117 15, 122 15, 124 12 Z"
                transform="translate(120 12) rotate(8) scale(0.75) translate(-120 -12)"
                opacity="0.36"
              />
              <path
                d="M144 18 C142 15, 137 15, 136 18 C137 21, 142 21, 144 18 Z"
                transform="translate(140 18) rotate(-32) scale(1.1) translate(-140 -18)"
                opacity="0.6"
              />

              {/* CENTER (densest, airy) */}
              <path
                d="M158 10 C156 8, 153 8, 152 10 C153 12, 156 12, 158 10 Z"
                transform="translate(155 10) rotate(18) scale(0.65) translate(-155 -10)"
                opacity="0.28"
              />
              <path
                d="M170 16 C168 14, 165 14, 164 16 C165 18, 168 18, 170 16 Z"
                transform="translate(167 16) rotate(-20) scale(0.7) translate(-167 -16)"
                opacity="0.32"
              />
              <path
                d="M182 9 C180 7, 177 7, 176 9 C177 11, 180 11, 182 9 Z"
                transform="translate(179 9) rotate(-45) scale(0.6) translate(-179 -9)"
                opacity="0.24"
              />
              <path
                d="M194 19 C192 17, 189 17, 188 19 C189 21, 192 21, 194 19 Z"
                transform="translate(191 19) rotate(30) scale(0.72) translate(-191 -19)"
                opacity="0.3"
              />

              {/* RIGHT FLOW */}
              <path
                d="M210 14 C208 11, 203 11, 202 14 C203 17, 208 17, 210 14 Z"
                transform="translate(206 14) rotate(14) scale(0.9) translate(-206 -14)"
                opacity="0.5"
              />
              <path
                d="M230 22 C228 19, 223 19, 222 22 C223 25, 228 25, 230 22 Z"
                transform="translate(226 22) rotate(-26) scale(1.2) translate(-226 -22)"
                opacity="0.68"
              />
              <path
                d="M250 15 C248 12, 243 12, 242 15 C243 18, 248 18, 250 15 Z"
                transform="translate(246 15) rotate(6) scale(0.78) translate(-246 -15)"
                opacity="0.4"
              />
              <path
                d="M272 24 C270 21, 265 21, 264 24 C265 27, 270 27, 272 24 Z"
                transform="translate(268 24) rotate(28) scale(1.05) translate(-268 -24)"
                opacity="0.6"
              />
              <path
                d="M294 18 C292 15, 287 15, 286 18 C287 21, 292 21, 294 18 Z"
                transform="translate(290 18) rotate(-12) scale(0.9) translate(-290 -18)"
                opacity="0.48"
              />

              {/* drifting tiny leaves (detached) */}
              <path
                d="M92 6 C90 4, 87 4, 86 6 C87 8, 90 8, 92 6 Z"
                transform="translate(89 6) rotate(40) scale(0.55) translate(-89 -6)"
                opacity="0.18"
              />
              <path
                d="M238 8 C236 6, 233 6, 232 8 C233 10, 236 10, 238 8 Z"
                transform="translate(235 8) rotate(-18) scale(0.6) translate(-235 -8)"
                opacity="0.2"
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

        {/* 하단 긴 장식 라인 ✅ (상단과 다른 자유 리듬 + 크기/농도 제각각) */}
        <div className="parent-line bottom">
          <svg viewBox="0 0 320 34" aria-hidden="true">
            <g fill="currentColor">
              {/* LEFT FLOW */}
              <path
                d="M22 13 C20 16, 15 16, 14 13 C15 10, 20 10, 22 13 Z"
                transform="translate(18 13) rotate(24) scale(0.95) translate(-18 -13)"
                opacity="0.46"
              />
              <path
                d="M44 20 C42 23, 37 22, 36 20 C37 17, 42 17, 44 20 Z"
                transform="translate(40 20) rotate(-18) scale(1.15) translate(-40 -20)"
                opacity="0.7"
              />
              <path
                d="M64 12 C62 15, 57 15, 56 12 C57 9, 62 9, 64 12 Z"
                transform="translate(60 12) rotate(8) scale(0.8) translate(-60 -12)"
                opacity="0.38"
              />
              <path
                d="M86 22 C84 25, 79 24, 78 22 C79 19, 84 19, 86 22 Z"
                transform="translate(82 22) rotate(-32) scale(1.05) translate(-82 -22)"
                opacity="0.62"
              />
              <path
                d="M106 16 C104 19, 98 19, 97 16 C98 13, 104 13, 106 16 Z"
                transform="translate(101.5 16) rotate(18) scale(0.95) translate(-101.5 -16)"
                opacity="0.52"
              />
              <path
                d="M128 23 C126 26, 121 26, 120 23 C121 20, 126 20, 128 23 Z"
                transform="translate(124 23) rotate(-6) scale(0.78) translate(-124 -23)"
                opacity="0.4"
              />
              <path
                d="M148 14 C146 17, 141 17, 140 14 C141 11, 146 11, 148 14 Z"
                transform="translate(144 14) rotate(30) scale(1.1) translate(-144 -14)"
                opacity="0.6"
              />

              {/* CENTER airy */}
              <path
                d="M162 24 C160 26, 157 26, 156 24 C157 22, 160 22, 162 24 Z"
                transform="translate(159 24) rotate(-12) scale(0.65) translate(-159 -24)"
                opacity="0.28"
              />
              <path
                d="M174 18 C172 20, 169 20, 168 18 C169 16, 172 16, 174 18 Z"
                transform="translate(171 18) rotate(26) scale(0.72) translate(-171 -18)"
                opacity="0.32"
              />
              <path
                d="M186 25 C184 27, 181 27, 180 25 C181 23, 184 23, 186 25 Z"
                transform="translate(183 25) rotate(44) scale(0.6) translate(-183 -25)"
                opacity="0.24"
              />
              <path
                d="M198 13 C196 15, 193 15, 192 13 C193 11, 196 11, 198 13 Z"
                transform="translate(195 13) rotate(-30) scale(0.7) translate(-195 -13)"
                opacity="0.3"
              />

              {/* RIGHT FLOW */}
              <path
                d="M214 22 C212 25, 207 24, 206 22 C207 19, 212 19, 214 22 Z"
                transform="translate(210 22) rotate(-14) scale(1.05) translate(-210 -22)"
                opacity="0.6"
              />
              <path
                d="M234 14 C232 17, 227 17, 226 14 C227 11, 232 11, 234 14 Z"
                transform="translate(230 14) rotate(28) scale(0.9) translate(-230 -14)"
                opacity="0.5"
              />
              <path
                d="M254 21 C252 24, 247 24, 246 21 C247 18, 252 18, 254 21 Z"
                transform="translate(250 21) rotate(-6) scale(1.2) translate(-250 -21)"
                opacity="0.68"
              />
              <path
                d="M276 12 C274 15, 269 14, 268 12 C269 9, 274 9, 276 12 Z"
                transform="translate(272 12) rotate(-28) scale(0.78) translate(-272 -12)"
                opacity="0.4"
              />
              <path
                d="M296 19 C294 22, 289 22, 288 19 C289 16, 294 16, 296 19 Z"
                transform="translate(292 19) rotate(10) scale(0.95) translate(-292 -19)"
                opacity="0.48"
              />

              {/* drifting tiny leaves */}
              <path
                d="M82 30 C80 32, 77 32, 76 30 C77 28, 80 28, 82 30 Z"
                transform="translate(79 30) rotate(-18) scale(0.55) translate(-79 -30)"
                opacity="0.18"
              />
              <path
                d="M250 30 C248 32, 245 32, 244 30 C245 28, 248 28, 250 30 Z"
                transform="translate(247 30) rotate(22) scale(0.6) translate(-247 -30)"
                opacity="0.2"
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
