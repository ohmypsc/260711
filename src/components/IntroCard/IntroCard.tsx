import { useEffect, useRef } from "react";
// ✅ 경로가 맞는지 꼭 확인해주세요 (Button 컴포넌트 위치)
import { Button } from "@/components/common/Button/Button"; 
import "./IntroCard.scss";

type Props = {
  onFinish: () => void;
  exiting?: boolean;
};

// 🌸 꽃잎 크기 랜덤 함수 (정규분포)
function gaussianRandom(mean = 0, stdev = 1) {
  let u = Math.random() || 1e-10;
  let v = Math.random() || 1e-10;
  return (
    Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdev + mean
  );
}

export default function IntroCard({ onFinish, exiting = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // 애니메이션 관련 Refs
  const petalsRef = useRef<any[]>([]);
  const animationRef = useRef<number | null>(null);
  const petalImgRef = useRef<HTMLImageElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctxRef.current = ctx;

    const petalImg = new Image();
    // ✅ Vite 환경 변수 사용 (배포 시 경로 문제 방지)
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

  // 🌸 [로직 1] 꽃잎 데이터 생성 (풍성하게)
  const createBurst = () => {
    const petals: any[] = [];
    const w = window.innerWidth;
    const h = window.innerHeight;
    const area = w * h;
    const isMobile = w <= 480;

    const density = isMobile ? 700 : 1200;
    const minCount = isMobile ? 900 : 0;
    const maxCount = isMobile ? 2200 : 3200;
    const count = Math.min(maxCount, Math.max(minCount, Math.floor(area / density)));
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
        gravity, opacity, fade,
      });
    }
    petalsRef.current = petals;
  };

  // 🌸 [로직 2] 캔버스에 그리기 (애니메이션 루프)
  const draw = () => {
    const ctx = ctxRef.current!;
    const canvas = canvasRef.current!;
    const petalImg = petalImgRef.current!;
    let petals = petalsRef.current;

    // 이미지가 아직 로드되지 않았으면 대기
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

    // 사라지지 않은 꽃잎만 남김
    petals = petals.filter((p) => p.opacity > 0);
    petalsRef.current = petals;

    // 꽃잎이 남아있으면 계속 그리기
    if (petals.length > 0) {
      animationRef.current = requestAnimationFrame(draw);
    }
  };

  // 🌸 [로직 3] 버튼 클릭 핸들러
  const handleClick = () => {
    // 1. 기존 애니메이션 정지 (중복 방지)
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    
    // 2. 꽃잎 생성 및 그리기 시작
    createBurst();
    draw();

    // 3. 2초 뒤에 메인 화면으로 전환 (onFinish 호출)
    setTimeout(() => onFinish(), 2000); 
  };

  return (
    <div className={`intro-wrap ${exiting ? "exiting" : ""}`}>
      <div id="inviteCard" className="invite-card">
        <div className="names">
          <span>백승철</span>
          <span className="and">&</span>
          <span>오미영</span>
        </div>
        
        <div className="subtitle">결혼합니다</div>

        <div className="info">
          <div className="row date">
            2026. 07. 11. 토요일<br/>
            오전 11시
          </div>
          <div className="row place">
            유성컨벤션웨딩홀<br/>
            3층 그랜드홀
          </div>
        </div>

        {/* ✅ 버튼 클릭 시 handleClick 실행 */}
        <div className="action-area">
          <Button variant="basic" onClick={handleClick}>
            초대장 열기
          </Button>
        </div>
      </div>

      {/* ✅ 꽃잎이 그려질 캔버스 (필수) */}
      <canvas ref={canvasRef} className="petal" />
    </div>
  );
}
