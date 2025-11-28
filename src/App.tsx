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

  const finishIntro = () => {
    sessionStorage.setItem("introDismissed", "true");
    setShowIntro(false);
  };

  return (
    <ContactInfoProvider>
      <HashRouter basename="/">
        <Routes>
          <Route
            path="/"
            element={
              showIntro ? (
                <IntroCard onFinish={finishIntro} />
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
