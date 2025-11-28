import { useLayoutEffect, useRef } from "react";
import petalUrl from "@/image/petal.png";
import "./BgEffect.scss";

const BASE_Y_SPEED = 0.6;
const Y_VARIANCE = 0.3;

const WIND_STRENGTH = 18;
const WIND_SPEED = 0.006;

/* 회전 속도 ↓↓ (빙글빙글 방지) */
const ROTATION_BASE = 0.003;
const ROTATION_VARIANCE = 0.002;

/* 정규분포 랜덤 */
function gaussianRandom(mean = 0, stdev = 1) {
  let u = Math.random() || 1e-10;
  let v = Math.random() || 1e-10;
  return (
    Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdev + mean
  );
}

class Petal {
  x = 0;
  y = 0;
  w = 0;
  h = 0;

  opacity = 0;
  rotation = 0;
  rotationSpeed = 0;

  ySpeed = 0;
  windTime = Math.random() * 1000;

  constructor(
    private canvas: HTMLCanvasElement,
    private ctx: CanvasRenderingContext2D,
    private img: HTMLImageElement
  ) {
    this.reset(true);
  }

  reset(initial = false) {
    const size = Math.max(18, gaussianRandom(28, 8));

    this.w = size;
    this.h = size * (0.85 + Math.random() * 0.35);

    this.opacity = 0.3 + Math.random() * 0.35;
    this.x = Math.random() * this.canvas.width;

    this.y = initial
      ? Math.random() * this.canvas.height
      : -this.h - Math.random() * this.canvas.height;

    this.ySpeed = BASE_Y_SPEED + Math.random() * Y_VARIANCE;

    this.rotation = Math.random() * Math.PI * 2;

    this.rotationSpeed =
      (Math.random() * ROTATION_VARIANCE + ROTATION_BASE) *
      (Math.random() > 0.5 ? 1 : -1);

    this.windTime = Math.random() * 1000;
  }

  draw() {
    const ctx = this.ctx;

    if (this.y > this.canvas.height + this.h) {
      this.reset(false);
    }

    this.windTime += WIND_SPEED;
    const windOffset = Math.sin(this.windTime) * WIND_STRENGTH;

    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x + windOffset, this.y);
    ctx.rotate(this.rotation);

    // ✅ 이미지 로딩 전에도 fallback으로 바로 그려서 "늦게 시작" 느낌 제거
    if (!this.img.complete || this.img.naturalWidth === 0) {
      ctx.beginPath();
      ctx.ellipse(0, 0, this.w * 0.35, this.h * 0.45, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(231, 163, 169, 0.35)";
      ctx.fill();
    } else {
      ctx.drawImage(this.img, -this.w / 2, -this.h / 2, this.w, this.h);
    }

    ctx.restore();
  }

  animate() {
    this.y += this.ySpeed;
    this.rotation += this.rotationSpeed;
    this.draw();
  }
}

export const BgEffect = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const frameRef = useRef(0);

  // ✅ 첫 페인트 전에 세팅 → 로딩 순간부터 이미 흩날리는 느낌
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const img = new Image();
    img.src = petalUrl;

    const count = Math.max(
      8,
      Math.floor((window.innerWidth * window.innerHeight) / 25000)
    );

    // ✅ 이미지 로딩 기다리지 않고 즉시 생성
    petalsRef.current = Array.from({ length: count }, () => {
      return new Petal(canvas, ctx, img);
    });

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petalsRef.current.forEach((p) => p.animate());
      frameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="bg-effect" aria-hidden>
      <canvas ref={canvasRef} />
    </div>
  );
};
