/**
 * Módulo para la gestión del chatbot asistente virtual
 * Implementa funcionalidades de chat, respuestas predefinidas,
 * comportamiento de interfaz y manejo de estados.
 * 
 * @version 2.0
 */

// Configuración y respuestas predefinidas
const CONFIG = {
  BOT_NAME: 'Asistente B&A',
  TYPING_DELAY: 500,    // ms que tarda en "escribir" el bot
  THINKING_DELAY: 1000, // ms que tarda en "pensar" el bot
  FIRST_VISIT_DELAY: 10000, // ms antes de mostrar chatbot a nuevos visitantes
  MAX_HISTORY: 50,      // número máximo de mensajes a guardar
  DEBUG: false          // modo debug para desarrollo
};

// Estados del chatbot
const CHATBOT_STATES = {
  CLOSED: 'closed',
  OPEN: 'open',
  TYPING: 'typing',
  WAITING: 'waiting'
};

// Respuestas predefinidas para temas comunes
const PREDEFINED_RESPONSES = {
  saludo: [
    '¡Hola! Soy el asistente virtual de Beristain & Asociados. ¿En qué puedo ayudarte hoy?',
    '¡Bienvenido/a! Estoy aquí para resolver tus dudas sobre nuestros servicios legales.'
  ],
  contacto: [
    'Puedes contactarnos llamando al +541135913161 o enviando un email a beristainyasociadosej@gmail.com.',
    'Nuestro horario de atención es de lunes a viernes de 07:00 a 20:00. ¿Prefieres que te contactemos nosotros? Completa el formulario en la página.'
  ],
  ubicacion: [
    'Nuestras oficinas están ubicadas en Villa Luro, CABA, Argentina. Para más detalles sobre cómo llegar, contáctanos directamente.',
    'Trabajamos en el ámbito de la Ciudad Autónoma de Buenos Aires, La Provincia de Buenos Aires y el fuero Federal.'
  ],
  servicios: [
    'Ofrecemos servicios en diversas áreas: Derecho Penal, Civil y Comercial, Familia y Sucesiones, Seguros y Accidentes, Derecho Laboral y Administrativo. ¿Sobre cuál te gustaría más información?',
    'Nuestro equipo de profesionales está especializado en distintas áreas del derecho. ¿Hay alguna en particular que te interese?'
  ],
  costos: [
    'Los honorarios varían según el tipo de caso y su complejidad. Te invitamos a contactarnos para una consulta inicial donde evaluaremos tu situación particular.',
    'Ofrecemos una primera consulta para evaluar tu caso y brindarte un presupuesto acorde a tus necesidades. ¿Te gustaría programar una consulta?'
  ],
  default: [
    'No estoy seguro de entender tu consulta. ¿Podrías darme más detalles sobre lo que necesitas?',
    'Disculpa, no tengo información específica sobre eso. Te recomiendo contactarnos directamente para obtener una respuesta más precisa.',
    'Esa es una consulta interesante. Para brindarte la mejor asistencia, ¿podrías contactarnos a través del formulario o por teléfono?'
  ]
};

// Palabras clave para categorización
const KEYWORDS = {
  saludo: ['hola', 'buenas', 'saludos', 'buen día', 'buenos días', 'buenas tardes', 'buenas noches', 'hey', 'ola'],
  contacto: ['contacto', 'contactar', 'teléfono', 'llamar', 'email', 'correo', 'mail', 'celular', 'whatsapp', 'mensaje', 'comunicar'],
  ubicacion: ['ubicación', 'dirección', 'donde', 'dónde', 'oficina', 'lugar', 'localización', 'zona', 'barrio', 'caba', 'capital'],
  servicios: ['servicio', 'servicios', 'ofrecen', 'práctica', 'area', 'área', 'especialidad', 'tramite', 'trámite', 'ayuda', 'asesoría', 'consulta'],
  costos: ['costo', 'costos', 'precio', 'precios', 'honorarios', 'tarifa', 'tarifas', 'cobran', 'valor', 'dinero', 'pago', 'pagar', 'arancel']
};

// Variables para el estado del chatbot
let chatbotState = CHATBOT_STATES.CLOSED;
let messageHistory = [];
let pendingResponses = [];
let chatbotElements = {};

/**
 * Inicializa el chatbot asistente
 * @returns {Object|null} API del chatbot o null si no se pudo inicializar
 */
