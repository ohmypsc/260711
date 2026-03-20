
import { useEffect } from "react";

// 타입스크립트 에러 방지용 (window.Kakao를 인식하게 해줌)
declare global {
  interface Window {
    Kakao: any;
  }
}

export function KakaoShareButton() {
  // 📌 실제 배포되는 청첩장 주소
  const shareUrl = "https://ohmypsc.github.io/260711"; 

  useEffect(() => {
    // 📌 JavaScript 키
    const kakaoKey = "6ecff07206bf3f8f77556e289c7006d0"; 
    
    // 카카오 SDK 초기화 (한 번만 실행되도록 체크)
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(kakaoKey);
    }
  }, []);

  const handleShare = () => {
    if (window.Kakao) {
      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: "백승철 ❤️ 오미영 결혼합니다",
          description: "2026년 7월 11일 토요일 오전 11시\n대전 유성컨벤션웨딩홀",
          imageUrl: "https://ohmypsc.github.io/260711/thumbnail.jpg", 
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: "청첩장 보러 가기",
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      });
    }
  };

  return (
    <button
      onClick={handleShare}
      style={{
        /* --- 기본 버튼 초기화 --- */
        WebkitAppearance: "none",
        appearance: "none",
        WebkitTapHighlightColor: "transparent",
        userSelect: "none",
        border: "none",
        outline: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px", // 아이콘과 글자 간격
        fontFamily: '"Gowun Batang", serif', // 고운바탕체 적용

        /* --- BASIC 무드 기반 디자인 (카카오 포인트 가미) --- */
        width: "100%",
        maxWidth: "320px",
        margin: "0 auto",
        minHeight: "58px",
        padding: "1rem 1.6rem",
        borderRadius: "999px", // 완전 둥근 형태
        fontSize: "1rem",
        fontWeight: "700",
        letterSpacing: "0.04em",
        
        // 🌟 1. 카카오 느낌을 은은하게 내는 부드러운 노란색 그라데이션
        background: "linear-gradient(180deg, #FFFDE0 0%, #FFFAF0 100%)",
        
        // 🌟 2. 가독성과 브랜드 정체성을 위한 카카오 공식 갈색 텍스트
        color: "#3A1D1D", 
        
        // 청첩장 무드용 내부 프레임(box-shadow)과 외부 테두리
        boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0, 0, 0, 0.05)",
        border: "1px solid #E0D4C8",
        
        transition: "transform 0.14s ease",
      }}
      // 클릭 시 살짝 눌리는 효과
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {/* 🌟 3. 아이콘 색상도 갈색으로 통일하여 정체성 강화 */}
      <span style={{ color: "#3A1D1D", fontSize: "1.1em", display: "flex" }}>
        <i className="fa-solid fa-comment"></i>
      </span>
      
      {/* 버튼 텍스트 (청첩장 서체와 카카오 갈색의 조화) */}
      <span style={{ transform: "translateY(-0.5px)" }}>
        카카오톡으로 공유하기
      </span>
    </button>
  );
}
