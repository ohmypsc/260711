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

    // ✅ GH Pages/로컬 모두 안전한 경로
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

  // ✅ BgEffect 느낌으로 크기/비율 다양화된 Burst
  const createBurst = () => {
    const petals: any[] = [];
    const count = 400;
    const radius = 180;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;

      // 평균 26px, 분산 9px 정도로 자연스럽게 섞임
      const size = Math.max(14, gaussianRandom(26, 9));

      // 꽃잎 비율도 랜덤하게
      const aspect = 0.8 + Math.random() * 0.5; // 0.8~1.3

      // 크기에 따라 속도도 살짝 연동(큰 건 조금 더 묵직하게)
      const sizeFactor = Math.min(size / 26, 1.6);

      petals.push({
        x: window.innerWidth / 2 + Math.cos(angle) * r,
        y: window.innerHeight / 2 + Math.sin(angle) * r,

        w: size,
        h: size * aspect,

        xSpeed: (Math.random() - 0.5) * 8 / sizeFactor,
        ySpeed: (Math.random() - 1.1) * 5 / sizeFactor,

        rot: Math.random() * 2 * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.25,
        gravity: (0.05 + Math.random() * 0.08) * sizeFactor,

        opacity: 0.7 + Math.random() * 0.3,
      });
    }

    petalsRef.current = petals;
  };

  const draw = () => {
    const ctx = ctxRef.current!;
    const canvas = canvasRef.current!;
    const petalImg = petalImgRef.current!;
    let petals = petalsRef.current;

    // ✅ 이미지 로드 실패/전 로딩이면 drawImage 하지 않음
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
