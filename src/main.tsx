import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";   // ⭐ 추가
import App from "./App";
import "./App.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    
    <BrowserRouter basename="/mysc">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
