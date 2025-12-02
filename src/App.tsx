// 📌 App.tsx
import { useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

// Provider
import { ContactInfoProvider } from "@/ContactInfoProvider";

// 페이지 컴포넌트
import MainWeddingPage from "@/index";
import { AdminPage } from "@/AdminPage";
import IntroCard from "@/components/IntroCard";

// 전역 스타일
import "./App.scss";

export default function App() {
  const [showIntro, setShowIntro] = useState(() => {
    return sessionStorage.getItem("introDismissed") !== "true";
  });

  const [introExiting, setIntroExiting] = useState(false);

  // ✅ IntroCard의 COVER_TIME과 반드시 같은 값
  const COVER_TIME = 2000;

  // ✅ onFinish 받은 뒤, 꽃잎 내려오는 시간까지 더 유지
  const EXIT_AFTER = 2300 + COVER_TIME;

  const finishIntro = () => {
    sessionStorage.setItem("introDismissed", "true");

    // 1) 메인 페이지를 뒤에서 먼저 렌더링 시작
    setIntroExiting(true);

    // 2) 꽃잎 연출 끝날 즈음 인트로 완전 제거
    setTimeout(() => {
      setShowIntro(false);
      setIntroExiting(false);
    }, EXIT_AFTER);
  };

  return (
    <ContactInfoProvider>
      <HashRouter basename="/">
        <Routes>
          <Route
            path="/"
            element={
              showIntro ? (
                <>
                  {/* ✅ 꽃잎으로 덮이는 동안 메인페이지를 뒤에서 렌더링 */}
                  {introExiting && <MainWeddingPage />}

                  <IntroCard onFinish={finishIntro} exiting={introExiting} />
                </>
              ) : (
                <MainWeddingPage />
              )
            }
          />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </HashRouter>
    </ContactInfoProvider>
  );
}
