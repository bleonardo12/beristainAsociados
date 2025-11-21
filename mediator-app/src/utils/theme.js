// Sistema de diseño - Colores y estilos globales

export const colors = {
  // Primarios - Tonos vibrantes y llamativos
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',

  // Secundarios - Acentos llamativos
  secondary: '#EC4899',
  accent: '#10B981',

  // Termómetro - Colores más intensos
  thermometer: {
    cold: '#06B6D4',      // Cyan brillante - Muy bien
    cool: '#10B981',      // Esmeralda - Acercamiento
    neutral: '#FBBF24',   // Amarillo brillante - Neutral
    warm: '#F97316',      // Naranja intenso - Tensión
    hot: '#EF4444',       // Rojo brillante - Escalamiento
  },

  // UI - Fondo con más personalidad
  background: '#F0F9FF',
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

  // Chat - Burbujas más coloridas
  chat: {
    bubbleOwn: '#6366F1',
    bubbleOther: '#F1F5F9',
    bubbleAI: '#FDF4FF',
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
