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
            transform="translate(6 19) rotate(-10) scale(0.9) translate(-6 -19)"
            opacity="0.42"
          />
          <path
            d="M318 19 C316 16, 311 16, 310 19 C311 22, 316 22, 318 19 Z"
            transform="translate(314 19) rotate(8) scale(0.9) translate(-314 -19)"
            opacity="0.42"
          />

          {/* LEFT FLOW */}
          <path
            d="M20 19 C18 16, 13 16, 12 19 C13 22, 18 22, 20 19 Z"
            transform="translate(16 19) rotate(-18) scale(0.95) translate(-16 -19)"
            opacity="0.5"
          />
          <path
            d="M40 14 C38 11, 33 11, 32 14 C33 17, 38 17, 40 14 Z"
            transform="translate(36 14) rotate(14) scale(0.78) translate(-36 -14)"
            opacity="0.36"
          />
          <path
            d="M58 22 C56 19, 51 19, 50 22 C51 25, 56 25, 58 22 Z"
            transform="translate(54 22) rotate(-6) scale(1.02) translate(-54 -22)"
            opacity="0.56"
          />
          <path
            d="M78 15 C76 12, 71 12, 70 15 C71 18, 76 18, 78 15 Z"
            transform="translate(74 15) rotate(24) scale(0.88) translate(-74 -15)"
            opacity="0.44"
          />
          <path
            d="M98 20 C96 17, 90 17, 89 20 C90 23, 96 23, 98 20 Z"
            transform="translate(93.5 20) rotate(-12) scale(1.0) translate(-93.5 -20)"
            opacity="0.54"
          />

          {/* MID */}
          <path
            d="M122 16 C120 13, 115 13, 114 16 C115 19, 120 19, 122 16 Z"
            transform="translate(118 16) rotate(8) scale(0.82) translate(-118 -16)"
            opacity="0.38"
          />
          <path
            d="M142 19 C140 16, 135 16, 134 19 C135 22, 140 22, 142 19 Z"
            transform="translate(138 19) rotate(-20) scale(0.96) translate(-138 -19)"
            opacity="0.5"
          />
          <path
            d="M160 13 C158 11, 155 11, 154 13 C155 15, 158 15, 160 13 Z"
            transform="translate(157 13) rotate(12) scale(0.7) translate(-157 -13)"
            opacity="0.28"
          />
          <path
            d="M176 18 C174 15, 169 15, 168 18 C169 21, 174 21, 176 18 Z"
            transform="translate(172 18) rotate(-10) scale(0.92) translate(-172 -18)"
            opacity="0.46"
          />
          <path
            d="M194 14 C192 11, 187 11, 186 14 C187 17, 192 17, 194 14 Z"
            transform="translate(190 14) rotate(-14) scale(0.86) translate(-190 -14)"
            opacity="0.4"
          />

          {/* RIGHT FLOW */}
          <path
            d="M214 19 C212 16, 206 16, 205 19 C206 22, 212 22, 214 19 Z"
            transform="translate(209.5 19) rotate(10) scale(1.0) translate(-209.5 -19)"
            opacity="0.54"
          />
          <path
            d="M234 15 C232 12, 227 12, 226 15 C227 18, 232 18, 234 15 Z"
            transform="translate(230 15) rotate(-18) scale(0.8) translate(-230 -15)"
            opacity="0.36"
          />
          <path
            d="M252 21 C250 18, 245 18, 244 21 C245 24, 250 24, 252 21 Z"
            transform="translate(248 21) rotate(18) scale(1.02) translate(-248 -21)"
            opacity="0.56"
          />
          <path
            d="M272 16 C270 13, 265 13, 264 16 C265 19, 270 19, 272 16 Z"
            transform="translate(268 16) rotate(-6) scale(0.82) translate(-268 -16)"
            opacity="0.4"
          />
          <path
            d="M292 20 C290 17, 285 17, 284 20 C285 23, 290 23, 292 20 Z"
            transform="translate(288 20) rotate(-12) scale(0.98) translate(-288 -20)"
            opacity="0.52"
          />

          {/* 흩날림 */}
          <path
            d="M66 7 C64 5, 61 5, 60 7 C61 9, 64 9, 66 7 Z"
            transform="translate(63 7) rotate(26) scale(0.55) translate(-63 -7)"
            opacity="0.14"
          />
          <path
            d="M244 8 C242 6, 239 6, 238 8 C239 10, 242 10, 244 8 Z"
            transform="translate(241 8) rotate(-18) scale(0.55) translate(-241 -8)"
            opacity="0.14"
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
            <p>나는 오래된 거리처럼 너를 사랑하고</p>
            <p>별들은 벌들처럼 웅성거리고</p>
          </div>

          <div className="inv-content">
            <p>여름에는 작은 은색 드럼을 치는 것처럼</p>
            <p>네 손바닥을 두드리는 비를 줄게</p>
            <p>과거에게 그랬듯 미래에게도 아첨하지 않을게</p>
          </div>

          <div className="inv-content">
            <p>어린 시절 순결한 비누 거품 속에서 우리가 했던 맹세들을 찾아</p>
            <p>너의 팔에 모두 적어줄게</p>
          </div>

          <div className="inv-content poet">
            <p>진은영, &lt;청혼&gt; 중</p>
          </div>
        </div>

        {/* divider line */}
        <LeafDivider />

        {/* 2. 우리 초대글 */}
        <div className="invitation-text-block our-message-section">
          <div className="inv-content">
            <p>오래된 거리처럼 익숙하지만,</p>
            <p>여름비도 즐겁게 맞고,</p>
            <p>시간의 흐름에 기대지 않고 서로에게 최선을 다하며,</p>
            <p>어린 시절 순수한 마음으로 서로를 대하는 부부가 되고자 합니다.</p>
            <p>이 시작을 함께해 주신다면 더없이 감사하겠습니다.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
