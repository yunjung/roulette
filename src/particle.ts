import { rad } from './utils/utils';
import { VectorLike } from './types/VectorLike';
import { Vector } from './utils/Vector';

const lifetime = 3000;

export class Particle {
  private _elapsed: number = 0;
  position: VectorLike = { x: 0, y: 0 };
  force: VectorLike = { x: 0, y: 0 };
  color: string = '';
  isDestroy: boolean = false;
  private rotation: number = 0;
  private rotationSpeed: number = 0;
  private isStar: boolean = false;

  constructor(x: number, y: number, useChristmasColors: boolean = true) {
    this.position.x = x;
    this.position.y = y;

    const force = Math.random() * 250;
    const ang = rad(90 * Math.random() - 180);
    const fx = Math.cos(ang) * force;
    const fy = Math.sin(ang) * force;

    if (useChristmasColors) {
      // Christmas colors: red, green, gold, white, blue
      const colors = [
        'hsl(0, 80%, 50%)', // Red
        'hsl(140, 60%, 50%)', // Green
        'hsl(45, 100%, 50%)', // Gold
        'hsl(0, 0%, 95%)', // White
        'hsl(210, 100%, 60%)', // Blue
      ];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    } else {
      this.color = `hsl(${Math.random() * 360} 50% 50%)`;
    }

    this.force = { x: fx, y: fy };
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    this.isStar = Math.random() > 0.5;
  }

  update(deltaTime: number) {
    this._elapsed += deltaTime;
    const delta = Vector.mul(this.force, deltaTime / 100);
    this.position = Vector.add(this.position, delta);
    this.force.y += (10 * deltaTime) / 100;
    this.rotation += this.rotationSpeed;
    if (this._elapsed > lifetime) {
      this.isDestroy = true;
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = 1 - Math.pow(this._elapsed / lifetime, 2);
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;

    if (this.isStar) {
      // Draw star shape
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
        const x = Math.cos(angle) * 10;
        const y = Math.sin(angle) * 10;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      // Draw rectangle
      ctx.fillRect(-10, -10, 20, 20);
    }

    ctx.restore();
  }
}
