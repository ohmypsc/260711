// 📌 MainWeddingPage.tsx
import { useEffect } from "react";

// 배경 효과
import { BgEffect } from "./components/BgEffect/BgEffect";

// 섹션 컴포넌트
import { Cover } from "./components/Cover/Cover";
import { Information } from "./components/Information/Information";

export default function MainWeddingPage() {
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
      {/* 🌸 배경 효과 */}
      <BgEffect />

      <main className="wedding-page">
        
        {/* ⭐ 첫 화면: Cover */}
        <section id="cover">
          <Cover />
        </section>

        {/* ⭐ 두 번째 화면: Information */}
        <section id="information">
          <Information />
        </section>

        {/* ⭐ 앞으로 만들 섹션들이 여기에 추가됨 */}
        {/* <Greeting /> */}
        {/* <InvitationMessage /> */}
        {/* <Schedule /> */}
        {/* <MapSection /> */}
        {/* <Guestbook /> */}
        {/* <Gallery /> */}
        {/* <AttendanceForm /> */}

      </main>
    </>
  );
}
