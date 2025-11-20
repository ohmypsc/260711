import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // 👈 확장자 제거 재시도
import "./App.scss";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
