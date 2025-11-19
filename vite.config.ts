import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",  // ⭐ Pages + Actions 조합에서 가장 안정적
  plugins: [react()],
});
