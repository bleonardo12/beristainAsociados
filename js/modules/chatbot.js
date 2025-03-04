/**
 * Módulo para la gestión del chatbot asistente virtual
 * Implementa funcionalidades básicas de chat, respuestas predefinidas
 * y comportamiento de interfaz.
 */

// Configuración y respuestas predefinidas
const BOT_NAME = 'Asistente B&J';
const BOT_TYPING_DELAY = 500; // ms que tarda en "escribir" el bot
const BOT_THINKING_DELAY = 1000; // ms que tarda en "pensar" el bot

// Respuestas predefinidas para temas comunes
const PREDEFINED_RESPONSES = {
  saludo: [
    '¡Hola! Soy el asistente virtual de Beristain & Javulia. ¿En qué puedo ayudarte hoy?',
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

/**
 * Inicializa el chatbot asistente
 */
export function initChatbot() {
  const chatbotContainer = document.getElementById('chatbot-container');
  if (!chatbotContainer) return;
  
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotPanel = document.getElementById('chatbot-panel');
  const closeButton = document.getElementById('close-chatbot');
  const messageInput = document.getElementById('user-message');
  const sendButton = document.getElementById('send-message');
  const chatMessages = document.getElementById('chat-messages');
  
  if (!chatbotToggle || !chatbotPanel || !closeButton || !messageInput || !sendButton || !chatMessages) {
    console.error('Faltan elementos necesarios para el chatbot');
    return;
  }
  
  // Abrir/cerrar chatbot
  chatbotToggle.addEventListener('click', () => {
    chatbotPanel.classList.toggle('open');
    
    if (chatbotPanel.classList.contains('open')) {
      messageInput.focus();
      
      // Mostrar indicador de escritura después de abrir
      if (chatMessages.querySelectorAll('.message').length <= 1) {
        showTypingIndicator();
        
        // Mensaje de bienvenida personalizado
        setTimeout(() => {
          removeTypingIndicator();
          const randomIndex = Math.floor(Math.random() * PREDEFINED_RESPONSES.saludo.length);
          addBotMessage(PREDEFINED_RESPONSES.saludo[randomIndex]);
        }, BOT_TYPING_DELAY);
      }
    }
  });
  
  closeButton.addEventListener('click', () => {
    chatbotPanel.classList.remove('open');
  });
  
  // Manejar envío de mensajes
  function handleSendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Añadir mensaje del usuario
    addUserMessage(message);
    messageInput.value = '';
    
    // Generar respuesta del bot
    generateBotResponse(message);
  }
  
  // Manejar envío con botón
  sendButton.addEventListener('click', handleSendMessage);
  
  // Manejar envío con Enter
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  });
  
  // Accesibilidad para teclado
  chatbotToggle.setAttribute('aria-expanded', 'false');
  chatbotToggle.setAttribute('aria-controls', 'chatbot-panel');
  
  chatbotToggle.addEventListener('click', () => {
    const isExpanded = chatbotPanel.classList.contains('open');
    chatbotToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
  });
  
  closeButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      closeButton.click();
    }
  });
}

/**
 * Añade un mensaje del usuario al chat
 */
function addUserMessage(text) {
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return;
  
  const messageElement = document.createElement('div');
  messageElement.className = 'message user';
  messageElement.innerHTML = `<p>${escapeHTML(text)}</p>`;
  
  messagesContainer.appendChild(messageElement);
  
  // Scroll al fondo
  scrollToBottom(messagesContainer);
}

/**
 * Añade un mensaje del bot al chat
 */
function addBotMessage(text) {
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return;
  
  const messageElement = document.createElement('div');
  messageElement.className = 'message bot';
  messageElement.innerHTML = `<p>${text}</p>`;
  
  messagesContainer.appendChild(messageElement);
  
  // Scroll al fondo
  scrollToBottom(messagesContainer);
  
  // Anunciar para lectores de pantalla
  announceMessage(text);
}

/**
 * Muestra un indicador de "escribiendo..." del bot
 */
