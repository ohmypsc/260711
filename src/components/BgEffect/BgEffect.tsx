import { useEffect, useRef } from "react";
import petalUrl from "../../image/petal.png";

// ======================
// 기본 속도 설정
// ======================
const X_SPEED = 0.6;
const X_SPEED_VARIANCE = 0.8;

const Y_SPEED = 0.4;
const Y_SPEED_VARIANCE = 0.4;

const FLIP_SPEED_VARIANCE = 0.02;

// ======================
// 로즈골드 팔레트
// ======================
const ROSEGOLD_COLORS = ["#c47b85", "#e8b0a7", "#dba5b7"];

// ======================
// Petal 클래스
// ======================
class Petal {
  x: number;
  y: number;
  w: number = 0;
  h: number = 0;
  opacity: number = 0;
  flip: number = 0;

  xSpeed: number = 0;
  ySpeed: number = 0;
  flipSpeed: number = 0;

  color: string;

  // 모양 다양화 요소
  widthFactor: number = 1;
  heightFactor: number = 1;
  flipX: number = 1; // 좌우 반전
  angleOffset: number = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private ctx: CanvasRenderingContext2D,
    private petalImg: HTMLImageElement
  ) {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height * 2 - canvas.height;

    // 🌸 로즈골드 색 랜덤
    this.color =
      ROSEGOLD_COLORS[Math.floor(Math.random() * ROSEGOLD_COLORS.length)];

    this.initialize();
  }

  initialize() {
    this.w = 25 + Math.random() * 15;
    this.h = 20 + Math.random() * 10;

    this.opacity = this.w / 80;
    this.flip = Math.random();

    // 사선 방향 랜덤 (- 또는 +)
    const xDirection = Math.random() > 0.5 ? 1 : -1;
    this.xSpeed = (X_SPEED + Math.random() * X_SPEED_VARIANCE) * xDirection;
    this.ySpeed = Y_SPEED + Math.random() * Y_SPEED_VARIANCE;

    this.flipSpeed = Math.random() * FLIP_SPEED_VARIANCE;

    // 🌸 모양 랜덤 변형 (1개 이미지 → 5~6종처럼 보이게)
    this.widthFactor = 0.7 + Math.random() * 0.8; // 0.7 ~ 1.5
    this.heightFactor = 0.7 + Math.random() * 0.8; // 0.7 ~ 1.5

    this.flipX = Math.random() > 0.5 ? 1 : -1; // 좌우 반전
    this.angleOffset = Math.random() * Math.PI * 2; // 기본 회전 각도
  }

  draw() {
    // 화면 벗어나면 초기화
    if (
      this.y > this.canvas.height ||
      this.x < -80 ||
      this.x > this.canvas.width + 80
    ) {
      this.initialize();

      const rand = Math.random() * (this.canvas.width + this.canvas.height);
      if (rand > this.canvas.width) {
        this.x = 0;
        this.y = rand - this.canvas.width;
      } else {
        this.x = rand;
        this.y = 0;
      }
    }

    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = this.opacity;

    // ======================
    // 랜덤 기울기 + 좌우 반전 + 변형 처리
    // ======================
    ctx.translate(this.x, this.y);
    ctx.scale(this.flipX, 1);
    ctx.rotate(this.angleOffset + this.flip * 0.5);

    const drawW = this.w * this.widthFactor;
    const drawH = this.h * this.heightFactor;

    // 원본 PNG 그리기
    ctx.drawImage(this.petalImg, 0, 0, drawW, drawH);

    // 로즈골드 색상 오버레이
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, drawW, drawH);

    ctx.restore();
  }

  animate() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;
    this.flip += this.flipSpeed;
    this.draw();
  }
}

// ======================
// BgEffect 컴포넌트
// ======================
export const BgEffect = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const resizeTimeoutRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const petalImg = new Image();
    petalImg.src = petalUrl;

    const getPetalCount = () =>
      Math.floor((window.innerWidth * window.innerHeight) / 30000);

    const initPetals = () => {
      const count = getPetalCount();
      const arr = [];

      for (let i = 0; i < count; i++) {
        arr.push(new Petal(canvas, ctx, petalImg));
      }
      petalsRef.current = arr;
    };

    initPetals();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petalsRef.current.forEach((p) => p.animate());
      frameRef.current = requestAnimationFrame(render);
    };

    render();

    const onResize = () => {
      clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = window.setTimeout(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const newCount = getPetalCount();
        const current = petalsRef.current.length;

        if (newCount > current) {
          for (let i = current; i < newCount; i++) {
            petalsRef.current.push(new Petal(canvas, ctx, petalImg));
          }
        } else {
          petalsRef.current.splice(newCount);
        }
      }, 150);
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div className="bg-effect" style={{ pointerEvents: "none", zIndex: 99999 }}>
      <canvas ref={canvasRef} />
    </div>
  );
};
