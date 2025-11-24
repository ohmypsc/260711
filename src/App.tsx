// 📌 App.tsx
import { HashRouter, Routes, Route } from "react-router-dom";

// Provider
import { ContactInfoProvider } from "@/ContactInfoProvider";

// 페이지 컴포넌트
import MainWeddingPage from "@/index";
import {AdminPage} from "@/AdminPage";

// 전역 스타일
import "./App.scss";

export default function App() {
  return (
    <ContactInfoProvider>
      <HashRouter basename="/">
        <Routes>
          <Route path="/" element={<MainWeddingPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </HashRouter>
    </ContactInfoProvider>
  );
}
