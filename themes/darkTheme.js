const darkTheme = {
  id: 'dark',
  label: 'Dark Mode',
  emoji: '🌑',
  colors: {
    background: ['#0d0d0d', '#1a1a2e'],
    cardBackground: ['#1a1a2e', '#0d0d0d'],
    accent: '#00FFB3',
    accentSoft: 'rgba(0,255,179,0.1)',
    text: '#FFFFFF',
    textSoft: 'rgba(255,255,255,0.6)',
    cardBorder: 'rgba(255,255,255,0.1)',
    chip: { background: 'rgba(0,255,179,0.1)', text: '#00FFB3' },
    button: { background: '#00FFB3', text: '#0d0d0d' },
    qrBackground: '#FFFFFF',
    qrForeground: '#0d0d0d',
    inputBorder: 'rgba(0,255,179,0.3)',
    inputBackground: 'rgba(255,255,255,0.05)',
  },
  typography: {
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  shape: {
    borderRadius: 4,
    cardBorderWidth: 1,
  },
  decoration: '◈',
};

export default darkTheme;