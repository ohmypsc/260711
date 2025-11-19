import { useEffect, useRef } from "react";
import petalUrl from "../../image/petal.png";

// ====== CONFIG ======
const X_SPEED = 0.6;
const X_SPEED_VARIANCE = 0.8;

const Y_SPEED = 0.4;
const Y_SPEED_VARIANCE = 0.4;

const FLIP_SPEED_VARIANCE = 0.02;

// 로즈골드 팔레트
const ROSEGOLD_COLORS = ["#c47b85", "#e8b0a7", "#dba5b7"];

// ====== PETAL CLASS ======
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

  constructor(
    private canvas: HTMLCanvasElement,
    private ctx: CanvasRenderingContext2D,
    private petalImg: HTMLImageElement
  ) {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height * 2 - canvas.height;

    // 🌸 로즈골드 색상 랜덤 선택
    this.color = ROSEGOLD_COLORS[Math.floor(Math.random() * ROSEGOLD_COLORS.length)];

    this.initialize();
  }

  initialize() {
    this.w = 25 + Math.random() * 15;
    this.h = 20 + Math.random() * 10;

    this.opacity = this.w / 80;
    this.flip = Math.random();

    // 🌬️ 사선 방향 랜덤 (- 또는 +)
    const xDirection = Math.random() > 0.5 ? 1 : -1;

    this.xSpeed = (X_SPEED + Math.random() * X_SPEED_VARIANCE) * xDirection;
    this.ySpeed = Y_SPEED + Math.random() * Y_SPEED_VARIANCE;

    this.flipSpeed = Math.random() * FLIP_SPEED_VARIANCE;
  }

  draw() {
    // 화면 벗어나면 재생성
    if (this.y > this.canvas.height || this.x < -50 || this.x > this.canvas.width + 50) {
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

    // 원본 이미지 그리기
    ctx.drawImage(
      this.petalImg,
      this.x,
      this.y,
      this.w * (0.6 + Math.abs(Math.cos(this.flip)) / 3),
      this.h * (0.8 + Math.abs(Math.sin(this.flip)) / 5)
    );

    // 🌸 로즈골드 색 덮기
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);

    ctx.restore();
  }

  animate() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;
    this.flip += this.flipSpeed;

    this.draw();
  }
}

// ====== BG EFFECT COMPONENT ======
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

    const initializePetals = () => {
      const count = getPetalCount();
      const petals = [];

      for (let i = 0; i < count; i++) {
        petals.push(new Petal(canvas, ctx, petalImg));
      }

      petalsRef.current = petals;
    };

    initializePetals();

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

        if (newCount > petalsRef.current.length) {
          for (let i = petalsRef.current.length; i < newCount; i++) {
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
    <div className="bg-effect" style={{ pointerEvents: "none" }}>
      <canvas ref={canvasRef} />
    </div>
  );
};
