import { useEffect, useRef, useState } from "react";
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

  const [opening, setOpening] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctxRef.current = ctx;

    const petalImg = new Image();
    petalImg.src = `${import.meta.env.BASE_URL}petal.png`;
    petalImgRef.current = petalImg;

    function resize() {
      const targetCanvas = canvasRef.current;
      const targetCtx = ctxRef.current;
      if (!targetCanvas || !targetCtx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      targetCanvas.width = width * dpr;
      targetCanvas.height = height * dpr;
      targetCanvas.style.width = `${width}px`;
      targetCanvas.style.height = `${height}px`;

      targetCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
    const area = w * h;
    const isMobile = w <= 480;

    const density = isMobile ? 700 : 1200;
    const minCount = isMobile ? 900 : 0;
    const maxCount = isMobile ? 2200 : 3200;
    const count = Math.min(
      maxCount,
      Math.max(minCount, Math.floor(area / density))
    );
    const baseRadius = isMobile ? 140 : 180;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const size = Math.max(10, gaussianRandom(24, 8));
      const aspect = 0.8 + Math.random() * 0.6;
      const depth = Math.min(size / 20, 2.1);
      const r = Math.random() * baseRadius * depth;
      const speedScale = 1 / (0.75 + depth * 0.45);
      const gravity = (0.045 + Math.random() * 0.07) * depth;
      const opacity = 0.75 + Math.random() * 0.35 * depth;
      const fade = 0.0016 + (1 / depth) * 0.0008;

      petals.push({
        x: w / 2 + Math.cos(angle) * r,
        y: h / 2 + Math.sin(angle) * r,
        w: size,
        h: size * aspect,
        xSpeed: (Math.random() - 0.5) * 9 * speedScale,
        ySpeed: (Math.random() - 1.2) * 6.0 * speedScale,
        rot: Math.random() * 2 * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.22,
        gravity,
        opacity,
        fade,
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
    setOpening(true);

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    createBurst();
    draw();

    timeoutRef.current = window.setTimeout(() => {
      onFinish();
    }, 2000);
  };

  return (
    <div className={`intro-wrap ${exiting ? "exiting" : ""}`}>
      <div className="intro-frame" />

      <div className="intro-content">
        <div className="intro-top-line" />

        <div className="intro-title-block">
          <div className="intro-name">백승철</div>
          <div className="intro-and">&amp;</div>
          <div className="intro-name">오미영</div>
        </div>

        <div className="intro-subtitle">결혼합니다</div>

        <div className="intro-info">
          <div className="intro-info-group">
            <div className="intro-info-main">2026. 07. 11. 토요일</div>
            <div className="intro-info-sub">오전 11시</div>
          </div>

          <div className="intro-info-divider" />

          <div className="intro-info-group">
            <div className="intro-info-main">유성컨벤션웨딩홀</div>
            <div className="intro-info-sub">3층 그랜드홀</div>
          </div>
        </div>

        <div className="intro-action">
          <button
            type="button"
            className="intro-button"
            onClick={handleClick}
            disabled={opening}
          >
            초대장 열기
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="petal" />
    </div>
  );
}
