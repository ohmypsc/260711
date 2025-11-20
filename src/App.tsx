// 📌 App.tsx
import { HashRouter, Routes, Route } from "react-router-dom";

// Provider
import { ContactInfoProvider } from "./ContactInfoProvider";

// 페이지 컴포넌트
import MainWeddingPage from "./MainWeddingPage";
import AdminPage from "./AdminPage";

// 전역 스타일
import "./App.scss";

export default function App() {
  return (
    <ContactInfoProvider>
      <HashRouter basename="/">
        <Routes>
          {/* 메인 청첩장 페이지 */}
          <Route path="/" element={<MainWeddingPage />} />

          {/* 관리자 페이지 */}
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </HashRouter>
    </ContactInfoProvider>
  );
}
