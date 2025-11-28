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
    // ✅ 1) 모바일 확대(더블탭/핀치) 방지 - 유지
    // ===============================
    let lastTouchEnd = 0;

    const blockDoubleTapZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    const stopGesture = (e: Event) => e.preventDefault();

    document.addEventListener("touchend", blockDoubleTapZoom, { passive: false });
    document.addEventListener("gesturestart", stopGesture);
    document.addEventListener("gesturechange", stopGesture);
    document.addEventListener("gestureend", stopGesture);

    // ===============================
    // ✅ 2) 섹션 공통 lazy 등장 효과 (트리거 '미리' 켜지게 수정)
    // ===============================
    const targets = document.querySelectorAll("main.wedding-page section");

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
        threshold: 0.01,               // 👈 거의 닿기만 해도 켜짐
        rootMargin: "0px 0px 25% 0px", // 👈 아래에서 25% '미리' 켜짐
      }
    );

    targets.forEach((el) => observer.observe(el));

    // ✅ 첫 화면 섹션(cover 포함)도 자연스러운 페이드인 되게
    requestAnimationFrame(() => {
      targets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9) {
          el.classList.add("lazy-active");
          observer.unobserve(el);
        }
      });
    });

    return () => {
      document.removeEventListener("touchend", blockDoubleTapZoom);
      document.removeEventListener("gesturestart", stopGesture);
      document.removeEventListener("gesturechange", stopGesture);
      document.removeEventListener("gestureend", stopGesture);

      targets.forEach((el) => observer.unobserve(el));
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
