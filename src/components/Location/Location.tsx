import React, { useEffect, useRef, useState } from "react";
import "./Location.scss";

// ✅ 유성컨벤션 실제 정보
const DEST_NAME = "유성컨벤션웨딩홀 3층 그랜드홀";
const DEST_LAT = 36.3562313;  // 위도
const DEST_LNG = 127.3514617; // 경도
const ADDRESS_TEXT = "대전 유성구 온천북로 77, 유성컨벤션웨딩홀 3층 그랜드홀";

// ✅ 네이버 지도 키 (신규 Maps: ncpKeyId 로드)
const NAVER_MAP_KEY = import.meta.env.VITE_NAVER_MAP_CLIENT_ID || "";

/**
 * ✅ 네이버 지도 SDK callback 방식 로더
 * - 중복 로드 방지
 * - SDK 준비 완료 후에만 resolve
 */
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
      reject(new Error("네이버 지도 SDK 스크립트 로드 실패"));
      delete (window as any)[CALLBACK_NAME];
    };

    document.head.appendChild(script);
  });

  (window as any).__naverMapLoadingPromise = promise;
  return promise;
}

export const Location = () => {
  const mapDomRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // ✅ 기본 잠금 상태
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
            position: window.naver.maps.Position.TOP_RIGHT,
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
    };
  }, []);

  // 잠금/해제 시 옵션만 갱신 (지도 재생성 X)
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

  // 잠금 상태에서 터치하면 안내만
  const handleLockMessage = () => {
    setShowLockMessage(true);
    if (lockMessageTimeout.current) clearTimeout(lockMessageTimeout.current);
    lockMessageTimeout.current = window.setTimeout(
      () => setShowLockMessage(false),
      2000
    );
  };

  // =========================
  // ✅ 길찾기 버튼 (목적지만 자동)
  // =========================

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

  const handleKakaoNavi = () => {
    const url = `kakaonavi://navigate?name=${encodeURIComponent(
      DEST_NAME
    )}&x=${DEST_LNG}&y=${DEST_LAT}&coord_type=wgs84`;
    window.location.href = url;
  };

  const handleTMap = () => {
    const url = `tmap://route?goalname=${encodeURIComponent(
      DEST_NAME
    )}&goalx=${DEST_LNG}&goaly=${DEST_LAT}`;
    window.location.href = url;
  };

  return (
    <div className="location-container">
      {/* ✅ 타이틀 아이콘 제거 */}
      <h2 className="section-title">오시는 길</h2>

      {/* ✅ 지도 + 잠금 UI */}
      <div className="map-wrapper">
        {locked && (
          <div
            className="map-lock-overlay"
            onTouchStart={handleLockMessage}
            onMouseDown={handleLockMessage}
          >
            {showLockMessage && (
              <div className="lock-message">
                <i className="fa-solid fa-lock" /> 지도가 잠겨 있습니다
                <br />
                <span>자물쇠를 눌러 확대/이동하세요</span>
              </div>
            )}
          </div>
        )}

        <button
          className={"map-lock-button" + (locked ? "" : " unlocked")}
          onClick={() => {
            if (lockMessageTimeout.current)
              clearTimeout(lockMessageTimeout.current);
            setShowLockMessage(false);
            setLocked((v) => !v);
          }}
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

      {/* ✅ 길찾기 버튼 */}
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

      {/* ✅ 상세 주소/교통 */}
      <div className="location-details">
        <h3>
          <i className="fa-solid fa-building-columns details-icon" /> {DEST_NAME}
        </h3>

        <p className="address-text">
          <i className="fa-solid fa-location-dot address-icon" />
          대전 유성구 온천북로 77
        </p>

        <div className="transport-info">
          <div>
            <h4>
              <i className="fa-solid fa-bus-simple" /> 대중교통 이용 시
            </h4>
            <ul>
              <li>
                <strong>지하철:</strong> 1호선 현충원역 하차 후 택시/도보 이동
              </li>
              <li>
                <strong>버스:</strong> 유성컨벤션 인근 정류장 하차 후 도보 이동
              </li>
            </ul>
          </div>

          <div>
            <h4>
              <i className="fa-solid fa-square-parking" /> 자가용 이용 시
            </h4>
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
