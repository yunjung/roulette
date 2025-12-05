import { canvasHeight, canvasWidth, initialZoom, Themes } from './data/constants';
import { Camera } from './camera';
import { StageDef } from './data/maps';
import { Marble } from './marble';
import { ParticleManager } from './particleManager';
import { GameObject } from './gameObject';
import { UIObject } from './UIObject';
import { VectorLike } from './types/VectorLike';
import { MapEntityState } from './types/MapEntity.type';
import { ColorTheme } from './types/ColorTheme';

export type SelectedWinner = { marble: Marble, position: number };

export type RenderParameters = {
  camera: Camera;
  stage: StageDef;
  entities: MapEntityState[];
  marbles: Marble[];
  winners: SelectedWinner[]; // Selected winners at specified positions with their actual position
  allWinners?: Marble[]; // All finishers for rank display
  particleManager: ParticleManager;
  effects: GameObject[];
  winnerRank: number;
  winnerRanks?: number[]; // Array of winning positions (0-indexed)
  winner: Marble | null;
  size: VectorLike;
  theme: ColorTheme;
};

export class RouletteRenderer {
  private _canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  public sizeFactor = 1;

  private _images: { [key: string]: HTMLImageElement } = {};
  private _theme: ColorTheme = Themes.dark;
  private _starFieldPositions: { x: number; y: number; size: number }[] = [];

  constructor() {
    this._initStarField();
  }

