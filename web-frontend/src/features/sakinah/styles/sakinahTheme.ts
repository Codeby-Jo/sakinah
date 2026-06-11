/**
 * Sakinah Theme Tokens
 * Based on the visual source of truth (sakinah-dev-reference.html)
 */

export const sakinahTheme = {
  colors: {
    bg: '#07090f',          // dark background
    bg2: '#0b0f18',
    panel: '#111826',       // panel dark
    panel2: '#0f1521',
    line: 'rgba(212,168,83,0.16)',
    lineSoft: 'rgba(255,255,255,0.06)',
    gold: '#D4A853',
    goldSoft: '#e7c984',
    goldDim: 'rgba(212,168,83,0.55)',
    ink: '#EDE7DA',
    inkDim: '#9aa0ac',
    inkFaint: '#5f6675',
    green: '#7FB07A',
    rose: '#C98A8A',
    blue: '#8fa9c9',
  },
  shadows: {
    soft: '0 30px 60px -20px rgba(0,0,0,0.8)',
    glow: '0 0 0 9px #04060a, 0 0 0 10px rgba(212,168,83,0.1)',
  },
  radius: {
    base: '22px',           // rounded radius
    small: '11px',
    large: '46px',
  },
  typography: {
    serif: "'Cormorant Garamond', serif",
    sans: "'Manrope', sans-serif",
    mono: "'JetBrains Mono', monospace",
  }
} as const;