function showTypingIndicator() {
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return;
  
  // Verificar si ya existe un indicador
  if (messagesContainer.querySelector('.typing-indicator')) return;
  
  const typingElement = document.createElement('div');
  typingElement.className = 'message bot typing-indicator';
  typingElement.innerHTML = `
    <div class="typing-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
  
  messagesContainer.appendChild(typingElement);
  scrollToBottom(messagesContainer);
}

/**
 * Elimina el indicador de escritura
 */
function removeTypingIndicator() {
  const typingIndicator = document.querySelector('.typing-indicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

/**
 * Genera una respuesta del bot basada en el mensaje del usuario
 */
function generateBotResponse(userMessage) {
  // Mostrar indicador de escritura
  showTypingIndicator();
  
  // Simular tiempo de "pensamiento"
  setTimeout(() => {
    // Categorizar el mensaje del usuario
    const messageCategory = categorizeMessage(userMessage);
    
    // Seleccionar respuesta de la categoría
    const responses = PREDEFINED_RESPONSES[messageCategory];
    const randomIndex = Math.floor(Math.random() * responses.length);
    const response = responses[randomIndex];
    
    // Eliminar indicador de escritura y mostrar respuesta
    removeTypingIndicator();
    addBotMessage(response);
    
    // Si es una consulta específica, ofrecer contacto
    if (['costos', 'servicios'].includes(messageCategory) && Math.random() > 0.5) {
      setTimeout(() => {
        showTypingIndicator();
        
        setTimeout(() => {
          removeTypingIndicator();
          addBotMessage('¿Te gustaría que te contactemos para una consulta personalizada?');
        }, BOT_TYPING_DELAY);
      }, 1000);
    }
  }, BOT_THINKING_DELAY);
}

/**
 * Categoriza un mensaje de usuario para determinar la respuesta
 */
function categorizeMessage(message) {
  message = message.toLowerCase();
  
  // Palabras clave para categorización
  const keywords = {
    saludo: ['hola', 'buenas', 'saludos', 'buen día', 'buenos días', 'buenas tardes', 'buenas noches'],
    contacto: ['contacto', 'contactar', 'teléfono', 'llamar', 'email', 'correo', 'mail', 'celular', 'whatsapp'],
    ubicacion: ['ubicación', 'dirección', 'donde', 'dónde', 'oficina', 'lugar'],
    servicios: ['servicio', 'servicios', 'ofrecen', 'práctica', 'area', 'área', 'especialidad', 'tramite', 'trámite', 'ayuda'],
    costos: ['costo', 'costos', 'precio', 'precios', 'honorarios', 'tarifa', 'tarifas', 'cobran', 'valor', 'dinero']
  };
  
  // Buscar coincidencias
  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => message.includes(word))) {
      return category;
    }
  }
  
  // Categorías específicas de derecho
  if (message.includes('penal') || message.includes('delito') || message.includes('crimen') || message.includes('denunci')) {
    return 'servicios';
  }
  
  if (message.includes('civil') || message.includes('contrato') || message.includes('daño')) {
    return 'servicios';
  }
  
  if (message.includes('laboral') || message.includes('trabajo') || message.includes('despido')) {
    return 'servicios';
  }
  
  if (message.includes('familia') || message.includes('divorcio') || message.includes('sucesión')) {
    return 'servicios';
  }
  
  // Respuesta por defecto
  return 'default';
}

/**
 * Hace scroll al final del contenedor de mensajes
 */
function scrollToBottom(container) {
  container.scrollTop = container.scrollHeight;
}

/**
 * Anuncia un mensaje para lectores de pantalla
 */
function announceMessage(message) {
  const announcer = document.getElementById('sr-announcer');
  
  if (!announcer) {
    const newAnnouncer = document.createElement('div');
    newAnnouncer.id = 'sr-announcer';
    newAnnouncer.setAttribute('aria-live', 'polite');
    newAnnouncer.className = 'sr-only';
    document.body.appendChild(newAnnouncer);
    
    setTimeout(() => {
      newAnnouncer.textContent = `${BOT_NAME} dice: ${message}`;
    }, 100);
  } else {
    announcer.textContent = '';
    setTimeout(() => {
      announcer.textContent = `${BOT_NAME} dice: ${message}`;
    }, 100);
  }
}

/**
 * Escapa HTML para prevenir XSS en mensajes de usuario
 */
function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Chequea si es la primera vez que el usuario visita el sitio
 * para mostrar el chatbot automáticamente
 */
export function checkFirstTimeVisitor() {
  // Verificar si es primera visita
  if (!localStorage.getItem('returnVisitor')) {
    // Marcar como visitante recurrente
    localStorage.setItem('returnVisitor', 'true');
    
    // Mostrar chatbot después de un tiempo
    setTimeout(() => {
      const chatbotToggle = document.getElementById('chatbot-toggle');
      if (chatbotToggle) chatbotToggle.click();
    }, 10000); // 10 segundos después de cargar
  }
}