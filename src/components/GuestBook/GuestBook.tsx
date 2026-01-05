/* 📌 전역 변수 기반 포스트잇 보드 디자인 */

.guestbook-wrapper {
  text-align: center;
  font-family: inherit;

  .guestbook__desc {
    margin: 1rem 0 2.5rem;
    line-height: 1.7;
    color: var(--text-main);
    font-size: 0.95rem;
    opacity: 0.85;
  }
}

/* 📌 포스트잇이 붙을 메인 보드 */
.guestbook-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2열 배치 */
  gap: 12px;
  width: 100%;
  padding: 20px 12px;
  background-color: var(--section-bg-soft); /* 보드 배경색 */
  border-radius: 12px;
  min-height: 300px;
}

/* 📌 포스트잇 공통 스타일 */
.guestbook-item {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 22px 14px 14px;
  min-height: 160px;
  box-shadow: 2px 3px 8px var(--shadow-color);
  transition: transform 0.2s ease;

  /* 등장 애니메이션 */
  @keyframes postItPop {
    from { opacity: 0; transform: scale(0.8) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  animation: postItPop 0.4s ease-out forwards;

  /* 📌 상단 마스킹 테이프 효과 */
  &::before {
    content: "";
    position: absolute;
    top: -6px; left: 50%;
    transform: translateX(-50%);
    width: 35px; height: 12px;
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(1px);
    z-index: 2;
  }

  /* 🎨 랜덤 색상 & 회전 배치 (전역 변수 활용) */
  &:nth-child(4n + 1) { 
    background-color: var(--theme-primary-light); /* 샌드 */
    transform: rotate(-2deg); 
  }
  &:nth-child(4n + 2) { 
    background-color: var(--theme-point-pink); /* 핑크 (투명도 조절 권장 시 opacity 추가 가능) */
    transform: rotate(2deg); 
    // 핑크가 너무 진할 경우를 대비해 살짝 부드럽게
    background-color: #EBD3D6; // 전역 핑크의 파스텔톤 버전 (변수 조합)
  }
  &:nth-child(4n + 3) { 
    background-color: var(--theme-accent); /* 웜 그레이/베이지 */
    transform: rotate(-1.5deg); 
  }
  &:nth-child(4n) { 
    background-color: var(--theme-bg); /* 화이트/아이보리 */
    border: 1px solid var(--border-color);
    transform: rotate(1.5deg); 
  }

  /* 🗑️ 삭제 버튼 (터치 최적화) */
  .item-delete-btn {
    position: absolute;
    top: 5px; right: 5px;
    width: 24px; height: 24px;
    display: flex;
    align-items: center; justify-content: center;
    background: transparent;
    border: none;
    color: var(--theme-primary);
    opacity: 0.3;
    font-size: 0.75rem;

    &:active {
      opacity: 1;
      color: var(--theme-error);
    }
  }

  &__head {
    margin-bottom: 8px;
    .name {
      display: block;
      font-size: 0.9rem;
      font-weight: 800;
      color: var(--theme-primary);
    }
    .date {
      font-size: 0.7rem;
      color: var(--text-light);
      opacity: 0.7;
    }
  }

  /* 📌 포스트잇 본문 */
  &__content {
    flex: 1;
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--text-main);
    font-family: "Gowun Batang", serif; /* 고운바탕 적용 */
    text-align: left;
    word-break: break-all;
    
    /* 텍스트가 너무 길어지면 말줄임 (선택 사항) */
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* 터치 시 살짝 들리는 느낌 */
  &:active {
    transform: scale(1.02) rotate(0deg);
    z-index: 10;
  }
}

/* 🕊️ 빈 공간 */
.guestbook-empty {
  grid-column: span 2;
  padding: 4rem 1rem;
  color: var(--text-light);
  font-size: 0.9rem;
  opacity: 0.6;
}

/* 🔢 페이지네이션 (보드 아래 깔끔하게 배치) */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 2.5rem;

  .page-num, .page-nav {
    display: flex;
    align-items: center; justify-content: center;
    min-width: 32px; height: 32px;
    background: var(--theme-bg);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 0.8rem;
    color: var(--text-light);

    &:active {
      background: var(--theme-accent);
    }
    &:disabled { opacity: 0.3; }
  }

  .page-num.current {
    background: var(--theme-primary);
    color: var(--theme-bg);
    border-color: var(--theme-primary);
  }
}

/* 폼 스타일 (입력창 포커스 효과) */
.guestbook-form {
  display: flex;
  flex-direction: column;
  gap: 12px;

  input, textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 0.95rem;
    background: var(--theme-bg);
    font-family: inherit;
    
    &:focus {
      border-color: var(--theme-primary);
      outline: none;
      background: var(--theme-accent);
    }
  }

  textarea {
    height: 8rem;
    resize: none;
  }
}
