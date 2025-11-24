import React, { useEffect, useRef } from 'react';
import './Location.scss';

// === 맵 정보 변수 (실제 결혼식장 정보로 변경하세요!) ===
// NOTE: 이 정보는 .env.development 파일에 설정된 값을 기준으로 해야 합니다.
const DEST_NAME = "유성컨벤션웨딩홀"; // Cover.tsx에 설정된 장소명과 일치시킴
const DEST_LAT = 36.368316; // 예시: 유성컨벤션 실제 위도 (대전광역시 유성구 엑스포로 324)
const DEST_LNG = 127.387123; // 예시: 유성컨벤션 실제 경도
// ===============================================

// 환경 변수에서 키를 가져옵니다.
// NOTE: VITE_KAKAO_SDK_JS_KEY는 Canvas 환경에서 자동으로 제공되므로 실제 코드는 빈 문자열로 둡니다.
const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_SDK_JS_KEY || ""; 

export const Location = () => {
  // 지도가 렌더링될 DOM 요소를 참조하기 위해 useRef 사용
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // API 키가 없으면 지도 로드 시도 중단
    if (!KAKAO_API_KEY) {
      console.error("카카오 지도 API 키가 설정되지 않았습니다. VITE_KAKAO_SDK_JS_KEY를 확인하세요.");
      return;
    }

    // 1. 카카오 지도 SDK 스크립트 로드
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    // 2. 스크립트 로드가 완료되면 지도 초기화
    script.onload = () => {
      window.kakao.maps.load(() => {
        if (mapRef.current) {
          const center = new window.kakao.maps.LatLng(DEST_LAT, DEST_LNG);
          
          const mapOptions = {
            center: center,
            level: 3, // 지도의 확대 레벨 (작을수록 확대)
          };

          // 지도를 mapRef가 참조하는 DOM 요소에 생성
          const map = new window.kakao.maps.Map(mapRef.current, mapOptions);

          // 마커 추가
          const marker = new window.kakao.maps.Marker({
            position: center,
            // 마커 이미지를 커버에서 사용된 다이아몬드 스타일과 유사하게 설정 (선택 사항)
            image: new window.kakao.maps.MarkerImage(
                'https://placehold.co/30x30/ff8c94/ffffff?text=♥', // 로즈골드 테마 마커
                new window.kakao.maps.Size(30, 30),
                { offset: new window.kakao.maps.Point(15, 30) }
            )
          });
          marker.setMap(map);
        }
      });
    };

    // 3. 컴포넌트 언마운트 시 스크립트 제거
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // === 길 찾기 버튼 핸들러 함수 ===
  
  // 1. 네이버 지도
  const handleNaverMap = () => {
    const url = `nmap://route/walk?dlat=${DEST_LAT}&dlng=${DEST_LNG}&dname=${DEST_NAME}&appname=wedding-invitation-app`;
    const fallbackUrl = `https://map.naver.com/v5/directions/transit?menu=route&eText=${DEST_NAME},${DEST_LAT},${DEST_LNG}`;
    
    window.location.href = url;
    setTimeout(() => {
      // 앱으로의 이동 실패 시 웹으로 이동
      if (document.hidden) return; // 이미 앱으로 이동했으면 실행 X
      window.location.href = fallbackUrl;
    }, 500);
  };

  // 2. 카카오내비
  const handleKakaoNavi = () => {
    // X=경도, Y=위도 순서 주의
    const url = `kakaonavi://route?name=${encodeURIComponent(DEST_NAME)}&x=${DEST_LNG}&y=${DEST_LAT}&coordtype=wgs84&byPass=YES`;
    window.location.href = url;
  };

  // 3. T맵
  const handleTMap = () => {
    // goalx=경도, goaly=위도 순서 주의
    const url = `tmap://route?goalname=${encodeURIComponent(DEST_NAME)}&goalx=${DEST_LNG}&goaly=${DEST_LAT}`;
    window.location.href = url;
  };

  // 4. 지도 텍스트 복사 기능
  const handleCopyAddress = () => {
    const address = "대전광역시 유성구 엑스포로 324, 유성컨벤션웨딩홀 3층 그랜드홀";
    navigator.clipboard.writeText(address).then(() => {
        alert("주소가 복사되었습니다!"); // Custom modal로 대체해야 함
    }).catch(err => {
        console.error('클립보드 복사 실패:', err);
        alert("복사에 실패했습니다."); // Custom modal로 대체해야 함
    });
  };
  // ===============================================

  return (
    <div className="location-container">
      <h2 className="section-title">오시는 길</h2>
      
      {/* 맵이 표시될 영역 */}
      <div 
        ref={mapRef} 
        className="map-area"
      />
      
      {/* 길 찾기 버튼 영역 */}
      <div className="navi-buttons-wrapper">
        <button onClick={handleNaverMap} className="navi-button naver">
          <i className="fas fa-map-marker-alt"></i> 네이버 지도
        </button>
        <button onClick={handleKakaoNavi} className="navi-button kakao">
          <i className="fas fa-car"></i> 카카오내비
        </button>
        <button onClick={handleTMap} className="navi-button tmap">
          <i className="fas fa-car-side"></i> T맵
        </button>
      </div>

      {/* 상세 주소 및 교통 정보 */}
      <div className="location-details">
          <h3>📍 {DEST_NAME}</h3>
          <p className="address-text">
            대전광역시 유성구 엑스포로 324 (3층 그랜드홀)
            <button className="copy-button" onClick={handleCopyAddress}>복사</button>
          </p>

          <div className="transport-info">
            <h4>🚌 대중교통 이용 시</h4>
            <ul>
                <li>**지하철:** 1호선 현충원역 하차 후 셔틀버스 또는 택시 이용</li>
                <li>**시내버스:** 604, 705, 911번 (유성컨벤션센터 정류장 하차)</li>
            </ul>

            <h4>🚗 자가용 이용 시</h4>
            <ul>
                <li>**주차장:** 컨벤션 전용 지하/지상 주차장 이용 (약 500대 수용)</li>
                <li>**주차권:** 2시간 무료 주차권을 제공해 드립니다.</li>
            </ul>
          </div>
      </div>
    </div>
  );
};

// 전역 객체인 window에 kakao 객체 타입을 정의하여 TypeScript 에러 방지
declare global {
  interface Window {
    kakao: any; 
  }
}
