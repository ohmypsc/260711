import { useEffect } from "react";

// 현재 실제로 존재하는 컴포넌트만 import
import { BgEffect } from "./components/BgEffect/BgEffect";
import { Information } from "./components/Information/Information";

import "./App.scss";

function App() {
  /** 🔒 화면 확대 방지 */
  useEffect(() => {
    let last = 0;
    const blockZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - last < 300) e.preventDefault();
      last = now;
    };
    const stopGesture = (e: Event) => e.preventDefault();

    document.addEventListener("touchend", blockZoom, false);
    document.addEventListener("gesturestart", stopGesture, false);
    document.addEventListener("gesturechange", stopGesture, false);
    document.addEventListener("gestureend", stopGesture, false);

    return () => {
      document.removeEventListener("touchend", blockZoom);
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

export default App;
