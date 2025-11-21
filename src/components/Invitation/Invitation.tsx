import React from 'react';
import './Invitation.scss'; 

export function Invitation(): JSX.Element {
  return (
    <section className="invitation">
      <div className="section-inner">
        
        <h2 className="section-title">모시는 글</h2>

        {/* 제목과 내용 사이의 큰 여백을 위한 요소 */}
        <div className="break" aria-hidden="true" />

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
            진은영, &lt;청혼&gt; 중
          </div>
        </div>

        <div className="divider-line parent-line">
  <svg viewBox="0 0 320 28">
    <path
      d="M5 14 C80 2, 240 26, 315 14"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeDasharray="2 3"
      fill="none"
    />

    <circle cx="70" cy="11" r="1.2" fill="currentColor" />
    <circle cx="140" cy="17" r="1.2" fill="currentColor" />
    <circle cx="240" cy="12" r="1.2" fill="currentColor" />

    <rect x="105" y="9" width="2.4" height="2.4" fill="currentColor" transform="rotate(45 106 10)" />
    <rect x="185" y="12" width="2.4" height="2.4" fill="currentColor" transform="rotate(45 186 13)" />
    <rect x="275" y="10" width="2.4" height="2.4" fill="currentColor" transform="rotate(45 276 11)" />
  </svg>
</div>


        <div className="invitation-text-block our-message-section">
          <div className="inv-content">
            <p>오래된 거리처럼 익숙하지만,</p>
            <p>여름비도 즐겁게 맞고,</p>
            <p>시간의 흐름에 기대지 않고 서로에게 최선을 다하며,</p>
            <p>어린 시절 순수한 마음으로 서로를 대하는 부부가 되고자 합니다.</p>
            <p className="last-line">이 시작을 함께해 주신다면 더없이 감사하겠습니다.</p>
          </div>
        </div>
        
      </div>
    </section>
  );
}
