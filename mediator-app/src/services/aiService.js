import axios from 'axios';

// Configuración de la API de Claude
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const API_KEY = process.env.CLAUDE_API_KEY || 'YOUR_API_KEY_HERE';

// Prompt base para el mediador
const MEDIATOR_SYSTEM_PROMPT = `Eres un mediador profesional de conflictos especializado en comunicación no violenta y resolución de disputas. Tu rol es:

1. Analizar mensajes para detectar:
   - Tono emocional (agresivo, defensivo, conciliador, neutro)
   - Lenguaje acusatorio vs. expresivo
   - Puntos de acuerdo potenciales
   - Escalamiento del conflicto

2. Proporcionar sugerencias de reformulación que:
   - Mantengan la esencia del mensaje original
   - Usen lenguaje "yo" en lugar de "tú"
   - Eviten generalizaciones (siempre, nunca)
   - Expresen necesidades en lugar de demandas

3. Calcular un puntaje de termómetro (0-100):
   - 80-100: Excelente acercamiento
   - 60-79: Buen progreso
   - 40-59: Neutral
   - 20-39: Tensión detectada
   - 0-19: Escalamiento

Responde siempre en español y de forma empática pero profesional.`;

/**
 * Analiza un mensaje para determinar su impacto en la conversación
 */
export const analyzeMessage = async (message, conversationHistory = []) => {
  try {
    const historyContext = conversationHistory
      .slice(-10) // Últimos 10 mensajes para contexto
      .map(m => `${m.senderId}: ${m.content}`)
      .join('\n');

    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: MEDIATOR_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Analiza el siguiente mensaje en el contexto de la conversación:

Historial reciente:
${historyContext}

Nuevo mensaje a analizar:
"${message}"

Responde en formato JSON con:
{
  "tone": "agresivo|defensivo|neutro|conciliador",
  "thermometerDelta": número entre -15 y +15,
  "shouldSuggest": boolean,
  "suggestionType": "reformulation|insight|warning|null",
  "keyInsight": "breve observación sobre el mensaje"
}`
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    const content = response.data.content[0].text;

    // Parsear respuesta JSON
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
    }

    // Respuesta por defecto si falla el parsing
    return {
      tone: 'neutro',
      thermometerDelta: 0,
      shouldSuggest: false,
      suggestionType: null,
      keyInsight: ''
    };

  } catch (error) {
    console.error('Error analyzing message:', error);

    // Análisis básico local si falla la API
    return analyzeMessageLocally(message);
  }
};

/**
 * Genera una sugerencia de reformulación o insight
 */
export const generateSuggestion = async (message, conversationHistory = [], type = 'reformulation') => {
  try {
    const prompts = {
      reformulation: `Reformula el siguiente mensaje de manera más constructiva y empática,
        manteniendo la esencia pero usando comunicación no violenta:

        Mensaje original: "${message}"

        Proporciona UNA alternativa concisa (máximo 280 caracteres).`,

      insight: `Basado en la conversación, proporciona una observación breve que ayude
        a ambas partes a entender mejor la situación. Máximo 200 caracteres.`,

      warning: `El conflicto parece estar escalando. Sugiere una pausa o técnica de
        desescalamiento en máximo 200 caracteres.`,

      agreement: `Identifica un posible punto de acuerdo entre las partes basado en
        la conversación. Máximo 200 caracteres.`
    };

    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: MEDIATOR_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: prompts[type] || prompts.reformulation
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    const content = response.data.content[0].text;

    return {
      content: content.trim(),
      type
    };

  } catch (error) {
    console.error('Error generating suggestion:', error);
    return null;
  }
};

/**
 * Genera un resumen de la sesión
 */
export const generateSessionSummary = async (messages) => {
  try {
    const conversation = messages
      .map(m => `${m.senderId}: ${m.content}`)
      .join('\n');

    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: MEDIATOR_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Genera un resumen de la siguiente sesión de mediación:

${conversation}

Incluye:
1. Tema principal del conflicto
2. Puntos de acuerdo alcanzados
3. Puntos pendientes
4. Recomendaciones para próximos pasos

Formato breve y constructivo.`
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    return response.data.content[0].text;

  } catch (error) {
    console.error('Error generating summary:', error);
    return null;
  }
};

/**
 * Análisis local básico cuando la API no está disponible
 */
const analyzeMessageLocally = (message) => {
  const lowerMessage = message.toLowerCase();

  // Palabras negativas
  const negativeWords = ['nunca', 'siempre', 'odio', 'culpa', 'tu culpa', 'eres', 'malo'];
  const positiveWords = ['entiendo', 'comprendo', 'perdón', 'lo siento', 'gracias', 'acuerdo'];

  let thermometerDelta = 0;
  let shouldSuggest = false;
  let tone = 'neutro';

  negativeWords.forEach(word => {
    if (lowerMessage.includes(word)) {
      thermometerDelta -= 5;
      shouldSuggest = true;
      tone = 'defensivo';
    }
  });

  positiveWords.forEach(word => {
    if (lowerMessage.includes(word)) {
      thermometerDelta += 5;
      tone = 'conciliador';
    }
  });

  // Detectar mayúsculas excesivas (gritos)
  const upperCaseRatio = (message.match(/[A-Z]/g) || []).length / message.length;
  if (upperCaseRatio > 0.5 && message.length > 10) {
    thermometerDelta -= 10;
    shouldSuggest = true;
    tone = 'agresivo';
  }

  return {
    tone,
    thermometerDelta: Math.max(-15, Math.min(15, thermometerDelta)),
    shouldSuggest,
    suggestionType: shouldSuggest ? 'reformulation' : null,
    keyInsight: ''
  };
};

export default {
  analyzeMessage,
  generateSuggestion,
  generateSessionSummary
};
