import { useEffect, useRef } from "react";
import petalUrl from "@/image/petal.png";

/* --------------------------------------
   🌸 1) 자연스러운 랜덤 (정규분포) 함수
-------------------------------------- */
function gaussianRandom(mean = 0, stdev = 1) {
  let u = 1 - Math.random();
  let v = 1 - Math.random();
  let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

/* --------------------------------------
   🌬 바람 & 속도 설정
-------------------------------------- */
const BASE_Y_SPEED = 0.7;
const Y_VARIANCE = 0.35;

const WIND_STRENGTH = 22; // 좌우 흔들림 범위 (더 현실적으로)
const WIND_SPEED = 0.008; // 바람 변화 속도

const ROTATION_COEFFICIENT = 0.04; // 회전 자연스러움 계수

/* --------------------------------------
   🌸 Petal Class (업그레이드 버전)
-------------------------------------- */
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
    // 📌 정규분포 기반 크기 (자연스러움 ↑)
    const size = Math.max(16, gaussianRandom(30, 10));

    this.w = size;
    this.h = size * (0.8 + Math.random() * 0.4);

    this.opacity = 0.25 + Math.random() * 0.4;

    this.x = Math.random() * this.canvas.width;

    this.y = initial
      ? Math.random() * this.canvas.height
      : -this.h - Math.random() * this.canvas.height;

    this.ySpeed = BASE_Y_SPEED + Math.random() * Y_VARIANCE;

    // 📌 크기 기반 회전 속도 (큰 꽃잎 = 느리게)
    this.rotationSpeed =
      ((Math.random() * 2 - 1) * ROTATION_COEFFICIENT) *
      (30 / this.w);

    this.rotation = Math.random() * Math.PI * 2;

    this.windTime = Math.random() * 1000;
  }

  draw() {
    const ctx = this.ctx;

    if (this.y > this.canvas.height + this.h) {
      this.reset(false);
    }

    // 🌬 바람 흔들림
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

    // 🌸 바람에 맞춰 회전 속도가 자연스럽게 증가
    this.rotation += this.rotationSpeed + Math.sin(this.windTime) * 0.01;

    this.draw();
  }
}

/* --------------------------------------
   🌸 BgEffect Component
-------------------------------------- */
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

    // 꽃잎 수 조절 (화면 크기 비례)
    const count = Math.floor(
      (window.innerWidth * window.innerHeight) / 38000
    );

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
