// 📌 App.tsx
import { useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

// Provider
import { ContactInfoProvider } from "@/ContactInfoProvider";

// 페이지 컴포넌트
import MainWeddingPage from "@/index";
import { AdminPage } from "@/AdminPage";
import IntroCard from "@/components/IntroCard"; // ✅ 추가

// 전역 스타일
import "./App.scss";

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <ContactInfoProvider>
      <HashRouter basename="/">
        <Routes>
          <Route
            path="/"
            element={
              showIntro ? (
                <IntroCard onFinish={() => setShowIntro(false)} />
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
