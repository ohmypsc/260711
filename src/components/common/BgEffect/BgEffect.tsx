import { useEffect, useRef } from "react";
import petalUrl from "@/image/petal.png";

/* ---------- 기본 속도 파라미터 ---------- */
const BASE_Y_SPEED = 0.6;
const Y_VARIANCE = 0.4;

const FLIP_VARIANCE = 0.015;
const WIND_STRENGTH = 20;   // 좌우 흔들림 범위

/* ---------- 꽃잎 클래스 ---------- */
class Petal {
  x = 0;
  y = 0;
  w = 0;
  h = 0;

  opacity = 0;
  flip = 0;
  flipSpeed = 0;

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
    this.w = 20 + Math.random() * 20;
    this.h = 20 + Math.random() * 20;

    this.opacity = Math.random() * 0.4 + 0.3;

    this.x = Math.random() * this.canvas.width;

    this.y = initial
      ? Math.random() * this.canvas.height
      : -this.h - Math.random() * this.canvas.height;

    this.ySpeed = BASE_Y_SPEED + Math.random() * Y_VARIANCE;
    this.flip = Math.random() * Math.PI * 2;
    this.flipSpeed = (Math.random() - 0.5) * FLIP_VARIANCE;

    this.windTime = Math.random() * 1000;
  }

  draw() {
    const { ctx } = this;

    if (this.y > this.canvas.height + this.h) {
      this.reset(false);
    }

    this.windTime += 0.01;
    const windOffset = Math.sin(this.windTime) * WIND_STRENGTH;

    ctx.save();
    ctx.globalAlpha = this.opacity;

    ctx.translate(this.x + windOffset, this.y);
    ctx.rotate(this.flip);

    ctx.drawImage(this.img, -this.w / 2, -this.h / 2, this.w, this.h);

    ctx.restore();
  }

  animate() {
    this.y += this.ySpeed;
    this.flip += this.flipSpeed;
    this.draw();
  }
}

/* ---------- 컴포넌트 본체 ---------- */
export const BgEffect = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const animRef = useRef(0);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const img = new Image();
    img.src = petalUrl;

    const count = Math.floor((window.innerWidth * window.innerHeight) / 36000);

    img.onload = () => {
      petalsRef.current = Array.from({ length: count }, () => {
        return new Petal(canvas, ctx, img);
      });
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petalsRef.current.forEach((p) => p.animate());
      animRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="bg-effect">
      <canvas ref={ref} />
    </div>
  );
};
