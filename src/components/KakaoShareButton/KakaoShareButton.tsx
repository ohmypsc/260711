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
    // 📌 여기에 아까 복사하신 JavaScript 키를 붙여넣으세요!
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
          description: "2026년 7월 11일 토요일 오전 11시\n대전 유성컨벤션웨딩홀", // 예식 날짜와 장소 적어주세요
          
          // 📌 1:1 비율의 예쁜 정방형 썸네일 주소 (새로 만들어서 public 폴더에 넣어주세요!)
          imageUrl: "https://ohmypsc.github.io/260711/thumbnail.jpg", 
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: "청첩장 보러 가기", // 버튼에 들어갈 텍스트
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
        backgroundColor: "#FEE500", // 카카오톡 공식 노란색
        color: "#000000",
        border: "none",
        borderRadius: "12px",
        padding: "14px 24px",
        fontSize: "1rem",
        fontWeight: "700",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        width: "100%", // 모바일에서 꽉 차게
        maxWidth: "300px",
        margin: "0 auto",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <i className="fa-solid fa-comment"></i> 카카오톡으로 공유하기
    </button>
  );
}
