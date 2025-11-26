import React from "react";
import "./Invitation.scss";

function LeafDivider() {
  return (
    <div className="divider-line parent-line">
      <svg viewBox="0 0 320 34" aria-hidden="true" preserveAspectRatio="none">
        <g fill="currentColor">
          {/* ✅ 양끝 고정 잎(길이 기준점) */}
          <path
            d="M10 19 C8 16, 3 16, 2 19 C3 22, 8 22, 10 19 Z"
            transform="translate(6 19) rotate(-8) scale(0.9) translate(-6 -19)"
            opacity="0.42"
          />
          <path
            d="M318 19 C316 16, 311 16, 310 19 C311 22, 316 22, 318 19 Z"
            transform="translate(314 19) rotate(10) scale(0.9) translate(-314 -19)"
            opacity="0.42"
          />

          {/* TOP 느낌의 완만한 아치 리듬(잎-only) */}
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

          {/* 오른쪽: 완만하게 퍼지는 끝맺음 */}
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

          {/* 흩날림 보조 잎 */}
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
  );
}

export function Invitation(): JSX.Element {
  return (
    <section className="invitation">
      <div className="section-inner">
        <h2 className="section-title">모시는 글</h2>

        {/* 1. 시(詩) 인용 부분 */}
        <div className="invitation-text-block poetry-section">
          <div className="inv-content">
            나는 오래된 거리처럼 너를 사랑하고<br />
            별들은 벌들처럼 웅성거리고<br />
          </div>

          <div className="inv-content">
            여름에는 작은 은색 드럼을 치는 것처럼<br />
            네 손바닥을 두드리는 비를 줄게<br />
            과거에게 그랬듯 미래에게도 아첨하지 않을게<br />
          </div>

          <div className="inv-content">
            어린 시절 순결한 비누 거품 속에서 우리가 했던 맹세들을 찾아<br />
            너의 팔에 모두 적어줄게<br />
          </div>

          <div className="inv-content poet">
            진은영, &lt;청혼&gt; 중
          </div>
        </div>

        {/* divider line ✅ Cover와 동일한 잎 라인 */}
        <LeafDivider />

        <div className="invitation-text-block our-message-section">
          <div className="inv-content">
            오래된 거리처럼 익숙하지만,<br />
            여름비도 즐겁게 맞고,<br />
            시간의 흐름에 기대지 않고 서로에게 최선을 다하며,<br />
            어린 시절 순수한 마음으로 서로를 대하는 부부가 되고자 합니다.<br />
            이 시작을 함께해 주신다면 더없이 감사하겠습니다.<br />
          </div>
        </div>
      </div>
    </section>
  );
}