export function initChatbot() {
  try {
    log('Inicializando chatbot...');
    
    // Obtener referencias a elementos DOM
    const elements = getChatbotElements();
    if (!elements) {
      error('No se pudieron obtener los elementos necesarios para el chatbot');
      return null;
    }
    
    chatbotElements = elements;
    
    // Configurar eventos del chatbot
    setupChatbotEvents();
    
    // Cargar historial si existe
    loadChatHistory();
    
    // Comprobar si es la primera visita
    if (shouldShowForFirstVisitor()) {
      log('Primera visita detectada, programando apertura automática');
      setTimeout(() => {
        try {
          openChatbot();
        } catch (err) {
          error('Error al abrir chatbot automáticamente:', err);
        }
      }, CONFIG.FIRST_VISIT_DELAY);
    }
    
    // Configurar anunciador para lectores de pantalla
    setupScreenReaderAnnouncer();
    
    // Retornar API pública
    return createChatbotAPI();
    
  } catch (err) {
    error('Error al inicializar chatbot:', err);
    return null;
  }
}

/**
 * Obtiene referencias a los elementos DOM del chatbot
 * @returns {Object|null} Objeto con referencias a elementos o null si falta alguno
 */
function getChatbotElements() {
  const container = document.getElementById('chatbot-container');
  if (!container) {
    error('Elemento #chatbot-container no encontrado');
    return null;
  }
  
  const elements = {
    container,
    toggle: document.getElementById('chatbot-toggle'),
    panel: document.getElementById('chatbot-panel'),
    closeButton: document.getElementById('close-chatbot'),
    messageInput: document.getElementById('user-message'),
    sendButton: document.getElementById('send-message'),
    messagesContainer: document.getElementById('chat-messages')
  };
  
  // Verificar que todos los elementos existan
  const missingElements = Object.entries(elements)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
  
  if (missingElements.length > 0) {
    error(`Faltan elementos necesarios para el chatbot: ${missingElements.join(', ')}`);
    return null;
  }
  
  return elements;
}

/**
 * Configura los eventos del chatbot
 */
function setupChatbotEvents() {
  const { toggle, panel, closeButton, messageInput, sendButton } = chatbotElements;
  
  // Abrir/cerrar chatbot
  toggle.addEventListener('click', toggleChatbot);
  closeButton.addEventListener('click', closeChatbot);
  
  // Enviar mensajes
  sendButton.addEventListener('click', handleSendMessage);
  
  // Enviar mensaje con Enter
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  });
  
  // Accesibilidad para teclado
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'chatbot-panel');
  
  closeButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      closeChatbot();
    }
  });
  
  log('Eventos del chatbot configurados');
}

/**
 * Alterna el estado del chatbot (abierto/cerrado)
 */
function toggleChatbot() {
  if (chatbotState === CHATBOT_STATES.CLOSED) {
    openChatbot();
  } else {
    closeChatbot();
  }
}

/**
 * Abre el chatbot
 */
function openChatbot() {
  try {
    const { panel, messageInput, toggle, messagesContainer } = chatbotElements;
    
    panel.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    chatbotState = CHATBOT_STATES.OPEN;
    
    // Enfocar el campo de entrada
    setTimeout(() => messageInput.focus(), 300);
    
    // Mostrar mensaje de bienvenida si no hay mensajes
    if (messagesContainer.querySelectorAll('.message').length <= 1) {
      showWelcomeMessage();
    }
    
    log('Chatbot abierto');
  } catch (err) {
    error('Error al abrir chatbot:', err);
  }
}

/**
 * Cierra el chatbot
 */
function closeChatbot() {
  try {
    const { panel, toggle } = chatbotElements;
    
    panel.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    chatbotState = CHATBOT_STATES.CLOSED;
    
    log('Chatbot cerrado');
  } catch (err) {
    error('Error al cerrar chatbot:', err);
  }
}

/**
 * Muestra un mensaje de bienvenida
 */
function showWelcomeMessage() {
  try {
    showTypingIndicator();
    
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * PREDEFINED_RESPONSES.saludo.length);
      const welcomeMessage = PREDEFINED_RESPONSES.saludo[randomIndex];
      
      removeTypingIndicator();
      addBotMessage(welcomeMessage);
    }, CONFIG.TYPING_DELAY);
  } catch (err) {
    error('Error al mostrar mensaje de bienvenida:', err);
    // Fallback
    addBotMessage(PREDEFINED_RESPONSES.saludo[0]);
  }
}

/**
 * Maneja el envío de un mensaje del usuario
 */
