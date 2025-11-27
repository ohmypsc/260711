import { useEffect, useRef } from "react";
import "./IntroCard.scss";

type Props = {
  onFinish: () => void;
};

export default function IntroCard({ onFinish }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 애니메이션 관련 ref들
  const petalsRef = useRef<any[]>([]);
  const animationRef = useRef<number | null>(null);
  const petalImgRef = useRef<HTMLImageElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctxRef.current = ctx;

    const petalImg = new Image();
    petalImg.src = "/petal.png";
    petalImgRef.current = petalImg;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const createBurst = () => {
    const petals: any[] = [];
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

    petalsRef.current = petals;
  };

  const draw = () => {
    const ctx = ctxRef.current!;
    const canvas = canvasRef.current!;
    const petalImg = petalImgRef.current!;
    let petals = petalsRef.current;

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
    petalsRef.current = petals;

    if (petals.length > 0) {
      animationRef.current = requestAnimationFrame(draw);
    }
  };

  const handleClick = () => {
    // 혹시 기존 애니메이션 돌고 있으면 정리
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    createBurst();
    draw();
    setTimeout(() => onFinish(), 2600);
  };

  return (
    <div className="intro-wrap">
      {/* ✅ React onClick으로 확실하게 */}
      <div id="inviteCard" className="invite-card" onClick={handleClick}>
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
