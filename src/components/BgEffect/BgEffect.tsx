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

    // 🌬️ → 사선 방향 랜덤화 (왼쪽/오른쪽 모두 가능)
    const xDirection = Math.random() > 0.5 ? 1 : -1;

    this.xSpeed = (X_SPEED + Math.random() * X_SPEED_VARIANCE) * xDirection;
    this.ySpeed = Y_SPEED + Math.random() * Y_SPEED_VARIANCE;

    this.flipSpeed = Math.random() * FLIP_SPEED_VARIANCE;
  }

  draw() {
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

    // 🌸 원래 이미지를 그린 뒤
    ctx.drawImage(
      this.petalImg,
      this.x,
      this.y,
      this.w * (0.6 + Math.abs(Math.cos(this.flip)) / 3),
      this.h * (0.8 + Math.abs(Math.sin(this.flip)) / 5)
    );

    // 🌸 로즈골드 색을 덮기
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
