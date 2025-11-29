interface ShapeColor {
  outline: string;
  fill: string;
  bloom: string;
  bloomRadius: number;
}

export interface ColorTheme {
  background: string;
  marbleLightness: number;
  marbleWinningBorder: string;
  skillColor: string;
  coolTimeIndicator: string;
  entity: {
    box: ShapeColor;
    circle: ShapeColor;
    polyline: ShapeColor;
  };
  rankStroke: string;
  minimapBackground: string;
  minimapViewport: string;
  winnerText: string;
  winnerOutline: string;
  winnerBackground: string;
  // Christmas-specific optional properties
  backgroundGradient?: string[];  // For gradient backgrounds
  glassBlur?: number;              // Glassmorphism blur amount
  glassOpacity?: number;           // Glass panel opacity
  accentGlow?: string;             // Festive glow color
  snowColor?: string;              // Snow particle color
}