  private _initStarField() {
    // Generate 100 stars at random positions
    for (let i = 0; i < 100; i++) {
      this._starFieldPositions.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        size: Math.random() * 2 + 1,
      });
    }
  }

  private _renderStarField() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this._starFieldPositions.forEach((star) => {
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.restore();
  }

  get width() {
    return this._canvas.width;
  }

  get height() {
    return this._canvas.height;
  }

  get canvas() {
    return this._canvas;
  }

  set theme(value: ColorTheme) {
    this._theme = value;
  }

  async init() {
    await this._load();

    this._canvas = document.createElement('canvas');
    this._canvas.width = canvasWidth;
    this._canvas.height = canvasHeight;
    this.ctx = this._canvas.getContext('2d', {
      alpha: false,
    }) as CanvasRenderingContext2D;

    document.body.appendChild(this._canvas);

    const resizing = (entries?: ResizeObserverEntry[]) => {
      const realSize = entries
        ? entries[0].contentRect
        : this._canvas.getBoundingClientRect();
      // Use devicePixelRatio for high-DPI displays
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(realSize.width * dpr, 640);
      const height = (width / realSize.width) * realSize.height;
      this._canvas.width = width;
      this._canvas.height = height;
      this.sizeFactor = width / realSize.width;
    };

    const resizeObserver = new ResizeObserver(resizing);

    resizeObserver.observe(this._canvas);
    resizing();
  }

  private async _loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((rs) => {
      const img = new Image();
      img.addEventListener('load', () => {
        rs(img);
      });
      img.src = url;
    });
  }

  private async _load(): Promise<void> {
    const loadPromises =
      [
        { name: '챔루', imgUrl: new URL('../assets/images/chamru.png', import.meta.url) },
        { name: '쿠빈', imgUrl: new URL('../assets/images/kubin.png', import.meta.url) },
        { name: '꽉변', imgUrl: new URL('../assets/images/kkwak.png', import.meta.url) },
        { name: '꽉변호사', imgUrl: new URL('../assets/images/kkwak.png', import.meta.url) },
        { name: '꽉 변호사', imgUrl: new URL('../assets/images/kkwak.png', import.meta.url) },
        { name: '주누피', imgUrl: new URL('../assets/images/junyoop.png', import.meta.url) },
        { name: '왈도쿤', imgUrl: new URL('../assets/images/waldokun.png', import.meta.url) },
      ].map(({ name, imgUrl }) => {
        return (async () => {
          this._images[name] = await this._loadImage(imgUrl.toString());
        })();
      });

    loadPromises.push((async () => {
      await this._loadImage(new URL('../assets/images/ff.svg', import.meta.url).toString());
    })());

    await Promise.all(loadPromises);
  }

  render(renderParameters: RenderParameters, uiObjects: UIObject[]) {
    this._theme = renderParameters.theme;

    // Render background with gradient support
    if (this._theme.backgroundGradient) {
      const gradient = this.ctx.createLinearGradient(
        0,
        0,
        0,
        this._canvas.height,
      );
      this._theme.backgroundGradient.forEach((color, i) => {
        gradient.addColorStop(
          i / (this._theme.backgroundGradient!.length - 1),
          color,
        );
      });
      this.ctx.fillStyle = gradient;
    } else {
      this.ctx.fillStyle = this._theme.background;
    }
    this.ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

    // Render star field if gradient background is present
    if (this._theme.backgroundGradient) {
      this._renderStarField();
    }

    this.ctx.save();
    this.ctx.scale(initialZoom, initialZoom);
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.font = '0.4pt sans-serif';
    this.ctx.lineWidth = 3 / (renderParameters.camera.zoom + initialZoom);
    renderParameters.camera.renderScene(this.ctx, () => {
      this.renderEntities(renderParameters.entities);
      this.renderEffects(renderParameters);
      this.renderMarbles(renderParameters);
    });
    this.ctx.restore();

    uiObjects.forEach((obj) =>
      obj.render(
        this.ctx,
        renderParameters,
        this._canvas.width,
        this._canvas.height,
      ),
    );
    renderParameters.particleManager.render(this.ctx);
    this.renderWinner(renderParameters);
  }

  private renderEntities(entities: MapEntityState[]) {
    this.ctx.save();
    entities.forEach((entity) => {
      const transform = this.ctx.getTransform();
      this.ctx.translate(entity.x, entity.y);
      this.ctx.rotate(entity.angle);
      this.ctx.fillStyle = entity.shape.color ?? this._theme.entity[entity.shape.type].fill;
      this.ctx.strokeStyle = entity.shape.color ?? this._theme.entity[entity.shape.type].outline;
      this.ctx.shadowBlur = this._theme.entity[entity.shape.type].bloomRadius;
      this.ctx.shadowColor = entity.shape.bloomColor ?? entity.shape.color ?? this._theme.entity[entity.shape.type].bloom;
      const shape = entity.shape;
      switch (shape.type) {
        case 'polyline':
          if (shape.points.length > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(shape.points[0][0], shape.points[0][1]);
            for (let i = 1; i < shape.points.length; i++) {
              this.ctx.lineTo(shape.points[i][0], shape.points[i][1]);
            }
            this.ctx.stroke();
          }
          break;
        case 'box':
          const w = shape.width * 2;
          const h = shape.height * 2;
          this.ctx.rotate(shape.rotation);
          this.ctx.fillRect(-w / 2, -h / 2, w, h);
          this.ctx.strokeRect(-w / 2, -h / 2, w, h);
          break;
        case 'circle':
          this.ctx.beginPath();
          this.ctx.arc(0, 0, shape.radius, 0, Math.PI * 2, false);
          this.ctx.stroke();
          break;
      }

      this.ctx.setTransform(transform);
    });
    this.ctx.restore();
  }

  private renderEffects({ effects, camera }: RenderParameters) {
    effects.forEach((effect) =>
      effect.render(this.ctx, camera.zoom * initialZoom, this._theme),
    );
  }

  private renderMarbles({
                          marbles,
                          camera,
                          winnerRank,
                          allWinners,
                          size,
                        }: RenderParameters) {
    const finishedCount = allWinners?.length || 0;
    const winnerIndex = winnerRank - finishedCount;

    const viewPort = { x: camera.x, y: camera.y, w: size.x, h: size.y, zoom: camera.zoom * initialZoom };
    marbles.forEach((marble, i) => {
      marble.render(
        this.ctx,
        camera.zoom * initialZoom,
        i === winnerIndex,
        false,
        this._images[marble.name] || undefined,
        viewPort,
        this._theme,
      );
    });
  }

  private renderWinner({ winners, theme }: RenderParameters) {
    if (!winners || winners.length === 0) return;
    this.ctx.save();

    // Build comma-separated winner text
    const winnerNames = winners.map(w => `#${w.position} ${w.marble.name}`).join(', ');

    // Calculate font size based on text length and panel width
    const panelWidth = this._canvas.width * 0.7; // 70% of canvas width
    const panelX = (this._canvas.width - panelWidth) / 2; // Center horizontally
    const headerHeight = 120;
    const contentHeight = 100;
    const panelHeight = headerHeight + contentHeight;
    const panelY = (this._canvas.height - panelHeight) / 2; // Center vertically

    // Gradient background - more opaque for better text readability
    if (theme.accentGlow) {
      const bgGradient = this.ctx.createLinearGradient(
        panelX,
        panelY,
        panelX,
        this._canvas.height,
      );
      bgGradient.addColorStop(0, 'rgba(196, 30, 58, 0.95)'); // Christmas red - increased opacity
      bgGradient.addColorStop(1, 'rgba(196, 30, 58, 0.95)');
      this.ctx.fillStyle = bgGradient;
    } else {
      this.ctx.fillStyle = theme.winnerBackground;
    }
    this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

    // Border with glow
    if (theme.accentGlow) {
      this.ctx.strokeStyle = theme.accentGlow;
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = theme.accentGlow;
      this.ctx.shadowBlur = 15;
      this.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
      this.ctx.shadowBlur = 0;

      // Decorative stars
      this._drawDecorativeStar(panelX + 20, panelY + 30);
      this._drawDecorativeStar(panelX + panelWidth - 40, panelY + 30);
    }

    // "Winner" text with Christmas styling
    this.ctx.fillStyle = theme.accentGlow || '#FFD700'; // Gold
    this.ctx.strokeStyle = theme.winnerOutline || '#8B0000'; // Dark red outline
    this.ctx.font = 'bold 64px sans-serif';
    this.ctx.textAlign = 'center'; // Center align the text
    this.ctx.lineWidth = 6;

    const winnerTextY = panelY + 75;
    const winnerTextX = panelX + panelWidth / 2; // Center of the panel
    const winnerText = winners.length > 1
      ? (theme.accentGlow ? '🎄 Winners! 🎄' : 'Winners')
      : (theme.accentGlow ? '🎄 Winner! 🎄' : 'Winner');
    if (theme.winnerOutline) {
      this.ctx.strokeText(winnerText, winnerTextX, winnerTextY);
    }
    this.ctx.fillText(winnerText, winnerTextX, winnerTextY);

    // Reset shadow blur before drawing winner names
    this.ctx.shadowBlur = 0;

    // Display winner names in a single line, comma-separated
    // Calculate font size to fit the panel width
    const maxWidth = panelWidth - 80;
    let fontSize = 52;
    this.ctx.font = `bold ${fontSize}px sans-serif`;

    // Reduce font size until text fits
    while (this.ctx.measureText(winnerNames).width > maxWidth && fontSize > 20) {
      fontSize -= 2;
      this.ctx.font = `bold ${fontSize}px sans-serif`;
    }

    this.ctx.lineWidth = Math.max(2, fontSize / 15); // Reduced stroke width
    this.ctx.fillStyle = '#FFFFFF'; // White for better readability on red background
    this.ctx.strokeStyle = '#000000'; // Dark outline for contrast
    this.ctx.textAlign = 'center'; // Center align the names

    const nameY = panelY + headerHeight + 55;
    const nameX = panelX + panelWidth / 2; // Center of the panel

    // Draw subtle outline for contrast
    this.ctx.strokeText(winnerNames, nameX, nameY);
    this.ctx.fillText(winnerNames, nameX, nameY);

    this.ctx.restore();
  }

  private _drawDecorativeStar(x: number, y: number) {
    this.ctx.save();
    this.ctx.fillStyle = '#FFD700';
    this.ctx.shadowColor = '#FFD700';
    this.ctx.shadowBlur = 10;

    // Draw small star
    this.ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
      const outerX = x + Math.cos(angle) * 15;
      const outerY = y + Math.sin(angle) * 15;
      const innerAngle = angle + Math.PI / 5;
      const innerX = x + Math.cos(innerAngle) * 7;
      const innerY = y + Math.sin(innerAngle) * 7;

      if (i === 0) {
        this.ctx.moveTo(outerX, outerY);
      } else {
        this.ctx.lineTo(outerX, outerY);
      }
      this.ctx.lineTo(innerX, innerY);
    }
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }
}
