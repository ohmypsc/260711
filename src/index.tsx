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
   // ✅ (1) 섹션 스크롤 페이드인: 파일 추가 없이 여기서 끝
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main.wedding-page section")
    );

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            observer.unobserve(el); // 한 번만 페이드인
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    sections.forEach((section, i) => {
      section.style.setProperty("--fade-delay", `${i * 0.12}s`);
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  // ✅ (2) 너 기존 줌/제스처 방지 로직 그대로
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
      <main className="wedding-page page-fade">

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
      <BgEffect />
    </>
  );
}
