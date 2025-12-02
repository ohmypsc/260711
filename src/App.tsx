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
  // ✅ 같은 탭(세션)에서 인트로를 한 번 넘겼으면 다시 안 뜨게
  const [showIntro, setShowIntro] = useState(() => {
    return sessionStorage.getItem("introDismissed") !== "true";
  });

  // ✅ "꽃잎이 덮는 동안" 메인을 먼저 깔아두기 위한 상태
  const [introExiting, setIntroExiting] = useState(false);

  const finishIntro = () => {
    sessionStorage.setItem("introDismissed", "true");

    // 1) 메인 페이지를 뒤에서 먼저 렌더링 시작
    setIntroExiting(true);

    // 2) 꽃잎이 내려오는 연출이 끝날 즈음 인트로 완전 제거
    setTimeout(() => {
      setShowIntro(false);
      setIntroExiting(false);
    }, 2300);
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

                  {/* ✅ exiting 상태를 IntroCard에 전달 */}
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
