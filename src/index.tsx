import { useEffect } from "react";

// BgEffect는 common 안에 있음
import { BgEffect } from "@/components/common/BgEffect/BgEffect";

import { Cover } from "@/components/Cover/Cover";
import { Information } from "@/components/Information/Information";

export default function MainWeddingPage() {
  // 모바일 더블터치 확대 방지
  useEffect(() => {
    let lastTouchTime = 0;

    const blockZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchTime < 300) e.preventDefault();
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
        
        {/* Cover */}
        <section id="cover">
          <div className="section-inner">
            <Cover />
          </div>
        </section>

        {/* Information */}
        <section id="information">
          <div className="section-inner">
            <Information />
          </div>
        </section>

      </main>
    </>
  );
}
