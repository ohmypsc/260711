import { useEffect } from "react";
import { BgEffect } from "@/components/common/BgEffect/BgEffect";
import { Cover } from "@/components/Cover/Cover";
import { Invitation } from "@/components/Invitation/Invitation";
import { Location } from "@/components/Location/Location"; 
import { Information } from "@/components/Information/Information";

export default function MainWeddingPage() {

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

      <section id="location">
          <div className="section-inner">
            <Location />
          </div>
        </section>
        
        <section id="information">
          <div className="section-inner">
            <Information />
          </div>
        </section>

      </main>

      <BgEffect />
      
    </>
  );
}
