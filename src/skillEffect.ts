import { GameObject } from './gameObject';
import { VectorLike } from './types/VectorLike';
import { ColorTheme } from './types/ColorTheme';

const lifetime = 500;

export class SkillEffect implements GameObject {
  private _size: number = 0;
  position: VectorLike;
  private _elapsed: number = 0;
  isDestroy: boolean = false;
  private _particles: { angle: number; speed: number }[] = [];

  constructor(x: number, y: number) {
    this.position = { x, y };

    // Create particle burst directions
    for (let i = 0; i < 12; i++) {
      this._particles.push({
        angle: (Math.PI * 2 / 12) * i,
        speed: Math.random() * 2 + 1,
      });
    }
  }

  update(deltaTime: number) {
    this._elapsed += deltaTime;
    this._size = (this._elapsed / lifetime) * 10;
    if (this._elapsed > lifetime) {
      this.isDestroy = true;
    }
  }

  render(ctx: CanvasRenderingContext2D, zoom: number, theme: ColorTheme) {
    ctx.save();
    const rate = this._elapsed / lifetime;
    ctx.globalAlpha = 1 - rate * rate;

    // Main ring (existing)
    ctx.strokeStyle = theme.skillColor;
    ctx.lineWidth = 3 / zoom;
    ctx.shadowColor = theme.skillColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this._size, 0, Math.PI * 2);
    ctx.stroke();

    // Christmas sparkles radiating outward
    ctx.fillStyle = theme.accentGlow || '#FFD700'; // Gold sparkles
    this._particles.forEach((p) => {
      const dist = this._size * 0.8;
      const x = this.position.x + Math.cos(p.angle) * dist * p.speed;
      const y = this.position.y + Math.sin(p.angle) * dist * p.speed;

      // Draw star sparkle
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const starAngle = (Math.PI / 2) * i + p.angle;
        const sx = x + Math.cos(starAngle) * (2 / zoom);
        const sy = y + Math.sin(starAngle) * (2 / zoom);
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.fill();
    });

    ctx.restore();
  }
}
