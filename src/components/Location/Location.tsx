import React, { useEffect, useRef, useState } from "react";
import "./Location.scss";

// ✅ 유성컨벤션 실제 정보
const DEST_NAME = "유성컨벤션 3층 그랜드홀";
const DEST_LAT = 36.3562313;  // 위도
const DEST_LNG = 127.3514617; // 경도
const ADDRESS_LINE = "대전 유성구 온천북로 77";

// ✅ 네이버 지도 키 (신규 Maps: ncpKeyId 로드)
const NAVER_MAP_KEY = import.meta.env.VITE_NAVER_MAP_CLIENT_ID || "";

function loadNaverMapSdk(keyId: string) {
  if (window.naver?.maps) return Promise.resolve();
  if ((window as any).__naverMapLoadingPromise)
    return (window as any).__naverMapLoadingPromise as Promise<void>;

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
      reject(new Error("네이버 지도 SDK 스크립트 로드 실패"));
      delete (window as any)[CALLBACK_NAME];
    };

    document.head.appendChild(script);
  });

  (window as any).__naverMapLoadingPromise = promise;
  return promise;
}

function getDevice() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

function openWithFallback(appUrl: string, fallbackUrl: string) {
  const start = Date.now();
  window.location.href = appUrl;

  setTimeout(() => {
    if (document.hidden) return;
    if (Date.now() - start < 1500) window.location.href = fallbackUrl;
  }, 800);
}

