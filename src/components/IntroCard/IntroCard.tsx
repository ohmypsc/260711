import { useEffect, useRef } from "react";
import "./IntroCard.scss";

type Props = {
  onFinish: () => void;
};

// ✅ BgEffect와 같은 정규분포 랜덤(크기 자연스럽게)
function gaussianRandom(mean = 0, stdev = 1) {
  let u = Math.random() || 1e-10;
  let v = Math.random() || 1e-10;
  return (
    Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdev + mean
  );
}

export default function IntroCard({ onFinish }: Props) {
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

  /**
   * ✅ Depth Burst
   * - 큰 꽃잎: 더 멀리(반지름 큼), 더 묵직(속도/중력 살짝 큼), 더 진함
   * - 작은 꽃잎: 가까이(반지름 작음), 더 가벼움, 더 빨리 사라짐
   */
  const createBurst = () => {
    const petals: any[] = [];

    // ✅ 화면 면적 기반으로 개수 결정 (화면이 클수록 더 많이)
    const area = window.innerWidth * window.innerHeight;

    // 밀도 조절 값: 작을수록 더 빽빽해짐
    const density = 2500;

    // 최대치(성능 안전선). 더 늘리고 싶으면 1400~1600까지도 가능
    const count = Math.min(1400, Math.floor(area / density));

    const baseRadius = 160; // 기본 퍼짐 반경

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;

      // ✅ 크기 정규분포
      const size = Math.max(12, gaussianRandom(26, 9));
      const aspect = 0.8 + Math.random() * 0.55; // 0.8~1.35

      // ✅ 크기 기반 깊이 계수 (큰 꽃잎일수록 depth↑)
      const depth = Math.min(size / 22, 1.9); // 약 0.5~1.9 범위

      // ✅ 큰 꽃잎일수록 더 멀리 퍼지도록 반경에 depth 적용
      const r = Math.random() * baseRadius * depth;

      // ✅ 속도: 큰 꽃잎은 묵직하게(조금 느리고), 작은 꽃잎은 가볍게(조금 빠르게)
      const speedScale = 1 / (0.75 + depth * 0.45);

      // ✅ 중력: 큰 꽃잎이 약간 더 빨리 떨어지게
      const gravity = (0.045 + Math.random() * 0.07) * depth;

      // ✅ 큰 꽃잎이 조금 더 오래/진하게 남는 느낌
      const opacity = 0.55 + Math.random() * 0.35 * depth;

      // ✅ 사라지는 속도: 작은 꽃잎 더 빨리 fade
      const fade = 0.0028 + (1 / depth) * 0.0012;

      petals.push({
        x: window.innerWidth / 2 + Math.cos(angle) * r,
        y: window.innerHeight / 2 + Math.sin(angle) * r,

        w: size,
        h: size * aspect,

        xSpeed: (Math.random() - 0.5) * 9 * speedScale,
        ySpeed: (Math.random() - 1.15) * 5.5 * speedScale,

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

  const handleClick = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    createBurst();
    draw();
    setTimeout(() => onFinish(), 2600);
  };

  return (
    <div className="intro-wrap">
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
