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
    {/* LEFT: 큰/작은 섞어서 시작 굵기 확보 */}
    <path d="M18 20 C16 17, 11 17, 10 20 C11 23, 16 23, 18 20 Z"
      transform="translate(14 20) rotate(-16) scale(1.05) translate(-14 -20)"
      opacity="0.58"
    />
    <path d="M36 15 C34 12, 29 12, 28 15 C29 18, 34 18, 36 15 Z"
      transform="translate(32 15) rotate(18) scale(0.78) translate(-32 -15)"
      opacity="0.38"
    />
    <path d="M54 22 C52 19, 47 19, 46 22 C47 25, 52 25, 54 22 Z"
      transform="translate(50 22) rotate(-6) scale(0.92) translate(-50 -22)"
      opacity="0.5"
    />
    <path d="M72 14 C70 11, 65 11, 64 14 C65 17, 70 17, 72 14 Z"
      transform="translate(68 14) rotate(26) scale(0.85) translate(-68 -14)"
      opacity="0.44"
    />

    {/* LEFT-MID */}
    <path d="M90 19 C88 16, 82 16, 81 19 C82 22, 88 22, 90 19 Z"
      transform="translate(85.5 19) rotate(-12) scale(1.02) translate(-85.5 -19)"
      opacity="0.56"
    />
    <path d="M108 13 C106 10, 101 10, 100 13 C101 16, 106 16, 108 13 Z"
      transform="translate(104 13) rotate(8) scale(0.74) translate(-104 -13)"
      opacity="0.34"
    />
    <path d="M126 18 C124 15, 119 15, 118 18 C119 21, 124 21, 126 18 Z"
      transform="translate(122 18) rotate(-22) scale(0.95) translate(-122 -18)"
      opacity="0.48"
    />

    {/* CENTER: 몰리지 않게 “중간 크기”로만 간격 유지 */}
    <path d="M148 14 C146 11, 141 11, 140 14 C141 17, 146 17, 148 14 Z"
      transform="translate(144 14) rotate(14) scale(0.9) translate(-144 -14)"
      opacity="0.46"
    />
    <path d="M166 18 C164 15, 159 15, 158 18 C159 21, 164 21, 166 18 Z"
      transform="translate(162 18) rotate(-18) scale(0.9) translate(-162 -18)"
      opacity="0.46"
    />
    <path d="M184 13 C182 10, 177 10, 176 13 C177 16, 182 16, 184 13 Z"
      transform="translate(180 13) rotate(-10) scale(0.88) translate(-180 -13)"
      opacity="0.44"
    />

    {/* RIGHT-MID */}
    <path d="M202 19 C200 16, 194 16, 193 19 C194 22, 200 22, 202 19 Z"
      transform="translate(197.5 19) rotate(10) scale(1.02) translate(-197.5 -19)"
      opacity="0.56"
    />
    <path d="M220 14 C218 11, 213 11, 212 14 C213 17, 218 17, 220 14 Z"
      transform="translate(216 14) rotate(-20) scale(0.78) translate(-216 -14)"
      opacity="0.36"
    />
    <path d="M238 20 C236 17, 231 17, 230 20 C231 23, 236 23, 238 20 Z"
      transform="translate(234 20) rotate(22) scale(0.96) translate(-234 -20)"
      opacity="0.5"
    />

    {/* RIGHT: 끝도 굵기 유지하면서 자연스럽게 마무리 */}
    <path d="M256 15 C254 12, 249 12, 248 15 C249 18, 254 18, 256 15 Z"
      transform="translate(252 15) rotate(-6) scale(0.82) translate(-252 -15)"
      opacity="0.4"
    />
    <path d="M274 22 C272 19, 267 19, 266 22 C267 25, 272 25, 274 22 Z"
      transform="translate(270 22) rotate(16) scale(0.98) translate(-270 -22)"
      opacity="0.52"
    />
    <path d="M292 18 C290 15, 285 15, 284 18 C285 21, 290 21, 292 18 Z"
      transform="translate(288 18) rotate(-12) scale(1.05) translate(-288 -18)"
      opacity="0.58"
    />

    {/* 아주 미세한 흩날림 2개 (중앙 X, 좌우 끝에만) */}
    <path d="M58 8 C56 6, 53 6, 52 8 C53 10, 56 10, 58 8 Z"
      transform="translate(55 8) rotate(24) scale(0.55) translate(-55 -8)"
      opacity="0.18"
    />
    <path d="M260 7 C258 5, 255 5, 254 7 C255 9, 258 9, 260 7 Z"
      transform="translate(257 7) rotate(-18) scale(0.55) translate(-257 -7)"
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