function handleSendMessage() {
  try {
    const { messageInput } = chatbotElements;
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Añadir mensaje del usuario
    addUserMessage(message);
    
    // Limpiar campo de entrada
    messageInput.value = '';
    
    // Generar respuesta del bot
    generateBotResponse(message);
  } catch (err) {
    error('Error al enviar mensaje:', err);
  }
}

/**
 * Añade un mensaje del usuario al chat
 * @param {string} text - Texto del mensaje
 */
function addUserMessage(text) {
  try {
    const { messagesContainer } = chatbotElements;
    
    // Crear elemento de mensaje usando fragment para rendimiento
    const fragment = document.createDocumentFragment();
    const messageElement = document.createElement('div');
    messageElement.className = 'message user';
    
    const paragraph = document.createElement('p');
    paragraph.textContent = text; // Usar textContent para seguridad
    messageElement.appendChild(paragraph);
    
    fragment.appendChild(messageElement);
    messagesContainer.appendChild(fragment);
    
    // Añadir al historial
    addToHistory('user', text);
    
    // Scroll al fondo con throttling
    performScrollToBottom(messagesContainer);
  } catch (err) {
    error('Error al añadir mensaje de usuario:', err);
  }
}

/**
 * Añade un mensaje del bot al chat
 * @param {string} text - Texto del mensaje
 */
function addBotMessage(text) {
  try {
    const { messagesContainer } = chatbotElements;
    
    // Crear elemento de mensaje usando fragment para rendimiento
    const fragment = document.createDocumentFragment();
    const messageElement = document.createElement('div');
    messageElement.className = 'message bot';
    
    // Usar innerHTML aquí es seguro porque controlamos el contenido
    messageElement.innerHTML = `<p>${text}</p>`;
    
    fragment.appendChild(messageElement);
    messagesContainer.appendChild(fragment);
    
    // Añadir al historial
    addToHistory('bot', text);
    
    // Scroll al fondo con throttling
    performScrollToBottom(messagesContainer);
    
    // Anunciar para lectores de pantalla
    announceMessage(text);
  } catch (err) {
    error('Error al añadir mensaje del bot:', err);
  }
}

/**
 * Muestra un indicador de "escribiendo..." del bot
 */
