import { useEffect } from "react";
import "@/components/common/Button/Button.scss";

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
          title: "결혼식에 초대합니다 💍",
          description: "2026.7.11.(토) 11시\n대전 유성컨벤션웨딩홀",
          imageUrl: "https://ohmypsc.github.io/260711/thumbnail.png", 
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
      className="w-btn basic"
      onClick={handleShare}
      style={{
        // 🌟 레이아웃과 크기는 CSS(w-btn basic)를 따르고, 카카오 색상만 덮어씌웁니다.
        background: "linear-gradient(180deg, #FFFDE0 0%, #FFFAF0 100%)",
        color: "#3A1D1D", 
        borderColor: "#E0D4C8",
        gap: "8px", // 아이콘과 글자 간격
      }}
    >
      {/* 아이콘 */}
      <i className="fa-solid fa-comment" style={{ fontSize: "1.1em" }}></i>
      
      {/* 텍스트 (CSS에 정의된 w-btn__label 클래스 사용) */}
      <span className="w-btn__label">
        카카오톡으로 공유하기
      </span>
    </button>
  );
}
