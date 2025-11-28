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
import { AdminPage } from "./AdminPage";

export default function MainWeddingPage() {
  useEffect(() => {
    // ===============================
    // ✅ 1) 확대 방지(더블탭/핀치) 유지
    // ===============================
    let lastTouchEnd = 0;

    const blockDoubleTapZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault(); // 더블탭일 때만 줌 방지
      }
      lastTouchEnd = now;
    };

    const stopGesture = (e: Event) => e.preventDefault(); // 핀치줌 방지

    document.addEventListener("touchend", blockDoubleTapZoom, { passive: false });
    document.addEventListener("gesturestart", stopGesture);
    document.addEventListener("gesturechange", stopGesture);
    document.addEventListener("gestureend", stopGesture);

    // ===============================
    // ✅ 2) 섹션 공통 lazy 등장 효과 (안 보이는 섹션/대기감 해결 버전)
    // ===============================
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("lazy-active");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        // 너무 일찍 켜져서 "안 보이는 것 같은" 문제 방지 + 대기감도 없음
        threshold: 0.05,
        rootMargin: "0px 0px 10% 0px",
      }
    );

    const observeAllSections = () => {
      document
        .querySelectorAll("main.wedding-page section")
        .forEach((el) => observer.observe(el));
    };

    // 초기 섹션 관찰
    observeAllSections();

    // ✅ 첫 화면 섹션(cover 포함)도 자연스러운 페이드인
    requestAnimationFrame(() => {
      document
        .querySelectorAll("main.wedding-page section")
        .forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.9) {
            el.classList.add("lazy-active");
            observer.unobserve(el);
          }
        });
    });

    // ✅ 나중에 마운트/렌더되는 섹션도 자동 관찰 (특정 섹션만 안 되는 문제 해결)
    const mainEl = document.querySelector("main.wedding-page");
    const mo = new MutationObserver(() => observeAllSections());
    if (mainEl) {
      mo.observe(mainEl, { childList: true, subtree: true });
    }

    // cleanup
    return () => {
      document.removeEventListener("touchend", blockDoubleTapZoom);
      document.removeEventListener("gesturestart", stopGesture);
      document.removeEventListener("gesturechange", stopGesture);
      document.removeEventListener("gestureend", stopGesture);

      observer.disconnect();
      mo.disconnect();
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
