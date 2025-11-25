import { useEffect, useRef } from "react";
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

    /* 🎯 회전 속도 대폭 감소 */
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
    ctx.drawImage(this.img, -this.w / 2, -this.h / 2, this.w, this.h);
    ctx.restore();
  }

  animate() {
    this.y += this.ySpeed;
    this.rotation += this.rotationSpeed;  /* 회전 자연스러움 */
    this.draw();
  }
}

export const BgEffect = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const img = new Image();
    img.src = petalUrl;

    const count = Math.floor((window.innerWidth * window.innerHeight) / 25000);

    img.onload = () => {
      petalsRef.current = Array.from({ length: count }, () => {
        return new Petal(canvas, ctx, img);
      });
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petalsRef.current.forEach((p) => p.animate());
      frameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div className="bg-effect">
      <canvas ref={canvasRef} />
    </div>
  );
};
