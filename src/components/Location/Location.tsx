import React, { useEffect, useRef } from "react";
import "./Location.scss";

// ✅ 유성컨벤션 실제 정보
const DEST_NAME = "유성컨벤션웨딩홀 3층 그랜드홀";
const DEST_LAT = 36.3562313;  // 위도
const DEST_LNG = 127.3514617; // 경도
const ADDRESS_TEXT = "대전 유성구 온천북로 77, 유성컨벤션웨딩홀 3층 그랜드홀";

// ✅ 네이버 지도 클라이언트 ID (ncpClientId)
const NAVER_MAP_CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID || "";

/**
 * ✅ 네이버 지도 SDK를 "callback 방식"으로 1번만 안전하게 로드
 * - StrictMode / 중복 렌더에도 안전
 * - SDK 준비 완료 후에만 resolve
 */
function loadNaverMapSdk(clientId: string) {
  if (window.naver?.maps) return Promise.resolve();

  if ((window as any).__naverMapLoadingPromise) {
    return (window as any).__naverMapLoadingPromise as Promise<void>;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const CALLBACK_NAME = "__naverMapInitCallback";

    // 이미 콜백이 세팅돼 있으면 덮어쓰기 방지
    (window as any)[CALLBACK_NAME] = () => {
      resolve();
      delete (window as any)[CALLBACK_NAME];
    };

    const script = document.createElement("script");
    script.async = true;
    script.defer = true;

    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&callback=${CALLBACK_NAME}`;

    script.onerror = () => {
      reject(new Error("네이버 지도 SDK 스크립트 로드 실패"));
      delete (window as any)[CALLBACK_NAME];
    };

    document.head.appendChild(script);
  });

  (window as any).__naverMapLoadingPromise = promise;
  return promise;
}

export const Location = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!NAVER_MAP_CLIENT_ID) {
      console.error(
        "🚫 VITE_NAVER_MAP_CLIENT_ID가 없습니다. GitHub 시크릿/.env.production을 확인하세요."
      );
      return;
    }

    let map: any = null;

    loadNaverMapSdk(NAVER_MAP_CLIENT_ID)
      .then(() => {
        if (!mapRef.current) return;

        const center = new window.naver.maps.LatLng(DEST_LAT, DEST_LNG);

        map = new window.naver.maps.Map(mapRef.current, {
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

    // (선택) 언마운트 시 정리
    return () => {
      map = null;
    };
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
          대전 유성구 온천북로 77
          <button className="copy-button" onClick={handleCopyAddress}>
            복사
          </button>
        </p>

        <div className="transport-info">
          <h4>🚌 대중교통 이용 시</h4>
          <ul>
            <li>
              <strong>지하철:</strong> 1호선 현충원역 하차 후 택시/도보 이동
            </li>
            <li>
              <strong>시내버스:</strong> 유성컨벤션 인근 정류장 하차 후 도보 이동
            </li>
          </ul>

          <h4>🚗 자가용 이용 시</h4>
          <ul>
            <li>
              <strong>주차장:</strong> 컨벤션 전용 주차장 이용
            </li>
            <li>
              <strong>주차권:</strong> 예식장 무료 주차 제공
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
    __naverMapInitCallback?: () => void;
  }
}
