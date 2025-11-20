// Constantes de la aplicación

export const LIMITS = {
  MAX_CHARACTERS: 280,
  MAX_CONSECUTIVE_MESSAGES: 2,
  INACTIVITY_TIMEOUT_HOURS: 6,
  INACTIVITY_WARNING_HOURS: 2,
};

export const THERMOMETER_LEVELS = {
  VERY_GOOD: { min: 80, max: 100, color: 'cold', label: 'Excelente acercamiento' },
  GOOD: { min: 60, max: 79, color: 'cool', label: 'Buen progreso' },
  NEUTRAL: { min: 40, max: 59, color: 'neutral', label: 'Neutral' },
  TENSE: { min: 20, max: 39, color: 'warm', label: 'Tensión detectada' },
  CRITICAL: { min: 0, max: 19, color: 'hot', label: 'Escalamiento' },
};

export const SESSION_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  PAUSED: 'paused',
  RESOLVED: 'resolved',
  ABANDONED: 'abandoned',
};

export const MESSAGE_TYPES = {
  USER: 'user',
  AI_SUGGESTION: 'ai_suggestion',
  SYSTEM: 'system',
};

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  SESSIONS: '/api/sessions',
  MESSAGES: '/api/messages',
  AI: '/api/ai',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@mediator_auth_token',
  USER_DATA: '@mediator_user_data',
  SETTINGS: '@mediator_settings',
};

export const FREEMIUM_LIMITS = {
  FREE: {
    sessionsPerMonth: 3,
    messagesPerSession: 50,
    aiSuggestionsPerSession: 10,
    humanMediatorAccess: false,
  },
  PREMIUM: {
    sessionsPerMonth: -1, // Unlimited
    messagesPerSession: -1,
    aiSuggestionsPerSession: -1,
    humanMediatorAccess: true,
  },
};
