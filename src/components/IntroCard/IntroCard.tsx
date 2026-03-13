import { useEffect, useRef } from "react";
import { Button } from "@/components/common/Button/Button";
import "./IntroCard.scss";

type Props = {
  onFinish: () => void;
  exiting?: boolean;
};

type Petal = {
  x: number;
  y: number;
  w: number;
  h: number;
  xSpeed: number;
  ySpeed: number;
  rot: number;
  rotSpeed: number;
  gravity: number;
  opacity: number;
  fade: number;
};

function gaussianRandom(mean = 0, stdev = 1) {
  const u = Math.random() || 1e-10;
  const v = Math.random() || 1e-10;
  return (
    Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdev + mean
  );
}

export default function IntroCard({ onFinish, exiting = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const petalsRef = useRef<Petal[]>([]);
  const animationRef = useRef<number | null>(null);
  const petalImgRef = useRef<HTMLImageElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctxRef.current = ctx;

    const petalImg = new Image();
    petalImg.src = import.meta.env.BASE_URL + "petal.png";
    petalImgRef.current = petalImg;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);

      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const createBurst = () => {
    const petals: Petal[] = [];
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isMobile = w <= 480;

    const centerX = w / 2;
    const centerY = h * 0.57;

    const count = isMobile ? 150 : 230;
    const baseRadius = isMobile ? 42 : 58;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * baseRadius;
      const size = Math.max(12, gaussianRandom(isMobile ? 16 : 20, 4.5));
      const aspect = 0.8 + Math.random() * 0.45;
      const lift = 0.9 + Math.random() * 1.1;
      const spreadX = 1.3 + Math.random() * 4.8;
      const spreadY = 0.9 + Math.random() * 3.1;

      petals.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        w: size,
        h: size * aspect,
        xSpeed: Math.cos(angle) * spreadX,
        ySpeed: Math.sin(angle) * spreadY - 5.3 * lift,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.18,
        gravity: 0.038 + Math.random() * 0.03,
        opacity: 0.72 + Math.random() * 0.28,
        fade: 0.0021 + Math.random() * 0.0012,
      });
    }

    petalsRef.current = petals;
  };

  const draw = () => {
    const ctx = ctxRef.current;
    const petalImg = petalImgRef.current;
    if (!ctx || !petalImg) return;

    if (!petalImg.complete || petalImg.naturalWidth === 0) {
      animationRef.current = requestAnimationFrame(draw);
      return;
    }

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    let petals = petalsRef.current;

    petals.forEach((p) => {
      p.x += p.xSpeed;
      p.y += p.ySpeed;
      p.ySpeed += p.gravity;
      p.rot += p.rotSpeed;
      p.opacity -= p.fade;

      ctx.globalAlpha = Math.max(p.opacity, 0);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.drawImage(petalImg, -p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    ctx.globalAlpha = 1;

    petals = petals.filter((p) => p.opacity > 0);
    petalsRef.current = petals;

    if (petals.length > 0) {
      animationRef.current = requestAnimationFrame(draw);
    }
  };

  const handleClick = () => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    createBurst();
    draw();

    timeoutRef.current = window.setTimeout(() => {
      onFinish();
    }, 1900);
  };

  return (
    <div className={`intro-wrap ${exiting ? "exiting" : ""}`}>
      <div id="inviteCard" className="invite-card">
        <div className="card-inner">
          <div className="names">
            <span>백승철</span>

            <span className="between-icon" aria-hidden="true">
              <i className="fa-solid fa-wand-magic-sparkles" />
            </span>

            <span>오미영</span>
          </div>

          <div className="subtitle">결혼합니다</div>

          <div className="info">
            <div className="row date">
              <span className="main">2026. 07. 11. 토요일</span>
              <span className="sub">오전 11시</span>
            </div>

            <div className="divider" />

            <div className="row place">
              <span className="main">유성컨벤션웨딩홀</span>
              <span className="sub">3층 그랜드홀</span>
            </div>
          </div>

          <div className="action-area">
            <Button
              variant="basic"
              onClick={handleClick}
              className="intro-open-button"
            >
              <span className="intro-open-button__label">초대장 열기</span>
            </Button>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="petal" />
    </div>
  );
}
