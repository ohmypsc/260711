import React, { useEffect, useRef, useState } from "react";
import "./Location.scss";

// ✅ 로고 이미지 Import
import kakaoMapLogo from "@/image/kakaomap.png";
import naverMapLogo from "@/image/navermap.png";
import tmapLogo from "@/image/tmap.png";

// ✅ 장소 정보 설정
const DEST_NAME = "유성컨벤션웨딩홀"; // 검색 정확도를 위해 '3층...' 제외하고 건물명만 추천
const DEST_LAT = 36.3562313;
const DEST_LNG = 127.3514617;
const ADDRESS_LINE = "대전 유성구 온천북로 77";

const NAVER_MAP_KEY = import.meta.env.VITE_NAVER_MAP_CLIENT_ID || "";

// 네이버 지도 SDK 로드 함수
function loadNaverMapSdk(keyId: string) {
  if (window.naver?.maps) return Promise.resolve();
  if ((window as any).__naverMapLoadingPromise) {
    return (window as any).__naverMapLoadingPromise as Promise<void>;
  }
  const promise = new Promise<void>((resolve, reject) => {
    const CALLBACK_NAME = "__naverMapInitCallback";
    (window as any)[CALLBACK_NAME] = () => {
      resolve();
      delete (window as any)[CALLBACK_NAME];
    };
    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${keyId}&callback=${CALLBACK_NAME}`;
    script.onerror = () => {
      reject(new Error("Naver Map SDK Load Failed"));
      delete (window as any)[CALLBACK_NAME];
    };
    document.head.appendChild(script);
  });
  (window as any).__naverMapLoadingPromise = promise;
  return promise;
}

// 기기 환경 감지 함수
function getDevice() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

export const Location = () => {
  const mapDomRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const [locked, setLocked] = useState(true);
  const [showLockMessage, setShowLockMessage] = useState(false);
  const lockMessageTimeout = useRef<number | null>(null);

  // 1. 지도 초기화
  useEffect(() => {
    if (!NAVER_MAP_KEY) return;

    loadNaverMapSdk(NAVER_MAP_KEY)
      .then(() => {
        if (!mapDomRef.current) return;

        const center = new window.naver.maps.LatLng(DEST_LAT, DEST_LNG);
        const map = new window.naver.maps.Map(mapDomRef.current, {
          center,
          zoom: 16,
          minZoom: 10,
          scaleControl: false,
          logoControl: false,
          mapDataControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: window.naver.maps.Position.TOP_RIGHT,
          },
          draggable: false,
          scrollWheel: false,
          pinchZoom: false,
          disableDoubleTapZoom: true,
        });

        new window.naver.maps.Marker({
          position: center,
          map,
          title: DEST_NAME,
        });

        mapInstanceRef.current = map;
      })
      .catch(console.error);
  }, []);

  // 2. 잠금/해제 상태 반영
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setOptions({
      draggable: !locked,
      scrollWheel: !locked,
      pinchZoom: !locked,
      disableDoubleTapZoom: locked,
    });
  }, [locked]);

  // 잠금 메시지 핸들러
  const handleLockMessage = () => {
    setShowLockMessage(true);
    if (lockMessageTimeout.current) clearTimeout(lockMessageTimeout.current);
    lockMessageTimeout.current = window.setTimeout(
      () => setShowLockMessage(false),
      1800
    );
  };

  const toggleLock = () => {
    setShowLockMessage(false);
    setLocked((prev) => !prev);
  };

  /* ============================================================
     🚀 길찾기 로직 (앱 미설치 시 -> 모바일 웹으로 연결)
     ============================================================ */

  // 🟢 네이버 지도 연결
  const handleNaverMap = () => {
    const device = getDevice();
    const encodedName = encodeURIComponent(DEST_NAME);
    
    // 모바일 웹 URL (앱 없을 때 이동할 곳)
    const webUrl = `https://m.map.naver.com/route/index.nhn?name=${encodedName}&ex=${DEST_LNG}&ey=${DEST_LAT}&pathType=0&showMap=true`;

    if (device === "android") {
      // Android Intent: 앱 없으면 자동으로 webUrl로 이동 (S.browser_fallback_url)
      const intentUrl = `intent://route?dlat=${DEST_LAT}&dlng=${DEST_LNG}&dname=${encodedName}&appname=wedding-invitation#Intent;scheme=nmap;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.nhn.android.nmap;S.browser_fallback_url=${encodeURIComponent(webUrl)};end`;
      window.location.href = intentUrl;
    } else if (device === "ios") {
      // iOS: 앱 실행 시도 -> 실패 시 웹으로 이동
      const appUrl = `nmap://route/public?dlat=${DEST_LAT}&dlng=${DEST_LNG}&dname=${encodedName}`;
      const start = Date.now();
      window.location.href = appUrl;
      
      setTimeout(() => {
        if (Date.now() - start < 2500) {
            window.location.href = webUrl;
        }
      }, 1500);
    } else {
      // PC
      window.open(`https://map.naver.com/v5/directions/-/transit/${DEST_LNG},${DEST_LAT},${encodedName}`, "_blank");
    }
  };

  // 🟡 카카오맵 연결
  const handleKakaoMap = () => {
    const device = getDevice();
    
    // 모바일 웹 URL
    const webUrl = `https://map.kakao.com/link/to/${encodeURIComponent(DEST_NAME)},${DEST_LAT},${DEST_LNG}`;

    if (device === "android") {
      const intentUrl = `intent://look?p=${DEST_LAT},${DEST_LNG}#Intent;scheme=kakaomap;package=net.daum.android.map;S.browser_fallback_url=${encodeURIComponent(webUrl)};end`;
      window.location.href = intentUrl;
    } else if (device === "ios") {
      const appUrl = `kakaomap://look?p=${DEST_LAT},${DEST_LNG}`;
      const start = Date.now();
      window.location.href = appUrl;

      setTimeout(() => {
        if (Date.now() - start < 2500) {
          window.location.href = webUrl;
        }
      }, 1500);
    } else {
      window.open(webUrl, "_blank");
    }
  };

  // 🔴 티맵 연결 (티맵은 웹 길찾기가 없어서 스토어로 보냄)
  const handleTMap = () => {
    const device = getDevice();
    const appUrl = `tmap://route?goalname=${encodeURIComponent(DEST_NAME)}&goalx=${DEST_LNG}&goaly=${DEST_LAT}`;
    
    const storeUrl = device === "android" 
      ? "market://details?id=com.skt.tmap.ku" 
      : "https://apps.apple.com/app/id431589174";

    if (device === "other") {
      alert("모바일에서 이용 가능합니다.");
      return;
    }

    // 안드로이드/iOS 모두 앱 실행 시도 후 스토어 이동
    const start = Date.now();
    window.location.href = appUrl;
    setTimeout(() => {
      if (Date.now() - start < 2500) window.location.href = storeUrl;
    }, 1500);
  };

  return (
    <div className="location-container">
      <h2 className="section-title">오시는 길</h2>

      <div className="venue-info">
        <div className="venue-name">
          <i className="fa-solid fa-building-columns" />
          {DEST_NAME}
        </div>
        <div className="venue-address">
          <i className="fa-solid fa-location-dot" />
          {ADDRESS_LINE}
        </div>
      </div>

      <div className="map-wrapper">
        {locked && (
          <div
            className="map-lock-overlay"
            onTouchStart={handleLockMessage}
            onMouseDown={handleLockMessage}
          >
            {showLockMessage && (
              <div className="lock-message">
                <div className="lock-message-title">
                  <i className="fa-solid fa-lock" /> 지도 잠금 중
                </div>
                <div className="lock-message-sub">
                  확대/축소하시려면
                  <br />
                  왼쪽 위 자물쇠를 눌러 주세요.
                </div>
              </div>
            )}
          </div>
        )}

        <button
          className={"map-lock-button" + (locked ? "" : " unlocked")}
          onClick={toggleLock}
          aria-label="지도 잠금 해제"
        >
          {locked ? <i className="fa-solid fa-lock" /> : <i className="fa-solid fa-lock-open" />}
        </button>

        <div ref={mapDomRef} className="map-area" />
      </div>

      <div className="navi-buttons-wrapper">
        <button onClick={handleNaverMap} className="navi-button naver">
          <img className="navi-logo naver" src={naverMapLogo} alt="" aria-hidden />
          <span>네이버지도</span>
        </button>

        <button onClick={handleKakaoMap} className="navi-button kakao">
          <img className="navi-logo kakao" src={kakaoMapLogo} alt="" aria-hidden />
          <span>카카오맵</span>
        </button>

        <button onClick={handleTMap} className="navi-button tmap">
          <img className="navi-logo tmap" src={tmapLogo} alt="" aria-hidden />
          <span>티맵</span>
        </button>
      </div>
    </div>
  );
};

export {};

declare global {
  interface Window {
    naver: any;
    __naverMapLoadingPromise?: Promise<void>;
    __naverMapInitCallback?: () => void;
  }
}
