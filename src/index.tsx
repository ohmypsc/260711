import { useEffect } from "react";
import { BgEffect } from "@/components/common/BgEffect/BgEffect";
import { Cover } from "@/components/Cover/Cover";
import { Invitation } from "@/components/Invitation/Invitation";
import { Timeline } from "@/components/Timeline/Timeline";
import { Calendar } from "@/components/Calendar/Calendar";
import { Location } from "@/components/Location/Location";
import { Account } from "@/components/Account/Account";
import { Attendance } from "@/components/Attendance/Attendance";
import { GuestBook } from "@/components/GuestBook/GuestBook";
import { PhotoUpload } from "@/components/PhotoUpload/PhotoUpload";

export default function MainWeddingPage() {
  useEffect(() => {
    // ===============================
    // ✅ 1) 확대 방지(더블탭/핀치)
    // - iOS: gesture* 이벤트
    // - Android 포함 전기기: 멀티터치(touches>1) 차단
    // ===============================
    let lastTouchEnd = 0;

    const blockDoubleTapZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) e.preventDefault();
      lastTouchEnd = now;
    };

    const stopGesture = (e: Event) => e.preventDefault(); // iOS pinch zoom 방지

    const blockPinchZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault(); // Android 포함 pinch zoom 방지
    };

    document.addEventListener("touchend", blockDoubleTapZoom, { passive: false });
    document.addEventListener("gesturestart", stopGesture);
    document.addEventListener("gesturechange", stopGesture);
    document.addEventListener("gestureend", stopGesture);

    document.addEventListener("touchstart", blockPinchZoom, { passive: false });
    document.addEventListener("touchmove", blockPinchZoom, { passive: false });

    // ===============================
    // ✅ 2) 섹션 공통 lazy 등장 효과 (모바일 최적화)
    // - MutationObserver 제거(모바일 버벅임 원인)
    // - iOS/모바일 IO 누락 대비 scroll fallback
    // ===============================
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main.wedding-page section")
    );

    const activate = (el: HTMLElement) => {
      if (!el.classList.contains("lazy-active")) {
        el.classList.add("lazy-active");
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activate(entry.target as HTMLElement);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12, // 모바일에서 안정적인 트리거
        rootMargin: "0px 0px 120px 0px", // % 대신 px (iOS 안정)
      }
    );

    sections.forEach((el) => observer.observe(el));

    // ✅ 첫 화면 섹션 즉시 활성화
    const primeFirstView = () => {
      sections.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.95) {
          activate(el);
          observer.unobserve(el);
        }
      });
    };
    primeFirstView();

    // ✅ IO가 놓치는 섹션 대비 fallback (RAF throttle)
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        sections.forEach((el) => {
          if (el.classList.contains("lazy-active")) return;

          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.9) {
            activate(el);
            observer.unobserve(el);
          }
        });

        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // cleanup
    return () => {
      document.removeEventListener("touchend", blockDoubleTapZoom);
      document.removeEventListener("gesturestart", stopGesture);
      document.removeEventListener("gesturechange", stopGesture);
      document.removeEventListener("gestureend", stopGesture);

      document.removeEventListener("touchstart", blockPinchZoom);
      document.removeEventListener("touchmove", blockPinchZoom);

      window.removeEventListener("scroll", onScroll);

      observer.disconnect();
    };
  }, []);

  return (
    <>
      <BgEffect />

      <main className="wedding-page">
        <section id="cover">
          <div className="section-inner">
            <Cover />
          </div>
        </section>

        <section id="invitation">
          <div className="section-inner">
            <Invitation />
          </div>
        </section>

        <section id="timeline">
          <div className="section-inner">
            <Timeline />
          </div>
        </section>

        <section id="calendar">
          <div className="section-inner">
            <Calendar />
          </div>
        </section>

        <section id="location">
          <div className="section-inner">
            <Location />
          </div>
        </section>

        <section id="account">
          <div className="section-inner">
            <Account />
          </div>
        </section>

        <section id="attendance">
          <div className="section-inner">
            <Attendance />
          </div>
        </section>

        <section id="guestbook">
          <div className="section-inner">
            <GuestBook />
          </div>
        </section>

        <section id="photoupload">
          <div className="section-inner">
            <PhotoUpload />
          </div>
        </section>
      </main>
    </>
  );
}
