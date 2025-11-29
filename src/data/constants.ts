import { ColorTheme } from '../types/ColorTheme';

export const initialZoom = 55;
export const canvasWidth = 1200;
export const canvasHeight = 900;
export const zoomThreshold = 3;
export const STUCK_DELAY = 4000;

export enum Skills {
  None,
  Impact,
}

export const DefaultEntityColor = {
  box: 'cyan',
  circle: 'yellow',
  polyline: 'white',
} as const;

export const DefaultBloomColor = {
  box: 'cyan',
  circle: 'yellow',
  polyline: 'cyan',
};

export const Themes: Record<string, ColorTheme> = {
  light: {
    background: '#eee',
    marbleLightness: 50,
    marbleWinningBorder: 'black',
    skillColor: '#69c',
    coolTimeIndicator: '#999',
    entity: {
      box: {
        fill: '#226f92',
        outline: 'black',
        bloom: 'cyan',
        bloomRadius: 0,
      },
      circle: {
        fill: 'yellow',
        outline: '#ed7e11',
        bloom: 'yellow',
        bloomRadius: 0,
      },
      polyline: {
        fill: 'white',
        outline: 'black',
        bloom: 'cyan',
        bloomRadius: 0,
      },
    },
    rankStroke: 'black',
    minimapBackground: '#fefefe',
    minimapViewport: '#6699cc',

    winnerBackground: 'rgba(255, 255, 255, 0.5)',
    winnerOutline: 'black',
    winnerText: '#cccccc',
  },
  dark: {
    background: 'black',
    marbleLightness: 75,
    marbleWinningBorder: 'white',
    skillColor: 'white',
    coolTimeIndicator: 'red',
    entity: {
      box: {
        fill: 'cyan',
        outline: 'cyan',
        bloom: 'cyan',
        bloomRadius: 15,
      },
      circle: {
        fill: 'yellow',
        outline: 'yellow',
        bloom: 'yellow',
        bloomRadius: 15,
      },
      polyline: {
        fill: 'white',
        outline: 'white',
        bloom: 'cyan',
        bloomRadius: 15,
      },
    },
    rankStroke: '',
    minimapBackground: '#333333',
    minimapViewport: 'white',
    winnerBackground: 'rgba(0, 0, 0, 0.5)',
    winnerOutline: 'black',
    winnerText: 'white',
  },
  christmas: {
    // Deep winter blue gradient background
    background: '#0a1628',
    backgroundGradient: ['#0a1628', '#1a2f4a', '#2d4563'],

    marbleLightness: 60,
    marbleWinningBorder: '#FFD700', // Gold
    skillColor: '#FF6B6B', // Festive red
    coolTimeIndicator: '#50C878', // Emerald green

    entity: {
      box: {
        fill: '#C41E3A', // Christmas red
        outline: '#FFD700',
        bloom: '#FF6B6B',
        bloomRadius: 20,
      },
      circle: {
        fill: '#50C878', // Emerald green
        outline: '#FFD700',
        bloom: '#90EE90',
        bloomRadius: 20,
      },
      polyline: {
        fill: '#4169E1', // Ice blue
        outline: '#B0C4DE',
        bloom: '#87CEEB',
        bloomRadius: 15,
      },
    },

    rankStroke: '#FFD700',
    minimapBackground: 'rgba(10, 22, 40, 0.7)',
    minimapViewport: '#FFD700',
    winnerBackground: 'rgba(196, 30, 58, 0.3)',
    winnerOutline: '#FFD700',
    winnerText: '#FFFFFF',

    // Glass effects
    glassBlur: 10,
    glassOpacity: 0.2,
    accentGlow: '#FFD700',
    snowColor: '#FFFFFF',
  },
};
