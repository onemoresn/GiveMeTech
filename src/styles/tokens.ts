export const colors = {
  void: '#050510',
  voidLight: '#0a0a1a',
  voidElevated: '#12122a',
  neonCyan: '#00f0ff',
  neonMagenta: '#ff00aa',
  neonPurple: '#8b5cf6',
  neonGreen: '#00ff88',
  neonOrange: '#ff6b00',
  neonYellow: '#ffd700',
  holoBlue: '#4fc3f7',
  holoPink: '#f48fb1',
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  textPrimary: '#e8e8f0',
  textSecondary: '#9898b0',
  textMuted: '#606078',
} as const

export const sectionThemes = {
  ai: { primary: '#8b5cf6', secondary: '#00f0ff', accent: '#ff00aa' },
  cybersecurity: { primary: '#00ff88', secondary: '#00f0ff', accent: '#ffd700' },
  gadgets: { primary: '#ff6b00', secondary: '#ffd700', accent: '#00f0ff' },
  software: { primary: '#00f0ff', secondary: '#00ff88', accent: '#8b5cf6' },
  space: { primary: '#4fc3f7', secondary: '#8b5cf6', accent: '#ffd700' },
  gaming: { primary: '#ff00aa', secondary: '#8b5cf6', accent: '#00f0ff' },
  cars: { primary: '#00ff88', secondary: '#00f0ff', accent: '#ff6b00' },
} as const

export const typography = {
  display: "'Orbitron', sans-serif",
  body: "'Rajdhani', sans-serif",
  mono: "'JetBrains Mono', monospace",
} as const

export const animation = {
  duration: { fast: 0.15, normal: 0.3, slow: 0.6, glacial: 1.2 },
  easing: {
    smooth: [0.4, 0, 0.2, 1] as const,
    bounce: [0.68, -0.55, 0.265, 1.55] as const,
    spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
  },
} as const
