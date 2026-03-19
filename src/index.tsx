import { useEffect } from "react";
import { BgEffect } from "@/components/common/BgEffect/BgEffect";
import { FadeIn } from "@/components/common/FadeIn/FadeIn";
import { Cover } from "@/components/Cover/Cover";
import { Timeline } from "@/components/Timeline/Timeline";
import { Calendar } from "@/components/Calendar/Calendar";
import { Location } from "@/components/Location/Location";
import { Account } from "@/components/Account/Account";
import { Attendance } from "@/components/Attendance/Attendance";
import { GuestBook } from "@/components/GuestBook/GuestBook";
// 👇 새로 만든 GuestPhoto 컴포넌트를 불러옵니다. (경로는 실제 폴더 구조에 맞게 확인해 주세요!)
import { GuestPhoto } from "@/components/GuestPhoto/GuestPhoto"; 

export default function MainWeddingPage() {
  useEffect(() => {
    // ===============================
    // ✅ 1) 확대 방지 (유지)
    // ===============================
    let lastTouchEnd = 0;

    const blockDoubleTapZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) e.preventDefault();
      lastTouchEnd = now;
    };

    const stopGesture = (e: Event) => e.preventDefault();

    const blockPinchZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };

    document.addEventListener("touchend", blockDoubleTapZoom, { passive: false });
    document.addEventListener("gesturestart", stopGesture);
    document.addEventListener("gesturechange", stopGesture);
    document.addEventListener("gestureend", stopGesture);
    document.addEventListener("touchstart", blockPinchZoom, { passive: false });
    document.addEventListener("touchmove", blockPinchZoom, { passive: false });

    return () => {
      document.removeEventListener("touchend", blockDoubleTapZoom);
      document.removeEventListener("gesturestart", stopGesture);
      document.removeEventListener("gesturechange", stopGesture);
      document.removeEventListener("gestureend", stopGesture);
      document.removeEventListener("touchstart", blockPinchZoom);
      document.removeEventListener("touchmove", blockPinchZoom);
    };
  }, []);

  return (
    <>
      <BgEffect />

      <main className="wedding-page">
        {/* 1. 초대글 (시 + 문구) */}
        <section id="cover">
          <FadeIn>
            <div className="section-inner">
              <Cover />
            </div>
          </FadeIn>
        </section>

        {/* 2. 연애 타임라인 */}
        <section id="timeline">
          <FadeIn>
            <div className="section-inner">
              <Timeline />
            </div>
          </FadeIn>
        </section>

        {/* 3. 캘린더 */}
        <section id="calendar">
          <FadeIn>
            <div className="section-inner">
              <Calendar />
            </div>
          </FadeIn>
        </section>

        {/* 4. 오시는 길 */}
        <section id="location">
          <FadeIn>
            <div className="section-inner">
              <Location />
            </div>
          </FadeIn>
        </section>

        {/* 5. 마음 전하실 곳 */}
        <section id="account">
          <FadeIn>
            <div className="section-inner">
              <Account />
            </div>
          </FadeIn>
        </section>

        {/* 6. 참석 여부 */}
        <section id="attendance">
          <FadeIn>
            <div className="section-inner">
              <Attendance />
            </div>
          </FadeIn>
        </section>

        {/* 7. 방명록 */}
        <section id="guestbook">
          <FadeIn>
            <div className="section-inner">
              <GuestBook />
            </div>
          </FadeIn>
        </section>

        {/* 👇 8. 사진 공유하기 (여기에 추가했습니다!) */}
        <section id="guest-photo">
          <FadeIn>
            <div className="section-inner">
              <GuestPhoto />
            </div>
          </FadeIn>
        </section>
      </main>
    </>
  );
}
