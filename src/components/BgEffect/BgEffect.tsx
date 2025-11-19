import { useEffect, useRef } from "react";
import petalUrl from "../../image/petal.png";

// 기본 속도 설정
const X_SPEED = 0.6;
const X_SPEED_VARIANCE = 0.8;

const Y_SPEED = 0.4;
const Y_SPEED_VARIANCE = 0.4;

const FLIP_SPEED_VARIANCE = 0.02;

// 로즈골드 팔레트
const ROSEGOLD_COLORS = ["#c47b85", "#e8b0a7", "#dba5b7"];

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

  widthFactor: number = 1;
  heightFactor: number = 1;
  flipX: number = 1;
  angleOffset: number = 0;

  waveAmplitude: number = 0;
  waveFrequency: number = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private ctx: CanvasRenderingContext2D,
    private img: HTMLImageElement
  ) {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height * 2 - canvas.height;

    this.color =
      ROSEGOLD_COLORS[Math.floor(Math.random() * ROSEGOLD_COLORS.length)];

    this.initialize();
  }

  initialize() {
    this.w = 25 + Math.random() * 15;
    this.h = 20 + Math.random() * 10;

    this.opacity = this.w / 80;
    this.flip = Math.random();

    const dir = Math.random() > 0.5 ? 1 : -1;
    this.xSpeed = (X_SPEED + Math.random() * X_SPEED_VARIANCE) * dir;
    this.ySpeed = Y_SPEED + Math.random() * Y_SPEED_VARIANCE;

    this.flipSpeed = Math.random() * FLIP_SPEED_VARIANCE;

    this.widthFactor = 0.7 + Math.random() * 0.8;
    this.heightFactor = 0.7 + Math.random() * 0.8;

    this.flipX = Math.random() > 0.5 ? 1 : -1;
    this.angleOffset = Math.random() * Math.PI * 2;

    this.waveAmplitude = 15 + Math.random() * 25;
    this.waveFrequency = 0.005 + Math.random() * 0.01;
  }

  draw() {
    if (
      this.y > this.canvas.height ||
      this.x < -100 ||
      this.x > this.canvas.width + 100
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

    const wind = Math.sin(this.y * this.waveFrequency) * this.waveAmplitude;
    const drawX = this.x + wind;

    ctx.translate(drawX, this.y);
    ctx.scale(this.flipX, 1);
    ctx.rotate(this.angleOffset + this.flip * 0.5);

    const drawW = this.w * this.widthFactor;
    const drawH = this.h * this.heightFactor;

    // ----- 오프스크린 캔버스 생성 (색 입히기 전용) -----
    const off = document.createElement("canvas");
    off.width = drawW;
    off.height = drawH;
    const offCtx = off.getContext("2d")!;

    // 1) PNG 원본
    offCtx.drawImage(this.img, 0, 0, drawW, drawH);

    // 2) multiply 로즈골드 tint
    offCtx.globalCompositeOperation = "multiply";
    offCtx.fillStyle = this.color;
    offCtx.fillRect(0, 0, drawW, drawH);

    // 3) PNG shape로 마스킹 → 사각형 없음, 투명도 완벽 유지
    offCtx.globalCompositeOperation = "destination-in";
    offCtx.drawImage(this.img, 0, 0, drawW, drawH);

    // 4) 최종 출력
    ctx.drawImage(off, 0, 0);

    ctx.restore();
  }

  animate() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;
    this.flip += this.flipSpeed;
    this.draw();
  }
}

export const BgEffect = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const frameRef = useRef(0);
  const resizeTimer = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const img = new Image();
    img.src = petalUrl;

    const getCount = () =>
      Math.floor((window.innerWidth * window.innerHeight) / 30000);

    const init = () => {
      const count = getCount();
      petalsRef.current = [];
      for (let i = 0; i < count; i++) {
        petalsRef.current.push(new Petal(canvas, ctx, img));
      }
    };

    img.onload = () => init();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petalsRef.current.forEach((p) => p.animate());
      frameRef.current = requestAnimationFrame(render);
    };
    render();

    const onResize = () => {
      clearTimeout(resizeTimer.current);
      resizeTimer.current = window.setTimeout(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
      }, 200);
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div className="bg-effect">
      <canvas ref={canvasRef} />
    </div>
  );
};
