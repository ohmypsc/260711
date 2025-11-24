import React, { useEffect, useRef } from "react";
import "./Location.scss";

// === 맵 정보 변수 (실제 결혼식장 정보로 변경하세요!) ===
const DEST_NAME = "유성컨벤션웨딩홀";
const DEST_LAT = 36.368316;
const DEST_LNG = 127.387123;

const ADDRESS_TEXT =
  "대전광역시 유성구 엑스포로 324, 유성컨벤션웨딩홀 3층 그랜드홀";
// ===============================================

// ✅ 네이버 지도 클라이언트 ID (ncpClientId)
const NAVER_MAP_CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID || "";

// ✅ 네이버 지도 SDK 로더 (ncpClientId 기준)
function loadNaverMapSdk(clientId: string) {
  if (window.naver && window.naver.maps) return Promise.resolve();
  if ((window as any).__naverMapLoadingPromise)
    return (window as any).__naverMapLoadingPromise;

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}&autoload=false`;
    script.async = true;

    script.onload = () => {
      if (!window.naver || !window.naver.maps) {
        reject(
          new Error(
            "네이버 지도 SDK 로드 실패: Client ID/도메인 설정을 확인하세요."
          )
        );
        return;
      }
      window.naver.maps.load(() => resolve());
    };

    script.onerror = () =>
      reject(new Error("네이버 지도 SDK 스크립트 로드 실패"));

    document.head.appendChild(script);
  });

  (window as any).__naverMapLoadingPromise = promise;
  return promise;
}

export const Location = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  // 1) 지도 로드/초기화
  useEffect(() => {
    if (!NAVER_MAP_CLIENT_ID) {
      console.error(
        "🚫 VITE_NAVER_MAP_CLIENT_ID가 없습니다. GitHub 시크릿/.env.production을 확인하세요."
      );
      return;
    }

    loadNaverMapSdk(NAVER_MAP_CLIENT_ID)
      .then(() => {
        if (!mapRef.current) return;

        const center = new window.naver.maps.LatLng(DEST_LAT, DEST_LNG);

        const map = new window.naver.maps.Map(mapRef.current, {
          center,
          zoom: 16,
          minZoom: 10,
          zoomControl: true,
          zoomControlOptions: {
            position: window.naver.maps.Position.TOP_RIGHT,
          },
        });

        new window.naver.maps.Marker({
          position: center,
          map,
          title: DEST_NAME,
        });
      })
      .catch((err) => console.error("네이버 지도 초기화 오류:", err));
  }, []);

  // =========================
  // ✅ 길찾기 버튼 (목적지만 자동)
  // =========================

  // 1) 네이버 지도: 앱 우선 → 웹 fallback, 목적지만
  const handleNaverMap = () => {
    const appUrl = `nmap://route/walk?dlat=${DEST_LAT}&dlng=${DEST_LNG}&dname=${encodeURIComponent(
      DEST_NAME
    )}&appname=wedding-invitation-app`;

    const webUrl = `https://map.naver.com/v5/directions/-/transit/${DEST_LNG},${DEST_LAT},${encodeURIComponent(
      DEST_NAME
    )}`;

    window.location.href = appUrl;
    setTimeout(() => {
      if (!document.hidden) window.location.href = webUrl;
    }, 500);
  };

  // 2) 카카오내비: 목적지만 (카카오 JS SDK 불필요)
  const handleKakaoNavi = () => {
    const url = `kakaonavi://navigate?name=${encodeURIComponent(
      DEST_NAME
    )}&x=${DEST_LNG}&y=${DEST_LAT}&coord_type=wgs84`;

    window.location.href = url;
  };

  // 3) T맵: 목적지만
  const handleTMap = () => {
    const url = `tmap://route?goalname=${encodeURIComponent(
      DEST_NAME
    )}&goalx=${DEST_LNG}&goaly=${DEST_LAT}`;

    window.location.href = url;
  };

  // 4) 주소 복사
  const handleCopyAddress = () => {
    navigator.clipboard
      .writeText(ADDRESS_TEXT)
      .then(() => console.log("✅ 주소 복사 완료"))
      .catch((err) => console.error("❌ 주소 복사 실패", err));
  };

  return (
    <div className="location-container">
      <h2 className="section-title">오시는 길</h2>

      {/* 지도 영역 */}
      <div ref={mapRef} className="map-area" />

      {/* 길찾기 버튼 */}
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

      {/* 상세 주소/교통 정보 */}
      <div className="location-details">
        <h3>📍 {DEST_NAME}</h3>

        <p className="address-text">
          {ADDRESS_TEXT.split(",")[0]} (3층 그랜드홀)
          <button className="copy-button" onClick={handleCopyAddress}>
            복사
          </button>
        </p>

        <div className="transport-info">
          <h4>🚌 대중교통 이용 시</h4>
          <ul>
            <li>
              <strong>지하철:</strong> 1호선 현충원역 하차 후 셔틀버스 또는 택시 이용
            </li>
            <li>
              <strong>시내버스:</strong> 604, 705, 911번 (유성컨벤션센터 정류장 하차)
            </li>
          </ul>

          <h4>🚗 자가용 이용 시</h4>
          <ul>
            <li>
              <strong>주차장:</strong> 컨벤션 전용 지하/지상 주차장 이용 (약 500대 수용)
            </li>
            <li>
              <strong>주차권:</strong> 2시간 무료 주차권 제공
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

declare global {
  interface Window {
    naver: any;
    __naverMapLoadingPromise?: Promise<void>;
  }
}
