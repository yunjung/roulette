import { RenderParameters } from './rouletteRenderer';
import { MouseEventArgs, UIObject } from './UIObject';
import { bound } from './utils/bound.decorator';
import { Rect } from './types/rect.type';
import { Marble } from './marble';

export class RankRenderer implements UIObject {
  private _currentY = 0;
  private _targetY = 0;
  private baseFontHeight = 16;
  private fontHeight = 16;
  private _userMoved = 0;
  private _currentWinner = -1;
  private maxY = 0;
  private winners: Marble[] = [];
  private marbles: Marble[] = [];
  private winnerRank: number = -1;
  private messageHandler?: (msg: string) => void;
  private _scaleFactor = 1;

  constructor() {
  }

  @bound
  onWheel(e: WheelEvent) {
    this._targetY += e.deltaY;
    if (this._targetY > this.maxY) {
      this._targetY = this.maxY;
    }
    this._userMoved = 2000;
  }

  @bound
  onDblClick(e?: MouseEventArgs) {
    if (e) {
      if (navigator.clipboard) {
        const tsv: string[] = [];
        let rank = 0;
        tsv.push(...[...this.winners, ...this.marbles].map((m) => {
          rank++;
          return [rank.toString(), m.name, rank - 1 === this.winnerRank ? '☆' : ''].join('\t');
        }));

        tsv.unshift(['Rank', 'Name', 'Winner'].join('\t'));

        navigator.clipboard.writeText(tsv.join('\n')).then(() => {
          if (this.messageHandler) {
            this.messageHandler('The result has been copied');
          }
        });
      }
    }
  }

  onMessage(func: (msg: string) => void) {
    this.messageHandler = func;
  }

  render(
    ctx: CanvasRenderingContext2D,
    { allWinners, marbles, winnerRank, winnerRanks, theme }: RenderParameters,
    width: number,
    height: number,
  ) {
    // Use allWinners for rank display (all finishers)
    const displayWinners = allWinners || [];
    const selectedRanks = winnerRanks || [winnerRank];

    // Scale fonts based on canvas size (assuming base width of 1280)
    this._scaleFactor = Math.max(1, width / 1280);
    this.fontHeight = this.baseFontHeight * this._scaleFactor;

    const startX = width - 10 * this._scaleFactor;
    const startY = Math.max(-this.fontHeight, this._currentY - height / 2);
    this.maxY = Math.max(
      0,
      (marbles.length + displayWinners.length) * this.fontHeight + this.fontHeight,
    );
    this._currentWinner = displayWinners.length;

    this.winners = displayWinners;
    this.marbles = marbles;
    this.winnerRank = winnerRank;

    const baseFontSize = 10 * this._scaleFactor;
    const boldFontSize = 11 * this._scaleFactor;
    const clipWidth = 200 * this._scaleFactor;

    ctx.save();
    ctx.textAlign = 'right';
    ctx.font = `${baseFontSize}pt sans-serif`;
    ctx.fillStyle = '#666';
    ctx.fillText(`${displayWinners.length} / ${displayWinners.length + marbles.length}`, width - 10 * this._scaleFactor, this.fontHeight);

    ctx.beginPath();
    ctx.rect(width - clipWidth, this.fontHeight + 2, clipWidth, this.maxY);
    ctx.clip();

    ctx.translate(0, -startY);
    ctx.font = `bold ${boldFontSize}pt sans-serif`;
    displayWinners.forEach((marble: { hue: number, name: string }, rank: number) => {
      const y = rank * this.fontHeight;
      if (y >= startY && y <= startY + ctx.canvas.height) {
        ctx.fillStyle = `hsl(${marble.hue} 100% ${theme.marbleLightness}`;
        // Mark with star if this rank is one of the selected winner positions
        const isSelectedWinner = selectedRanks.includes(rank);
        ctx.fillText(
          `${isSelectedWinner ? '☆' : '\u2714'} ${marble.name} #${rank + 1}`,
          startX,
          20 * this._scaleFactor + y,
        );
      }
    });
    ctx.font = `${baseFontSize}pt sans-serif`;
    marbles.forEach((marble: { hue: number; name: string }, rank: number) => {
      const y = (rank + displayWinners.length) * this.fontHeight;
      if (y >= startY && y <= startY + ctx.canvas.height) {
        ctx.fillStyle = `hsl(${marble.hue} 100% ${theme.marbleLightness}`;
        ctx.fillText(
          `${marble.name} #${rank + 1 + displayWinners.length}`,
          startX,
          20 * this._scaleFactor + y,
        );
      }
    });
    ctx.restore();
  }

  update(deltaTime: number) {
    if (this._currentWinner === -1) {
      return;
    }
    if (this._userMoved > 0) {
      this._userMoved -= deltaTime;
    } else {
      this._targetY = this._currentWinner * this.fontHeight + this.fontHeight;
    }
    if (this._currentY !== this._targetY) {
      this._currentY += (this._targetY - this._currentY) * (deltaTime / 250);
    }
    if (Math.abs(this._currentY - this._targetY) < 1) {
      this._currentY = this._targetY;
    }
  }

  getBoundingBox(): Rect | null {
    return null;
  }
}
