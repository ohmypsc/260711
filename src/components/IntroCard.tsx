import { useEffect, useRef } from "react";
import "./IntroCard.scss";

type Props = {
  onFinish: () => void;
};

export default function IntroCard({ onFinish }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const petalImg = new Image();
    petalImg.src = "/petal.png"; // ✅ public/petal.png

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    let petals: any[] = [];
    let animation: number | null = null;

    function createBurst() {
      petals = [];
      const count = 400;
      const radius = 180;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * radius;
        petals.push({
          x: window.innerWidth / 2 + Math.cos(angle) * r,
          y: window.innerHeight / 2 + Math.sin(angle) * r,
          w: 20 + Math.random() * 12,
          h: 14 + Math.random() * 8,
          xSpeed: (Math.random() - 0.5) * 8,
          ySpeed: (Math.random() - 1.1) * 5,
          rot: Math.random() * 2 * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.25,
          gravity: 0.05 + Math.random() * 0.08,
          opacity: 1,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      petals.forEach((p) => {
        p.x += p.xSpeed;
        p.y += p.ySpeed;
        p.ySpeed += p.gravity;
        p.rot += p.rotSpeed;
        p.opacity -= 0.0035;

        ctx.globalAlpha = Math.max(p.opacity, 0);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.drawImage(petalImg, -p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      petals = petals.filter((p) => p.opacity > 0);
      if (petals.length > 0) animation = requestAnimationFrame(draw);
    }

    const card = cardRef.current!;
    const handleClick = () => {
      if (animation) cancelAnimationFrame(animation);
      createBurst();
      draw();
      setTimeout(() => onFinish(), 2600);
    };

    card.addEventListener("click", handleClick);

    return () => {
      card.removeEventListener("click", handleClick);
      window.removeEventListener("resize", resize);
      if (animation) cancelAnimationFrame(animation);
    };
  }, [onFinish]);

  return (
    <div className="intro-wrap">
      <div ref={cardRef} id="inviteCard" className="invite-card">
        <div className="names">백승철 · 오미영</div>
        <div className="subtitle">결혼합니다</div>

        <div className="info">
          <div className="section">
            <strong>2026년 7월 11일 토요일</strong>
            <br />
            <strong>오전 11시</strong>
          </div>
          <div className="section">
            <strong>유성컨벤션웨딩홀</strong>
            <br />
            <strong>3층 그랜드홀</strong>
          </div>
        </div>

        <div className="footer">
          카드를 눌러서 <br />
          청첩장을 확인해 보세요
        </div>
      </div>

      <canvas ref={canvasRef} className="petal" />
    </div>
  );
}
