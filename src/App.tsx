import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";   // ⭐ 라우터 추가

// 컴포넌트 import
import { BgEffect } from "./components/BgEffect/BgEffect";
import { Information } from "./components/Information/Information";
import AdminPage from "./AdminPage";  // ⭐ 관리자 페이지 불러오기

// 스타일 import
import "./App.scss";

function MainWeddingPage() {
  /** 🔒 iOS/안드로이드 화면 확대 방지 */
  useEffect(() => {
    let lastTouchTime = 0;

    const blockZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchTime < 300) {
        e.preventDefault();
      }
      lastTouchTime = now;
    };

    const stopGesture = (e: Event) => e.preventDefault();

    document.addEventListener("touchstart", blockZoom, { passive: false });
    document.addEventListener("gesturestart", stopGesture);
    document.addEventListener("gesturechange", stopGesture);
    document.addEventListener("gestureend", stopGesture);

    return () => {
      document.removeEventListener("touchstart", blockZoom);
      document.removeEventListener("gesturestart", stopGesture);
      document.removeEventListener("gesturechange", stopGesture);
      document.removeEventListener("gestureend", stopGesture);
    };
  }, []);

  return (
    <>
      <BgEffect />

      <main className="wedding-page">
        <section id="information">
          <Information />
        </section>
      </main>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ⭐ 메인 청첩장 페이지 */}
      <Route path="/" element={<MainWeddingPage />} />

      {/* ⭐ 관리자 페이지 */}
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}
