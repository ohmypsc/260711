import { useEffect, useRef } from "react";
import petalUrl from "../../image/petal.png";

const ROSEGOLD_COLORS = ["#c47b85", "#e8b0a7", "#dba5b7"];

class Petal {
  x = 0;
  y = 0;
  w = 0;
  h = 0;

  opacity = 0;
  angle = 0;
  angleSpeed = 0;

  xSpeed = 0;
  ySpeed = 0;

  windOffset = 0;
  windTime = Math.random() * 1000;

  color: string;

  constructor(
    private canvas: HTMLCanvasElement,
    private ctx: CanvasRenderingContext2D,
    private img: HTMLImageElement
  ) {
    this.color =
      ROSEGOLD_COLORS[Math.floor(Math.random() * ROSEGOLD_COLORS.length)];

    this.reset(true);
  }

  reset(initial = false) {
    this.w = 25 + Math.random() * 20;
    this.h = 25 + Math.random() * 20;

    this.opacity = Math.random() * 0.7 + 0.4;

    this.x = initial
      ? Math.random() * this.canvas.width
      : Math.random() * this.canvas.width;

    this.y = initial
      ? Math.random() * this.canvas.height
      : -this.h - Math.random() * this.canvas.height;

    // 기본 속도
    this.xSpeed = Math.random() * 0.6 - 0.3; // 좌우 랜덤
    this.ySpeed = 0.4 + Math.random() * 0.6;

    // 회전
    this.angle = Math.random() * Math.PI * 2;
    this.angleSpeed = (Math.random() - 0.5) * 0.02;

    // 바람
    this.windTime = Math.random() * 1000;
  }

  draw() {
    const { ctx } = this;

    // 화면 벗어나면 재배치
    if (this.y > this.canvas.height + 50) {
      this.reset();
    }

    // 자연스러운 바람 곡선 이동
    this.windTime += 0.01;
    this.windOffset = Math.sin(this.windTime) * 20;

    // 출력 좌표
    const drawX = this.x + this.windOffset;

    ctx.save();
    ctx.globalAlpha = this.opacity;

    ctx.translate(drawX, this.y);
    ctx.rotate(this.angle);

    // 오프스크린 캔버스 tint
    const off = document.createElement("canvas");
    off.width = this.w;
    off.height = this.h;

    const o = off.getContext("2d")!;
    o.drawImage(this.img, 0, 0, this.w, this.h);

    o.globalCompositeOperation = "multiply";
    o.fillStyle = this.color;
    o.fillRect(0, 0, this.w, this.h);

    o.globalCompositeOperation = "destination-in";
    o.drawImage(this.img, 0, 0, this.w, this.h);

    // 최종 그리기
    ctx.drawImage(off, -this.w / 2, -this.h / 2);

    ctx.restore();
  }

  animate() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;

    // 회전 자연화
    this.angle += this.angleSpeed;

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

    img.onload = () => {
      const count =
        Math.floor((window.innerWidth * window.innerHeight) / 28000);

      for (let i = 0; i < count; i++) {
        petalsRef.current.push(new Petal(canvas, ctx, img));
      }
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
