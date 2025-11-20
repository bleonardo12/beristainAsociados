// Sistema de diseño - Colores y estilos globales

export const colors = {
  // Primarios - Tonos calmantes
  primary: '#4A90A4',
  primaryLight: '#7AB8CC',
  primaryDark: '#2D6A7A',

  // Secundarios - Acentos
  secondary: '#6B5B95',
  accent: '#88D8B0',

  // Termómetro
  thermometer: {
    cold: '#4ECDC4',      // Verde-azulado - Muy bien
    cool: '#88D8B0',      // Verde - Acercamiento
    neutral: '#F7DC6F',   // Amarillo - Neutral
    warm: '#F39C12',      // Naranja - Tensión
    hot: '#E74C3C',       // Rojo - Escalamiento
  },

  // UI
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Texto
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    muted: '#94A3B8',
    inverse: '#FFFFFF',
  },

  // Estados
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Chat
  chat: {
    bubbleOwn: '#4A90A4',
    bubbleOther: '#E2E8F0',
    bubbleAI: '#F0E6FF',
  },

  // Bordes
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};
