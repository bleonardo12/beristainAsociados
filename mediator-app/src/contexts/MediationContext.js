import React, { createContext, useState, useContext, useReducer } from 'react';
import { LIMITS, SESSION_STATUS, THERMOMETER_LEVELS } from '../utils/constants';

const MediationContext = createContext({});

// Estado inicial de una sesión
const initialSessionState = {
  id: null,
  topic: '',
  status: SESSION_STATUS.PENDING,
  participants: [],
  messages: [],
  thermometerScore: 50, // 0-100
  aiSuggestions: [],
  consecutiveMessages: { user1: 0, user2: 0 },
  createdAt: null,
  lastActivityAt: null,
};

// Reducer para manejar acciones de la sesión
const sessionReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, ...action.payload };

    case 'ADD_MESSAGE':
      const newMessages = [...state.messages, action.payload];
      const senderId = action.payload.senderId;
      const otherUser = senderId === 'user1' ? 'user2' : 'user1';

      return {
        ...state,
        messages: newMessages,
        consecutiveMessages: {
          ...state.consecutiveMessages,
          [senderId]: state.consecutiveMessages[senderId] + 1,
          [otherUser]: 0,
        },
        lastActivityAt: new Date().toISOString(),
      };

    case 'UPDATE_THERMOMETER':
      return {
        ...state,
        thermometerScore: Math.max(0, Math.min(100, action.payload)),
      };

    case 'ADD_AI_SUGGESTION':
      return {
        ...state,
        aiSuggestions: [...state.aiSuggestions, action.payload],
      };

    case 'UPDATE_STATUS':
      return {
        ...state,
        status: action.payload,
      };

    case 'RESET_SESSION':
      return initialSessionState;

    default:
      return state;
  }
};

export const MediationProvider = ({ children }) => {
  const [currentSession, dispatch] = useReducer(sessionReducer, initialSessionState);
  const [sessions, setSessions] = useState([]); // Lista de todas las sesiones del usuario

  // Crear nueva sesión
  const createSession = (topic, inviteeEmail) => {
    const newSession = {
      ...initialSessionState,
      id: Date.now().toString(),
      topic,
      status: SESSION_STATUS.PENDING,
      createdAt: new Date().toISOString(),
      inviteeEmail,
    };

    dispatch({ type: 'SET_SESSION', payload: newSession });
    setSessions(prev => [...prev, newSession]);

    return newSession;
  };

  // Enviar mensaje
  const sendMessage = (content, senderId) => {
    // Verificar límite de caracteres
    if (content.length > LIMITS.MAX_CHARACTERS) {
      throw new Error(`El mensaje excede el límite de ${LIMITS.MAX_CHARACTERS} caracteres`);
    }

    // Verificar límite de mensajes consecutivos
    if (currentSession.consecutiveMessages[senderId] >= LIMITS.MAX_CONSECUTIVE_MESSAGES) {
      throw new Error('Debes esperar una respuesta antes de enviar otro mensaje');
    }

    const message = {
      id: Date.now().toString(),
      content,
      senderId,
      timestamp: new Date().toISOString(),
      characterCount: content.length,
    };

    dispatch({ type: 'ADD_MESSAGE', payload: message });

    return message;
  };

  // Actualizar termómetro
  const updateThermometer = (score) => {
    dispatch({ type: 'UPDATE_THERMOMETER', payload: score });
  };

  // Agregar sugerencia de IA
  const addAISuggestion = (suggestion) => {
    const aiSuggestion = {
      id: Date.now().toString(),
      content: suggestion.content,
      type: suggestion.type, // 'reformulation', 'insight', 'warning'
      timestamp: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_AI_SUGGESTION', payload: aiSuggestion });
  };

  // Obtener nivel del termómetro
  const getThermometerLevel = () => {
    const score = currentSession.thermometerScore;

    for (const [key, level] of Object.entries(THERMOMETER_LEVELS)) {
      if (score >= level.min && score <= level.max) {
        return { key, ...level };
      }
    }

    return THERMOMETER_LEVELS.NEUTRAL;
  };

  // Verificar si puede enviar mensaje
  const canSendMessage = (senderId) => {
    return currentSession.consecutiveMessages[senderId] < LIMITS.MAX_CONSECUTIVE_MESSAGES;
  };

  // Obtener mensajes restantes
  const getRemainingMessages = (senderId) => {
    return LIMITS.MAX_CONSECUTIVE_MESSAGES - currentSession.consecutiveMessages[senderId];
  };

  // Actualizar estado de la sesión
  const updateSessionStatus = (status) => {
    dispatch({ type: 'UPDATE_STATUS', payload: status });
  };

  // Cargar sesión existente
  const loadSession = (session) => {
    dispatch({ type: 'SET_SESSION', payload: session });
  };

  // Resetear sesión actual
  const resetSession = () => {
    dispatch({ type: 'RESET_SESSION' });
  };

  return (
    <MediationContext.Provider
      value={{
        currentSession,
        sessions,
        createSession,
        sendMessage,
        updateThermometer,
        addAISuggestion,
        getThermometerLevel,
        canSendMessage,
        getRemainingMessages,
        updateSessionStatus,
        loadSession,
        resetSession,
        setSessions,
      }}
    >
      {children}
    </MediationContext.Provider>
  );
};

export const useMediation = () => {
  const context = useContext(MediationContext);
  if (!context) {
    throw new Error('useMediation must be used within a MediationProvider');
  }
  return context;
};

export default MediationContext;
