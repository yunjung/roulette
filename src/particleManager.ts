import { Particle } from './particle';
import { SnowParticle } from './snowParticle';

export class ParticleManager {
  private _particles: Particle[] = [];
  private _snowParticles: SnowParticle[] = [];
  private _isSnowing: boolean = false;

  enableSnow(canvasWidth: number, canvasHeight: number) {
    this._isSnowing = true;
    this._snowParticles = [];
    // Initialize 50-75 snowflakes
    const snowCount = Math.floor(Math.random() * 26) + 50; // 50-75
    for (let i = 0; i < snowCount; i++) {
      this._snowParticles.push(
        new SnowParticle(
          Math.random() * canvasWidth,
          Math.random() * canvasHeight,
          canvasWidth,
          canvasHeight,
        ),
      );
    }
  }

  disableSnow() {
    this._isSnowing = false;
    this._snowParticles = [];
  }

  update(deltaTime: number) {
    // Update confetti particles
    this._particles.forEach((particle) => {
      particle.update(deltaTime);
    });
    this._particles = this._particles.filter((particle) => !particle.isDestroy);

    // Update snow particles
    if (this._isSnowing) {
      this._snowParticles.forEach((particle) => {
        particle.update(deltaTime);
      });
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    // Render snow first (background layer)
    if (this._isSnowing) {
      this._snowParticles.forEach((particle) => particle.render(ctx));
    }

    // Then render confetti (foreground layer)
    this._particles.forEach((particle) => particle.render(ctx));
  }

  shot(x: number, y: number) {
    for (let i = 0; i < 200; i++) {
      this._particles.push(new Particle(x, y));
    }
  }
}
