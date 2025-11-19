import { useEffect } from "react";
import "./BgEffect.scss";

export function BgEffect() {
  useEffect(() => {
    const petalShapes = ["🌸", "💮", "❀", "✿", "❁"]; // 🌸 랜덤 꽃잎 모양들

    const roseGoldColors = ["#c47b85", "#e8b0a7", "#dba5b7"];

    const createPetal = () => {
      const petal = document.createElement("div");
      petal.className = "petal";

      // 🌸 랜덤 꽃잎 모양 선택
      petal.innerText = petalShapes[Math.floor(Math.random() * petalShapes.length)];

      // 랜덤 위치 & 크기
      const size = Math.random() * 0.9 + 0.6; // 0.6 ~ 1.5 rem
      petal.style.left = Math.random() * 100 + "vw";
      petal.style.fontSize = `${size}rem`;

      // 로즈골드 랜덤 색
      petal.style.color =
        roseGoldColors[Math.floor(Math.random() * roseGoldColors.length)];

      // 낙하 속도 랜덤 (7~14s)
      const fallDuration = 7 + Math.random() * 7;
      petal.style.animationDuration = `${fallDuration}s`;

      // 회전 속도 랜덤 (6~12s)
      const rotateDuration = 6 + Math.random() * 6;
      petal.style.setProperty("--rotate-duration", `${rotateDuration}s`);

      // 수평 드리프트 (-20vw ~ 20vw)
      const drift = (Math.random() * 40 - 20).toFixed(0);
      petal.style.setProperty("--drift", `${drift}vw`);

      document.body.appendChild(petal);

      // 제거
      setTimeout(() => {
        petal.remove();
      }, fallDuration * 1000);
    };

    const interval = setInterval(createPetal, 450);
    return () => clearInterval(interval);
  }, []);

  return null;
}
