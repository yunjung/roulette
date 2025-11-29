import { VectorLike } from './types/VectorLike';

export class SnowParticle {
  position: VectorLike;
  velocity: VectorLike;
  size: number;
  opacity: number;
  drift: number; // Horizontal drift
  canvasWidth: number;
  canvasHeight: number;

  constructor(x: number, y: number, canvasWidth: number, canvasHeight: number) {
    this.position = { x, y };
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.size = Math.random() * 4 + 2;
    this.velocity = { x: 0, y: Math.random() * 50 + 25 }; // Slow fall (25-75 px/s)
    this.drift = Math.random() * 20 - 10; // Side-to-side motion
    this.opacity = Math.random() * 0.6 + 0.4;
  }

  update(deltaTime: number) {
    const t = deltaTime / 1000;
    this.position.y += this.velocity.y * t;
    this.position.x += Math.sin(this.position.y / 30) * this.drift * t;

    // Reset if off screen
    if (this.position.y > this.canvasHeight) {
      this.position.y = -10;
      this.position.x = Math.random() * this.canvasWidth;
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = '#FFFFFF';

    // Draw snowflake shape (6-pointed)
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = this.position.x + Math.cos(angle) * this.size;
      const y = this.position.y + Math.sin(angle) * this.size;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
