import { useEffect } from "react";
import "./BgEffect.scss";

export function BgEffect() {
  useEffect(() => {
    const createPetal = () => {
      const petal = document.createElement("div");
      petal.className = "petal";

      // 🌸 로즈골드 컬러 팔레트
      const roseGoldColors = ["#c47b85", "#e8b0a7", "#dba5b7"];

      // 랜덤 위치, 크기
      const size = Math.random() * 0.8 + 0.6; // 0.6 ~ 1.4
      petal.style.left = Math.random() * 100 + "vw";
      petal.style.fontSize = `${size}rem`;
      petal.style.color = roseGoldColors[Math.floor(Math.random() * roseGoldColors.length)];

      // 랜덤 속도 (7~14초)
      const fallDuration = 7 + Math.random() * 7;
      petal.style.animationDuration = `${fallDuration}s`;

      // 랜덤 회전 속도 (6~12초)
      const rotateDuration = 6 + Math.random() * 6;
      petal.style.setProperty("--rotate-duration", `${rotateDuration}s`);

      // 랜덤 수평 이동 범위 (-20vw ~ 20vw)
      const drift = (Math.random() * 40 - 20).toFixed(0);
      petal.style.setProperty("--drift", `${drift}vw`);

      petal.innerText = "🌸";

      document.body.appendChild(petal);

      // 일정 시간 뒤 삭제
      setTimeout(() => {
        petal.remove();
      }, fallDuration * 1000);
    };

    const interval = setInterval(createPetal, 500);
    return () => clearInterval(interval);
  }, []);

  return null;
}
