import { useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

// 전역 Provider
import { ContactInfoProvider } from "./ContactInfoProvider";

// 컴포넌트 import
import { BgEffect } from "./components/BgEffect/BgEffect";
import { Information } from "./components/Information/Information";
import AdminPage from "./AdminPage";

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
      {/* 고정 꽃잎 배경 */}
      <BgEffect />

      {/* 메인 섹션 */}
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
    <ContactInfoProvider>
      {/* GitHub Pages 호환 HashRouter */}
      <HashRouter basename="/">
        <Routes>
          {/* 메인 청첩장 페이지 */}
          <Route path="/" element={<MainWeddingPage />} />

          {/* 관리자 페이지 */}
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </HashRouter>
    </ContactInfoProvider>
  );
}
