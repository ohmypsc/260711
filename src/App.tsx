import { useEffect } from "react";
import { BgEffect } from "./components/BgEffect/BgEffect";

import { Cover } from "./components/Cover/Cover";
import { Invitation } from "./components/Invitation/Invitation";
import { Timeline } from "./components/Timeline/Timeline";
import { Calendar } from "./components/Calendar/Calendar";
import { Location } from "./components/Location/Location";
import { Information } from "./components/Information/Information";
import { GuestBook } from "./components/GuestBook/GuestBook";

import AdminPage from "./AdminPage";
import { STATIC_ONLY } from "./env";

function App() {
  /** 모바일 확대 방지 */
  useEffect(() => {
    let last = 0;
    const blockZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - last < 300) e.preventDefault();
      last = now;
    };
    const blockGesture = (e: Event) => e.preventDefault();

    document.addEventListener("touchend", blockZoom);
    document.addEventListener("gesturestart", blockGesture);
    document.addEventListener("gesturechange", blockGesture);
    document.addEventListener("gestureend", blockGesture);

    return () => {
      document.removeEventListener("touchend", blockZoom);
      document.removeEventListener("gesturestart", blockGesture);
      document.removeEventListener("gesturechange", blockGesture);
      document.removeEventListener("gestureend", blockGesture);
    };
  }, []);

  /** GitHub Pages 라우팅 처리 */
  const path = window.location.pathname.replace(import.meta.env.BASE_URL, "");
  if (path.startsWith("admin")) {
    return <AdminPage />;
  }

  return (
    <>
      <BgEffect />

      <main className="wedding-page">
        <section id="cover"><Cover /></section>
        <section id="invitation"><Invitation /></section>
        <section id="timeline"><Timeline /></section>
        <section id="calendar"><Calendar /></section>
        <section id="location"><Location /></section>
        <section id="information">
          <Information />
          {!STATIC_ONLY && <GuestBook />}
        </section>
      </main>
    </>
  );
}

export default App;