function showTypingIndicator() {
  try {
    const { messagesContainer } = chatbotElements;
    
    // Verificar si ya existe un indicador
    if (messagesContainer.querySelector('.typing-indicator')) return;
    
    // Cambiar estado
    chatbotState = CHATBOT_STATES.TYPING;
    
    // Usar fragment para mejor rendimiento
    const fragment = document.createDocumentFragment();
    const typingElement = document.createElement('div');
    typingElement.className = 'message bot typing-indicator';
    typingElement.setAttribute('aria-hidden', 'true');
    
    typingElement.innerHTML = `
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    
    fragment.appendChild(typingElement);
    messagesContainer.appendChild(fragment);
    
    performScrollToBottom(messagesContainer);
  } catch (err) {
    error('Error al mostrar indicador de escritura:', err);
  }
}

/**
 * Elimina el indicador de escritura
 */
function removeTypingIndicator() {
  try {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
    
    if (chatbotState === CHATBOT_STATES.TYPING) {
      chatbotState = CHATBOT_STATES.WAITING;
    }
  } catch (err) {
    error('Error al eliminar indicador de escritura:', err);
  }
}

/**
 * Genera una respuesta del bot basada en el mensaje del usuario
 * @param {string} userMessage - Mensaje del usuario
 */
function generateBotResponse(userMessage) {
  try {
    // Mostrar indicador de escritura
    showTypingIndicator();
    
    // Categorizar el mensaje
    const messageCategory = categorizeMessage(userMessage);
    
    // Seleccionar respuesta aleatoria de la categoría
    const responses = PREDEFINED_RESPONSES[messageCategory];
    const randomIndex = Math.floor(Math.random() * responses.length);
    const response = responses[randomIndex];
    
    // Agregar a la cola de respuestas pendientes
    pendingResponses.push({
      text: response,
      delay: CONFIG.THINKING_DELAY
    });
    
    // Si es una consulta específica, ofrecer contacto como segunda respuesta
    if (['costos', 'servicios'].includes(messageCategory) && Math.random() > 0.5) {
      pendingResponses.push({
        text: '¿Te gustaría que te contactemos para una consulta personalizada?',
        delay: 1000 // Delay adicional después de la primera respuesta
      });
    }
    
    // Procesar respuestas pendientes
    processPendingResponses();
  } catch (err) {
    error('Error al generar respuesta del bot:', err);
    
    // Fallback de recuperación
    removeTypingIndicator();
    addBotMessage('Lo siento, tuve un problema al procesar tu consulta. Por favor, intenta nuevamente o contáctanos directamente.');
  }
}

/**
 * Procesa la cola de respuestas pendientes
 */
function processPendingResponses() {
  if (pendingResponses.length === 0) return;
  
  const nextResponse = pendingResponses.shift();
  
  setTimeout(() => {
    removeTypingIndicator();
    addBotMessage(nextResponse.text);
    
    // Si hay más respuestas pendientes, mostrar indicador de escritura nuevamente
    if (pendingResponses.length > 0) {
      setTimeout(() => {
        showTypingIndicator();
        processPendingResponses();
      }, 500);
    }
  }, nextResponse.delay);
}

/**
 * Categoriza un mensaje de usuario para determinar la respuesta
 * @param {string} message - Mensaje del usuario
 * @returns {string} Categoría del mensaje
 */
function categorizeMessage(message) {
  try {
    message = message.toLowerCase();
    
    // Buscar coincidencias de palabras clave
    for (const [category, words] of Object.entries(KEYWORDS)) {
      if (words.some(word => message.includes(word))) {
        return category;
      }
    }
    
    // Categorías específicas de derecho usando regex para mayor eficiencia
    const legalTopics = [
      { pattern: /penal|delit|crimen|denunci/i, category: 'servicios' },
      { pattern: /civil|contrat|daño|perjuicio/i, category: 'servicios' },
      { pattern: /laboral|trabajo|despido|sueldo|salario/i, category: 'servicios' },
      { pattern: /familia|divorcio|sucesi[oó]n|herencia/i, category: 'servicios' },
      { pattern: /seguro|accidente|tr[aá]nsito|auto/i, category: 'servicios' },
      { pattern: /administrativo|estado|gobierno|multa/i, category: 'servicios' }
    ];
    
    for (const topic of legalTopics) {
      if (topic.pattern.test(message)) {
        return topic.category;
      }
    }
    
    // Respuesta por defecto
    return 'default';
  } catch (err) {
    error('Error al categorizar mensaje:', err);
    return 'default';
  }
}

// Variable para throttling de scroll
let isScrollPending = false;

/**
 * Hace scroll al final del contenedor de mensajes con throttling
 * @param {HTMLElement} container - Contenedor de mensajes
 */
function performScrollToBottom(container) {
  if (isScrollPending) return;
  
  isScrollPending = true;
  
  // Usar requestAnimationFrame para mejor rendimiento
  requestAnimationFrame(() => {
    try {
      container.scrollTop = container.scrollHeight;
      isScrollPending = false;
    } catch (err) {
      error('Error al hacer scroll:', err);
      isScrollPending = false;
    }
  });
}

/**
 * Configura el anunciador para lectores de pantalla
 */
function setupScreenReaderAnnouncer() {
  try {
    let announcer = document.getElementById('sr-announcer');
    
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'sr-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.className = 'sr-only';
      announcer.style.position = 'absolute';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.padding = '0';
      announcer.style.margin = '-1px';
      announcer.style.overflow = 'hidden';
      announcer.style.clip = 'rect(0, 0, 0, 0)';
      announcer.style.whiteSpace = 'nowrap';
      announcer.style.border = '0';
      
      document.body.appendChild(announcer);
    }
  } catch (err) {
    error('Error al configurar anunciador para lectores de pantalla:', err);
  }
}

/**
 * Anuncia un mensaje para lectores de pantalla
 * @param {string} message - Mensaje a anunciar
 */
function announceMessage(message) {
  try {
    const announcer = document.getElementById('sr-announcer');
    if (!announcer) return;
    
    // Limpiar y actualizar el anunciador
    announcer.textContent = '';
    
    // Pequeño retraso para asegurar que el cambio sea percibido
    setTimeout(() => {
      announcer.textContent = `${CONFIG.BOT_NAME} dice: ${message}`;
    }, 100);
  } catch (err) {
    error('Error al anunciar mensaje:', err);
  }
}

/**
 * Añade un mensaje al historial
 * @param {string} role - Rol ('user' o 'bot')
 * @param {string} text - Texto del mensaje
 */
function addToHistory(role, text) {
  try {
    messageHistory.push({
      role,
      text,
      timestamp: new Date().toISOString()
    });
    
    // Limitar tamaño del historial
    if (messageHistory.length > CONFIG.MAX_HISTORY) {
      messageHistory = messageHistory.slice(-CONFIG.MAX_HISTORY);
    }
    
    // Guardar historial en localStorage
    if (window.localStorage) {
      localStorage.setItem('chatbot_history', JSON.stringify(messageHistory));
    }
  } catch (err) {
    error('Error al añadir mensaje al historial:', err);
  }
}

/**
 * Carga el historial de chat desde localStorage
 */
function loadChatHistory() {
  try {
    if (!window.localStorage) return;
    
    const savedHistory = localStorage.getItem('chatbot_history');
    if (!savedHistory) return;
    
    const parsedHistory = JSON.parse(savedHistory);
    
    // Verificar que sea un array válido
    if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
      messageHistory = parsedHistory;
      
      // Si el chatbot debería mostrar el historial, lo hacemos
      if (shouldRestoreHistory()) {
        const { messagesContainer } = chatbotElements;
        
        // Usar fragment para mejor rendimiento
        const fragment = document.createDocumentFragment();
        
        parsedHistory.forEach(item => {
          const messageEl = document.createElement('div');
          messageEl.className = `message ${item.role}`;
          messageEl.innerHTML = `<p>${item.role === 'user' ? escapeHTML(item.text) : item.text}</p>`;
          fragment.appendChild(messageEl);
        });
        
        messagesContainer.appendChild(fragment);
      }
    }
  } catch (err) {
    error('Error al cargar historial de chat:', err);
    // Si hay error, limpiar historial corrupto
    if (window.localStorage) {
      localStorage.removeItem('chatbot_history');
    }
    messageHistory = [];
  }
}

/**
 * Determina si se debe restaurar el historial
 * @returns {boolean}
 */
function shouldRestoreHistory() {
  // Solo restaurar si la sesión es reciente (menos de 1 hora)
  if (messageHistory.length === 0) return false;
  
  const lastMessageTime = new Date(messageHistory[messageHistory.length - 1].timestamp);
  const now = new Date();
  const hourInMs = 60 * 60 * 1000;
  
  return (now - lastMessageTime) < hourInMs;
}

/**
 * Determina si se debe mostrar el chatbot para visitantes nuevos
 * @returns {boolean}
 */
function shouldShowForFirstVisitor() {
  try {
    if (!window.localStorage) return false;
    
    const isReturningVisitor = localStorage.getItem('returnVisitor') === 'true';
    if (!isReturningVisitor) {
      localStorage.setItem('returnVisitor', 'true');
      return true;
    }
    
    return false;
  } catch (err) {
    error('Error al verificar si es primera visita:', err);
    return false;
  }
}

/**
 * Escapa HTML para prevenir XSS en mensajes de usuario
 * @param {string} text - Texto a escapar
 * @returns {string} Texto escapado
 */
function escapeHTML(text) {
  try {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  } catch (err) {
    error('Error al escapar HTML:', err);
    // Fallback básico
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

/**
 * Crea un API público para interactuar con el chatbot
 * @returns {Object} API del chatbot
 */
function createChatbotAPI() {
  return {
    open: openChatbot,
    close: closeChatbot,
    toggle: toggleChatbot,
    clearHistory: () => {
      messageHistory = [];
      if (window.localStorage) {
        localStorage.removeItem('chatbot_history');
      }
      return true;
    },
    getState: () => ({
      state: chatbotState,
      messagesCount: messageHistory.length,
      isFirstVisit: !localStorage.getItem('returnVisitor')
    }),
    addCustomResponse: (category, response) => {
      if (!PREDEFINED_RESPONSES[category]) {
        PREDEFINED_RESPONSES[category] = [];
      }
      PREDEFINED_RESPONSES[category].push(response);
      return true;
    }
  };
}

/**
 * Función de logging solo activa en modo debug
 */
function log(...args) {
  if (CONFIG.DEBUG) {
    console.log('[Chatbot]', ...args);
  }
}

/**
 * Función para errores
 */
function error(...args) {
  console.error('[Chatbot Error]', ...args);
}

// Comprobar primera visita (compatible con versiones anteriores)
export function checkFirstTimeVisitor() {
  if (shouldShowForFirstVisitor()) {
    setTimeout(() => {
      try {
        const chatbotToggle = document.getElementById('chatbot-toggle');
        if (chatbotToggle) chatbotToggle.click();
      } catch (err) {
        error('Error al mostrar chatbot automáticamente:', err);
      }
    }, CONFIG.FIRST_VISIT_DELAY);
  }
}