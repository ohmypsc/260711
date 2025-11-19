import { useEffect } from "react";

// 컴포넌트 import
import { BgEffect } from "./components/BgEffect/BgEffect";
import { Information } from "./components/Information/Information";

// 스타일 import
import "./App.scss";

function App() {
  /** 🔒 iOS/안드로이드 화면 확대 방지 */
  useEffect(() => {
    let lastTouchTime = 0;

    // 300ms 안에 두 번 터치할 경우 확대 방지
    const blockZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchTime < 300) {
        e.preventDefault(); // 확대 트리거 block
      }
      lastTouchTime = now;
    };

    // pinch-zoom 제스처 자체 차단
    const stopGesture = (e: Event) => e.preventDefault();

    // passive: false 로 설정해야 preventDefault 정상 동작
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
      {/* 배경 효과 */}
      <BgEffect />

      <main className="wedding-page">
        <section id="information">
          <Information />
        </section>
      </main>
    </>
  );
}

export default App;
