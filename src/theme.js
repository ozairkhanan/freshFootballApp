/**
 * Sports App Theme Configuration
 * Centralized theme file for consistent styling across the app
 */

// Primary background gradient (dark teal/green theme)
export const gradients = {
  // Main app background - dark teal/green gradient
  background: ['#0d1a1a', '#1c2e2c', '#1c2e2c', '#0d1a1a'],

  // Alternative darker version for overlays
  backgroundDark: ['#0a1412', '#0d1a1a', '#1c2e2c'],

  // Lighter accent gradient for cards/headers
  backgroundLight: ['#1c2e2c', '#243b38', '#2a4a45'],

  // Card background gradient
  card: ['#1c2423', '#1d2d2c', '#1c2423'],
};

// Accent colors (teal/cyan theme)
export const accents = {
  primaryTeal: '#00ffe7',
  brightTeal: '#1d7968',
  darkTeal: '#1a4a45',
  mutedTeal: '#2a4a48',
  lightTeal: '#b8e8e8',
  borderTeal: '#0d8a8a',
};

// Sport-specific theme colors (all using consistent teal theme)
export const sportThemes = {
  football: {
    primary: '#00ffe7',
    gradient: ['rgba(0, 255, 231, 0.15)', 'rgba(0, 255, 231, 0.05)'],
    badge: {
      backgroundColor: 'rgba(0, 255, 231, 0.15)',
      borderColor: 'rgba(0, 255, 231, 0.3)',
    },
  },
  basketball: {
    primary: '#00ffe7',
    gradient: ['rgba(0, 255, 231, 0.15)', 'rgba(0, 255, 231, 0.05)'],
    badge: {
      backgroundColor: 'rgba(0, 255, 231, 0.15)',
      borderColor: 'rgba(0, 255, 231, 0.3)',
    },
  },
  volleyball: {
    primary: '#00ffe7',
    gradient: ['rgba(0, 255, 231, 0.15)', 'rgba(0, 255, 231, 0.05)'],
    badge: {
      backgroundColor: 'rgba(0, 255, 231, 0.15)',
      borderColor: 'rgba(0, 255, 231, 0.3)',
    },
  },
  hockey: {
    primary: '#00ffe7',
    gradient: ['rgba(0, 255, 231, 0.15)', 'rgba(0, 255, 231, 0.05)'],
    badge: {
      backgroundColor: 'rgba(0, 255, 231, 0.15)',
      borderColor: 'rgba(0, 255, 231, 0.3)',
    },
  },
  handball: {
    primary: '#00ffe7',
    gradient: ['rgba(0, 255, 231, 0.15)', 'rgba(0, 255, 231, 0.05)'],
    badge: {
      backgroundColor: 'rgba(0, 255, 231, 0.15)',
      borderColor: 'rgba(0, 255, 231, 0.3)',
    },
  },
  mma: {
    primary: '#00ffe7',
    gradient: ['rgba(0, 255, 231, 0.15)', 'rgba(0, 255, 231, 0.05)'],
    badge: {
      backgroundColor: 'rgba(0, 255, 231, 0.15)',
      borderColor: 'rgba(0, 255, 231, 0.3)',
    },
  },
};

// Common colors
export const colors = {
  background: '#0d1a1a',
  surface: 'rgba(29, 45, 44, 0.8)',
  surfaceLight: 'rgba(42, 74, 69, 0.6)',

  text: '#ffffff',
  textSecondary: '#b8e8e8',
  textMuted: 'rgba(184, 232, 232, 0.6)',

  border: 'rgba(0, 255, 231, 0.2)',
  borderLight: 'rgba(0, 255, 231, 0.1)',

  error: '#ff3d3d',
  success: '#00ffe7',
  warning: '#ffb347',
  live: '#ff1744',
};

// Helper function to get sport theme
export const getSportTheme = sport => {
  return sportThemes[sport] || sportThemes.football;
};

// Default export
export default {
  gradients,
  accents,
  sportThemes,
  colors,
  getSportTheme,
};