export const Location = () => {
  const mapDomRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const [locked, setLocked] = useState(true);
  const [showLockMessage, setShowLockMessage] = useState(false);
  const lockMessageTimeout = useRef<number | null>(null);

  // 지도 초기화 (1회)
  useEffect(() => {
    if (!NAVER_MAP_KEY) {
      console.error("🚫 VITE_NAVER_MAP_CLIENT_ID가 없습니다.");
      return;
    }

    loadNaverMapSdk(NAVER_MAP_KEY)
      .then(() => {
        if (!mapDomRef.current) return;

        const center = new window.naver.maps.LatLng(DEST_LAT, DEST_LNG);

        const map = new window.naver.maps.Map(mapDomRef.current, {
          center,
          zoom: 16,
          minZoom: 10,
          zoomControl: true,
          zoomControlOptions: {
            position: window.naver.maps.Position.TOP_RIGHT, // 줌: 오른쪽 위
          },

          // ✅ 잠금 기본 옵션(스크롤 우선)
          draggable: false,
          scrollWheel: false,
          pinchZoom: false,
          keyboardShortcuts: false,
          disableDoubleTapZoom: true,
        });

        new window.naver.maps.Marker({
          position: center,
          map,
          title: DEST_NAME,
        });

        mapInstanceRef.current = map;
      })
      .catch((err) => console.error("네이버 지도 초기화 오류:", err));

    return () => {
      mapInstanceRef.current = null;
      if (lockMessageTimeout.current) clearTimeout(lockMessageTimeout.current);
    };
  }, []);

  // 잠금/해제 시 옵션만 갱신
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

  // 🔒 잠금 상태에서 터치하면 안내만
  const handleLockMessage = () => {
    setShowLockMessage(true);
    if (lockMessageTimeout.current) clearTimeout(lockMessageTimeout.current);
    lockMessageTimeout.current = window.setTimeout(
      () => setShowLockMessage(false),
      1800
    );
  };

  // ✅ 수동 잠금 토글 (자동 재잠금 없음)
  const toggleLock = () => {
    if (lockMessageTimeout.current) clearTimeout(lockMessageTimeout.current);
    setShowLockMessage(false);
    setLocked((v) => !v);
  };

  // =========================
  // ✅ 길찾기 버튼
  // =========================

  const handleNaverMap = () => {
    const device = getDevice();

    const appUrl = `nmap://route/walk?dlat=${DEST_LAT}&dlng=${DEST_LNG}&dname=${encodeURIComponent(
      DEST_NAME
    )}&appname=wedding-invitation-app`;

    const webUrl = `https://map.naver.com/v5/directions/-/transit/${DEST_LNG},${DEST_LAT},${encodeURIComponent(
      DEST_NAME
    )}`;

    if (device === "ios" || device === "android")
      openWithFallback(appUrl, webUrl);
    else window.open(webUrl, "_blank");
  };

  const handleKakaoNavi = () => {
    const device = getDevice();

    const appUrl = `kakaonavi://navigate?name=${encodeURIComponent(
      DEST_NAME
    )}&x=${DEST_LNG}&y=${DEST_LAT}&coord_type=wgs84`;

    const androidStore =
      "https://play.google.com/store/apps/details?id=com.locnall.KimGiSa";
    const iosStore =
      "https://apps.apple.com/kr/search?term=%EC%B9%B4%EC%B9%B4%EC%98%A4%EB%82%B4%EB%B9%84";

    if (device === "android") openWithFallback(appUrl, androidStore);
    else if (device === "ios") openWithFallback(appUrl, iosStore);
    else alert("모바일에서 이용 가능합니다.");
  };

  const handleTMap = () => {
    const device = getDevice();

    const appUrl = `tmap://route?goalname=${encodeURIComponent(
      DEST_NAME
    )}&goalx=${DEST_LNG}&goaly=${DEST_LAT}`;

    const androidStore =
      "https://play.google.com/store/apps/details?id=com.skt.tmap.ku";
    const iosStore =
      "https://apps.apple.com/kr/app/id431589174";

    if (device === "android") openWithFallback(appUrl, androidStore);
    else if (device === "ios") openWithFallback(appUrl, iosStore);
    else alert("모바일에서 이용 가능합니다.");
  };

  return (
    <div className="location-container">
      <h2 className="section-title">오시는 길</h2>

      {/* 장소/주소 (지도 위) */}
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

      {/* 지도 + 잠금 */}
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
                  스크롤이 편하도록 잠가두었어요.<br />
                  왼쪽 위 자물쇠를 눌러 확대해보세요.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ✅ TOP_LEFT 자물쇠 */}
        <button
          className={"map-lock-button" + (locked ? "" : " unlocked")}
          onClick={toggleLock}
          aria-label="지도 잠금 해제"
        >
          {locked ? (
            <i className="fa-solid fa-lock" />
          ) : (
            <i className="fa-solid fa-lock-open" />
          )}
        </button>

        <div ref={mapDomRef} className="map-area" />
      </div>

      {/* 길찾기 버튼 */}
      <div className="navi-buttons-wrapper">
        <button onClick={handleNaverMap} className="navi-button naver">
          <i className="fa-solid fa-n" /> 네이버 지도
        </button>

        <button onClick={handleKakaoNavi} className="navi-button kakao">
          <i className="fa-solid fa-comment" /> 카카오내비
        </button>

        <button onClick={handleTMap} className="navi-button tmap">
          <i className="fa-solid fa-location-crosshairs" /> T맵
        </button>
      </div>

      {/* 교통 안내 */}
      <div className="transport-info">
        <div>
          <h4>
            <i className="fa-solid fa-bus-simple" /> 대중교통 이용 시
          </h4>
          <ul>
            <li>
              <strong>지하철:</strong> 대전 1호선 ‘유성온천역’ 인근, 역에서 택시 또는 버스 이용 권장
            </li>
            <li>
              <strong>버스:</strong> ‘유성컨벤션센터/유성컨벤션웨딩홀’ 주변 정류장 하차 후 도보 이동
            </li>
          </ul>
        </div>

        <div>
          <h4>
            <i className="fa-solid fa-square-parking" /> 자가용 이용 시
          </h4>
          <ul>
            <li>
              <strong>내비 검색:</strong> ‘유성컨벤션’ 검색 후 안내 경로 이용
            </li>
            <li>
              <strong>주차:</strong> 건물 전용 주차장 이용 가능, 예식장 안내에 따라 무료 주차 제공
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
