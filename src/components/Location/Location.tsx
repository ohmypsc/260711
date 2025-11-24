import React, { useEffect, useRef } from "react";
import "./Location.scss";

// === 맵 정보 변수 (실제 결혼식장 정보로 변경하세요!) ===
const DEST_NAME = "유성컨벤션웨딩홀"; // Cover.tsx에 설정된 장소명과 일치시킴
const DEST_LAT = 36.368316; // 예시: 유성컨벤션 실제 위도 (대전광역시 유성구 엑스포로 324)
const DEST_LNG = 127.387123; // 예시: 유성컨벤션 실제 경도
// 지도 상세 정보에 사용되는 주소
const ADDRESS_TEXT = "대전광역시 유성구 엑스포로 324, 유성컨벤션웨딩홀 3층 그랜드홀";
// ===============================================

// ✅ 네이버 지도 클라이언트 ID (ncpKeyId)
const NAVER_MAP_KEY = import.meta.env.VITE_NAVER_MAP_CLIENT_ID || "";

// ✅ 네이버 지도 SDK를 비동기로 로드하고 로드 상태를 관리하는 함수
function loadNaverMapSdk(key: string) {
  // 이미 로드되었으면 바로 resolve
  if (window.naver && window.naver.maps) return Promise.resolve();
  // 로드 중이면 기존 Promise 반환
  if ((window as any).__naverMapLoadingPromise)
    return (window as any).__naverMapLoadingPromise;

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    // 네이버 지도 SDK URL에 클라이언트 ID를 포함합니다. (ncpClientId 대신 ncpKeyId 사용)
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${key}`;
    script.async = true;

    script.onload = () => {
      if (!window.naver || !window.naver.maps) {
        reject(new Error("네이버 지도 SDK 로드 후 naver 객체가 없음. 클라이언트 ID 또는 도메인 설정을 확인하세요."));
        return;
      }
      resolve();
    };

    script.onerror = () =>
      reject(new Error("네이버 지도 SDK 스크립트 로드 실패"));

    document.head.appendChild(script);
  });

  // 로드 상태를 저장하여 중복 로드를 방지
  (window as any).__naverMapLoadingPromise = promise;
  return promise;
}

// ✅ 현재 사용자 위치를 Promise로 얻어오는 함수
function getUserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("이 브라우저는 위치 정보를 지원하지 않습니다."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => reject(err),
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      }
    );
  });
}

export const Location = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  // 1. 지도 로드 및 초기화 로직
  useEffect(() => {
    if (!NAVER_MAP_KEY) {
      console.error(
        "🚫 VITE_NAVER_MAP_CLIENT_ID가 없습니다. env 파일이나 GitHub 시크릿을 확인하세요."
      );
      return;
    }

    loadNaverMapSdk(NAVER_MAP_KEY)
      .then(() => {
        if (!mapRef.current) return;

        const center = new window.naver.maps.LatLng(DEST_LAT, DEST_LNG);

        const map = new window.naver.maps.Map(mapRef.current, {
          center,
          zoom: 16, // 적절한 확대 레벨
          minZoom: 10,
          zoomControl: true,
          zoomControlOptions: {
            // 컨트롤러 위치 설정
            position: window.naver.maps.Position.TOP_RIGHT,
          },
        });

        // 마커 추가
        new window.naver.maps.Marker({
          position: center,
          map,
          title: DEST_NAME,
        });
      })
      .catch((err) => console.error("네이버 지도 초기화 오류:", err));
  }, []);

  // =========================
  // ✅ 길찾기 버튼 핸들러들 (Geolocation 포함)
  // =========================

  // 1) 네이버 지도 (앱 → 웹 fallback, 출발지 자동)
  const handleNaverMap = async () => {
    try {
      const { lat, lng } = await getUserLocation();

      // 앱 스킴 (출발지 sname/slat/slng 추가)
      const appUrl = `nmap://route/walk?slat=${lat}&slng=${lng}&sname=${encodeURIComponent(
        "현재 위치"
      )}&dlat=${DEST_LAT}&dlng=${DEST_LNG}&dname=${encodeURIComponent(
        DEST_NAME
      )}&appname=wedding-invitation-app`;

      // 웹 길찾기 (출발지/도착지 좌표와 이름 포함)
      const webUrl = `https://map.naver.com/v5/directions/transit?start=${lng},${lat},${encodeURIComponent(
        "현재 위치"
      )}&destination=${DEST_LNG},${DEST_LAT},${encodeURIComponent(DEST_NAME)}`;

      window.location.href = appUrl;
      setTimeout(() => {
        if (!document.hidden) window.location.href = webUrl;
      }, 500);
    } catch (e) {
      // 위치를 얻지 못하면 목적지만 있는 길찾기
      console.warn("위치 정보 가져오기 실패, 목적지 길찾기 실행:", e);
      
      const appUrl = `nmap://route/walk?dlat=${DEST_LAT}&dlng=${DEST_LNG}&dname=${encodeURIComponent(
        DEST_NAME
      )}&appname=wedding-invitation-app`;

      // 웹 길찾기 (목적지만)
      const webUrl = `https://map.naver.com/v5/directions/transit?destination=${DEST_LNG},${DEST_LAT},${encodeURIComponent(
        DEST_NAME
      )}`;

      window.location.href = appUrl;
      setTimeout(() => {
        if (!document.hidden) window.location.href = webUrl;
      }, 500);
    }
  };

  // 2) 카카오내비 (앱 only, 출발지 자동)
  const handleKakaoNavi = async () => {
    try {
      const { lat, lng } = await getUserLocation();
      // sX=출발 경도, sY=출발 위도
      const url = `kakaonavi://navigate?name=${encodeURIComponent(
        DEST_NAME
      )}&x=${DEST_LNG}&y=${DEST_LAT}&sX=${lng}&sY=${lat}&coord_type=wgs84`;
      window.location.href = url;
    } catch (e) {
      // 위치 못 얻으면 목적지만
      console.warn("위치 정보 가져오기 실패, 카카오내비 목적지 길찾기 실행:", e);
      const url = `kakaonavi://navigate?name=${encodeURIComponent(
        DEST_NAME
      )}&x=${DEST_LNG}&y=${DEST_LAT}&coord_type=wgs84`;
      window.location.href = url;
    }
  };

  // 3) T맵 (앱 only, 출발지 자동)
  const handleTMap = async () => {
    try {
      const { lat, lng } = await getUserLocation();
      // startx=출발 경도, starty=출발 위도
      const url = `tmap://route?startx=${lng}&starty=${lat}&startname=${encodeURIComponent(
        "현재 위치"
      )}&goalx=${DEST_LNG}&goaly=${DEST_LAT}&goalname=${encodeURIComponent(
        DEST_NAME
      )}`;
      window.location.href = url;
    } catch (e) {
      // 위치 못 얻으면 목적지만
      console.warn("위치 정보 가져오기 실패, T맵 목적지 길찾기 실행:", e);
      const url = `tmap://route?goalname=${encodeURIComponent(
        DEST_NAME
      )}&goalx=${DEST_LNG}&goaly=${DEST_LAT}`; // goaly를 DEST_LAT로 수정
      window.location.href = url;
    }
  };

  // 4) 주소 복사
  const handleCopyAddress = () => {
    // 🚫 alert() 대신 console.log/error 사용
    navigator.clipboard
      .writeText(ADDRESS_TEXT)
      .then(() => console.log("✅ 주소가 복사되었습니다!"))
      .catch((err) => console.error("❌ 복사에 실패했습니다.", err));
  };

  return (
    <div className="location-container">
      <h2 className="section-title">오시는 길</h2>

      {/* 맵이 표시될 영역 */}
      <div ref={mapRef} className="map-area" />

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
          {ADDRESS_TEXT.split(',')[0]} (3층 그랜드홀)
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

// 전역 객체에 네이버 맵 타입을 정의하여 TypeScript 에러 방지
declare global {
  interface Window {
    naver: any;
    __naverMapLoadingPromise: Promise<void>; // 로딩 상태 관리용
  }
}
