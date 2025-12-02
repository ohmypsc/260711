import { useEffect, useRef } from "react";
import "./IntroCard.scss";

type Props = {
  onFinish: () => void;
  exiting?: boolean; // ✅ App에서 전달받는 상태
};

// ✅ BgEffect와 같은 정규분포 랜덤(크기 자연스럽게)
function gaussianRandom(mean = 0, stdev = 1) {
  let u = Math.random() || 1e-10;
  let v = Math.random() || 1e-10;
  return (
    Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdev + mean
  );
}

export default function IntroCard({ onFinish, exiting = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const petalsRef = useRef<any[]>([]);
  const animationRef = useRef<number | null>(null);
  const petalImgRef = useRef<HTMLImageElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctxRef.current = ctx;

    const petalImg = new Image();
    petalImg.src = import.meta.env.BASE_URL + "petal.png";
    petalImgRef.current = petalImg;

    function resize() {
      const dpr = window.devicePixelRatio || 1;

      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;

      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  /**
   * ✅ Depth Burst (풍성 버전 + 모바일 풍성 보정)
   */
  const createBurst = () => {
    const petals: any[] = [];
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
    const ctx = ctxRef.current!;
    const canvas = canvasRef.current!;
    const petalImg = petalImgRef.current!;
    let petals = petalsRef.current;

    if (!petalImg.complete || petalImg.naturalWidth === 0) {
      animationRef.current = requestAnimationFrame(draw);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    petals = petals.filter((p) => p.opacity > 0);
    petalsRef.current = petals;

    if (petals.length > 0) {
      animationRef.current = requestAnimationFrame(draw);
    }
  };

  // ✅ 꽃잎이 "완전히 덮은 뒤" 메인 전환되게 하는 타이밍
  const COVER_TIME = 2000;

  const handleClick = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    createBurst();
    draw();

    setTimeout(() => onFinish(), COVER_TIME);
  };

  return (
    <div className={`intro-wrap ${exiting ? "exiting" : ""}`}>
      <div id="inviteCard" className="invite-card" onPointerDown={handleClick}>
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
