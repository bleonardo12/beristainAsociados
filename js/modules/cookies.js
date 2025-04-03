/**
 * Módulo para la gestión del consentimiento de cookies
 * Implementa un banner de consentimiento GDPR/CCPA compatible,
 * con almacenamiento de preferencias y gestión de cookies.
 * 
 * @version 3.0
 */

// Configuración
const CONFIG = {
  COOKIE_CONSENT_KEY: 'cookie-consent-v3',
  COOKIE_CONSENT_EXPIRY: 365, // días
  ANIMATION_DURATION: 500, // ms
  BANNER_DELAY: 1000, // ms para mostrar el banner
  ANNOUNCEMENT_DURATION: 3000, // ms para anuncios de accesibilidad
  DEBUG: false // Modo de desarrollo
};

/**
 * Tipos de consentimiento posibles
 */
const ConsentType = {
  NONE: 'none',    // No se ha dado consentimiento
  ESSENTIAL: 'essential', // Solo cookies esenciales
  FULL: 'full'     // Todas las cookies (incluyendo analíticas y marketing)
};

/**
 * Categorías de cookies
 */
const CookieCategory = {
  ESSENTIAL: 'essential',
  ANALYTICS: 'analytics',
  MARKETING: 'marketing',
  PREFERENCES: 'preferences'
};

// Variables globales del módulo
let currentConsentType = ConsentType.NONE;
let cookieBanner = null;
let preferencesPanel = null;
let bannerVisible = false;

/**
 * Inicializa el sistema de consentimiento de cookies
 * @returns {Object} API para gestionar el consentimiento
 */
export function initCookieConsent() {
  try {
    log('Inicializando sistema de consentimiento de cookies');
    
    // Obtener elementos DOM
    cookieBanner = document.getElementById('cookie-banner');
    if (!cookieBanner) {
      warn('Banner de cookies no encontrado en el DOM');
      return createConsentAPI();
    }
    
    // Verificar si existe consentimiento previo
    currentConsentType = getConsentStatus();
    
    // Configurar internacionalización
    setupI18n();
    
    if (currentConsentType === ConsentType.NONE) {
      // Mostrar banner si no hay consentimiento previo
      setupConsentBanner(cookieBanner);
    } else {
      // Inicializar servicios según consentimiento existente
      log(`Consentimiento existente: ${currentConsentType}`);
      initializeServices(currentConsentType);
    }
    
    // Añadir enlace para gestionar preferencias en la política de privacidad
    setupPreferencesLinks();
    
    // Retornar API pública
    return createConsentAPI();
  } catch (error) {
    error('Error al inicializar sistema de cookies:', error);
    return createConsentAPI();
  }
}

/**
 * Configura enlaces a preferencias de cookies en políticas de privacidad
 */
function setupPreferencesLinks() {
  try {
    // Buscar enlaces con atributo data-cookie-preferences
    const links = document.querySelectorAll('[data-cookie-preferences]');
    
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        openCookiePreferences();
      });
    });
  } catch (err) {
    error('Error al configurar enlaces de preferencias:', err);
  }
}

/**
 * Configura el soporte para múltiples idiomas
 */
function setupI18n() {
  // Implementación básica que podría expandirse
  const lang = document.documentElement.lang || 'es';
  log(`Idioma detectado: ${lang}`);
}

/**
 * Configura el banner de consentimiento y sus controles
 * @param {HTMLElement} banner - Elemento del banner
 */
function setupConsentBanner(banner) {
  try {
    const acceptButton = document.getElementById('accept-cookies');
    const rejectButton = document.getElementById('reject-cookies');
    
    if (!acceptButton || !rejectButton) {
      warn('Botones del banner de cookies no encontrados');
      return;
    }
    
    // Configurar botones para accesibilidad
    acceptButton.setAttribute('aria-describedby', 'cookie-banner-description');
    rejectButton.setAttribute('aria-describedby', 'cookie-banner-description');
    
    // Mostrar banner con animación después de un breve retraso
    setTimeout(() => {
      showBanner(banner);
    }, CONFIG.BANNER_DELAY);
    
    // Configurar evento para botón de aceptar
    acceptButton.addEventListener('click', () => {
      handleConsentChoice(ConsentType.FULL);
    });
    
    // Configurar evento para botón de rechazar
    rejectButton.addEventListener('click', () => {
      handleConsentChoice(ConsentType.ESSENTIAL);
    });
    
    // Gestión del foco para accesibilidad
    setupFocusTrap(banner);
    
    // Permitir escape para cerrar
    document.addEventListener('keydown', handleEscapeKey);
    
    log('Banner de consentimiento configurado');
  } catch (error) {
    error('Error al configurar banner de cookies:', error);
  }
}

/**
 * Maneja la elección de consentimiento del usuario
 * @param {string} consentType - Tipo de consentimiento elegido
 */
function handleConsentChoice(consentType) {
  try {
    // Guardar preferencia
    setConsentStatus(consentType);
    currentConsentType = consentType;
    
    // Ocultar banner
    hideBanner(cookieBanner);
    
    // Inicializar servicios
    initializeServices(consentType);
    
    // Anunciar para lectores de pantalla
    announceToScreenReader(`Preferencias de cookies actualizadas: ${getConsentDescription(consentType)}`);
    
    log(`Usuario eligió: ${consentType}`);
  } catch (err) {
    error('Error al procesar elección de consentimiento:', err);
  }
}

/**
 * Obtiene descripción del tipo de consentimiento
 * @param {string} consentType - Tipo de consentimiento
 * @returns {string} Descripción del consentimiento
 */
function getConsentDescription(consentType) {
  switch (consentType) {
    case ConsentType.FULL:
      return 'Todas las cookies aceptadas';
    case ConsentType.ESSENTIAL:
      return 'Solo cookies esenciales';
    default:
      return 'Sin preferencia definida';
  }
}

/**
 * Configura una trampa de foco para el banner
 * @param {HTMLElement} banner - Elemento del banner
 */
function setupFocusTrap(banner) {
  try {
    const focusableElements = banner.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length < 2) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Crear ciclo de foco
    lastElement.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        firstElement.focus();
      }
    });
    
    firstElement.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        lastElement.focus();
      }
    });
  } catch (err) {
    error('Error al configurar trampa de foco:', err);
  }
}

/**
 * Maneja la tecla Escape para cerrar el banner
 * @param {KeyboardEvent} e - Evento de teclado
 */
function handleEscapeKey(e) {
  if (e.key === 'Escape' && bannerVisible) {
    // Si presiona escape, elegir opciones esenciales por defecto
    handleConsentChoice(ConsentType.ESSENTIAL);
  }
}

/**
 * Muestra el banner con animación
 * @param {HTMLElement} banner - Elemento del banner
 */
function showBanner(banner) {
  try {
    // Asegurar que el banner esté visible antes de la animación
    banner.style.display = 'block';
    banner.style.opacity = '0';
    banner.style.transform = 'translateY(100%)';
    
    // Forzar reflow para asegurar que los cambios se apliquen
    banner.offsetHeight;
    
    // Añadir clase para animar
    banner.classList.add('visible');
    bannerVisible = true;
    
    // Anunciar para lectores de pantalla
    announceToScreenReader('Aviso importante sobre cookies y privacidad');
    
    // Enfocar primer botón para accesibilidad
    setTimeout(() => {
      const firstButton = banner.querySelector('button');
      if (firstButton) firstButton.focus();
    }, 100);
    
    log('Banner mostrado');
  } catch (error) {
    error('Error al mostrar banner:', error);
  }
}

/**
 * Oculta el banner con animación
 * @param {HTMLElement} banner - Elemento del banner
 */
function hideBanner(banner) {
  try {
    // Configurar transición suave
    banner.style.transition = `transform ${CONFIG.ANIMATION_DURATION}ms ease-in-out, opacity ${CONFIG.ANIMATION_DURATION}ms ease-in-out`;
    
    // Ocultar con animación
    banner.classList.remove('visible');
    bannerVisible = false;
    
    // Permitir que la animación termine antes de ocultar completamente
    setTimeout(() => {
      banner.style.display = 'none';
      
      // Devolver foco a elemento apropiado
      returnFocusAfterBanner();
    }, CONFIG.ANIMATION_DURATION);
    
    log('Banner ocultado');
  } catch (error) {
    error('Error al ocultar banner:', error);
    
    // Fallback si falla la animación
    if (banner) {
      banner.style.display = 'none';
    }
  }
}

/**
 * Devuelve el foco después de cerrar el banner
 */
function returnFocusAfterBanner() {
  try {
    // Buscar un elemento apropiado para devolver el foco
    const mainContent = document.querySelector('main h1') || 
                        document.querySelector('main') ||
                        document.querySelector('body');
    
    if (mainContent && typeof mainContent.focus === 'function') {
      mainContent.focus();
    }
  } catch (err) {
    error('Error al devolver foco:', err);
  }
}

/**
 * Anuncia un mensaje para lectores de pantalla
 * @param {string} message - Mensaje a anunciar
 */
function announceToScreenReader(message) {
  try {
    let ariaElement = document.getElementById('cookie-aria-live');
    
    if (!ariaElement) {
      ariaElement = document.createElement('div');
      ariaElement.id = 'cookie-aria-live';
      ariaElement.setAttribute('role', 'status');
      ariaElement.setAttribute('aria-live', 'polite');
      ariaElement.className = 'sr-only';
      document.body.appendChild(ariaElement);
    }
    
    // Vaciar y luego añadir el nuevo mensaje
    ariaElement.textContent = '';
    setTimeout(() => {
      ariaElement.textContent = message;
    }, 100);
    
    // Eliminar después de un tiempo
    setTimeout(() => {
      ariaElement.textContent = '';
    }, CONFIG.ANNOUNCEMENT_DURATION);
  } catch (error) {
    error('Error al anunciar a lector de pantalla:', error);
  }
}

/**
 * Guarda el estado de consentimiento en cookies y localStorage
 * @param {string} consentType - Tipo de consentimiento
 */
function setConsentStatus(consentType) {
  try {
    // Crear objeto con información de consentimiento
    const consentData = {
      type: consentType,
      timestamp: new Date().toISOString(),
      version: '3.0'
    };
    
    // Convertir a JSON
    const consentJson = JSON.stringify(consentData);
    
    // Guardar como cookie
    setCookie(CONFIG.COOKIE_CONSENT_KEY, consentJson, CONFIG.COOKIE_CONSENT_EXPIRY);
    
    // También guardar en localStorage como respaldo
    try {
      localStorage.setItem(CONFIG.COOKIE_CONSENT_KEY, consentJson);
    } catch (e) {
      warn('No se pudo guardar en localStorage', e);
    }
    
    // Actualizar la variable global
    currentConsentType = consentType;
    
    log(`Consentimiento guardado: ${consentType}`);
    return true;
  } catch (error) {
    error('Error al guardar consentimiento:', error);
    return false;
  }
}

/**
 * Obtiene el estado actual de consentimiento
 * @returns {string} Tipo de consentimiento
 */
function getConsentStatus() {
  try {
    // Intentar leer desde cookie
    const cookieValue = getCookie(CONFIG.COOKIE_CONSENT_KEY);
    
    if (cookieValue) {
      try {
        const data = JSON.parse(cookieValue);
        return data.type || ConsentType.NONE;
      } catch (e) {
        warn('Error al parsear cookie JSON', e);
        eraseCookie(CONFIG.COOKIE_CONSENT_KEY);
        return ConsentType.NONE;
      }
    }
    
    // Si no hay cookie, intentar leer desde localStorage
    try {
      const localData = localStorage.getItem(CONFIG.COOKIE_CONSENT_KEY);
      if (localData) {
        const data = JSON.parse(localData);
        
        // Sincronizar con cookie por si acaso
        setCookie(CONFIG.COOKIE_CONSENT_KEY, localData, CONFIG.COOKIE_CONSENT_EXPIRY);
        
        return data.type || ConsentType.NONE;
      }
    } catch (e) {
      warn('Error al leer localStorage', e);
    }
    
    return ConsentType.NONE;
  } catch (error) {
    error('Error al obtener estado de consentimiento:', error);
    return ConsentType.NONE;
  }
}

/**
 * Inicializa servicios según el nivel de consentimiento
 * @param {string} consentType - Tipo de consentimiento
 */
function initializeServices(consentType) {
  try {
    // Siempre se cargan servicios esenciales
    initializeEssentialServices();
    
    // Servicios adicionales si hay consentimiento completo
    if (consentType === ConsentType.FULL) {
      initializeMarketingServices();
      initializeAnalyticsServices();
      initializePreferencesServices();
    }
    
    log(`Servicios inicializados para tipo: ${consentType}`);
  } catch (error) {
    error('Error al inicializar servicios:', error);
  }
}

/**
 * Inicializa servicios esenciales (siempre permitidos)
 */
function initializeEssentialServices() {
  try {
    // Implementar lógica para servicios esenciales
    log('Servicios esenciales inicializados');
  } catch (err) {
    error('Error al inicializar servicios esenciales:', err);
  }
}

/**
 * Inicializa servicios de analítica (solo con consentimiento completo)
 */
function initializeAnalyticsServices() {
  try {
    // Google Analytics 4 (gtag)
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
      log('Google Analytics inicializado (gtag)');
    }
    
    // Google Analytics (analytics.js legacy)
    if (typeof ga === 'function') {
      ga('set', 'anonymizeIp', false);
      log('Google Analytics inicializado (analytics.js)');
    }
    
    log('Servicios de analítica inicializados');
  } catch (err) {
    error('Error al inicializar servicios de analítica:', err);
  }
}

/**
 * Inicializa servicios de marketing (solo con consentimiento completo)
 */
function initializeMarketingServices() {
  try {
    // Google ads y marketing
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        'ad_storage': 'granted',
        'personalization_storage': 'granted'
      });
      log('Servicios de ads inicializados (gtag)');
    }
    
    // Facebook Pixel
    if (typeof fbq === 'function') {
      fbq('consent', 'grant');
      log('Facebook Pixel inicializado');
    }
    
    log('Servicios de marketing inicializados');
  } catch (err) {
    error('Error al inicializar servicios de marketing:', err);
  }
}

/**
 * Inicializa servicios de preferencias (solo con consentimiento completo)
 */
function initializePreferencesServices() {
  try {
    // Servicios de personalización
    log('Servicios de preferencias inicializados');
  } catch (err) {
    error('Error al inicializar servicios de preferencias:', err);
  }
}

/**
 * Establece una cookie con los parámetros especificados
 * @param {string} name - Nombre de la cookie
 * @param {string} value - Valor de la cookie
 * @param {number} days - Días de validez
 */
function setCookie(name, value, days) {
  try {
    let expires = '';
    
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }
    
    // Establecer cookie segura con samesite
    document.cookie = name + '=' + encodeURIComponent(value) + 
      expires + '; path=/; samesite=lax; secure';
    
    return true;
  } catch (error) {
    error('Error al establecer cookie:', error);
    return false;
  }
}

/**
 * Obtiene el valor de una cookie por su nombre
 * @param {string} name - Nombre de la cookie
 * @returns {string|null} Valor de la cookie o null
 */
function getCookie(name) {
  try {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    
    return null;
  } catch (error) {
    error('Error al leer cookie:', error);
    return null;
  }
}

/**
 * Elimina una cookie por su nombre
 * @param {string} name - Nombre de la cookie
 * @returns {boolean} Resultado de la operación
 */
function eraseCookie(name) {
  try {
    document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; samesite=lax; secure';
    return true;
  } catch (err) {
    error('Error al eliminar cookie:', err);
    return false;
  }
}

/**
 * Abre un panel de preferencias de cookies
 * @returns {HTMLElement|null} Elemento del panel o null si hay error
 */
export function openCookiePreferences() {
  try {
    // Si ya existe un panel abierto, devolverlo
    if (preferencesPanel && document.body.contains(preferencesPanel)) {
      preferencesPanel.style.display = 'flex';
      focusPreferencesPanel();
      return preferencesPanel;
    }
    
    // Crear modal de preferencias
    preferencesPanel = document.createElement('div');
    preferencesPanel.className = 'cookie-preferences-modal';
    preferencesPanel.setAttribute('role', 'dialog');
    preferencesPanel.setAttribute('aria-modal', 'true');
    preferencesPanel.setAttribute('aria-labelledby', 'cookie-prefs-title');
    
    // Obtener consentimiento actual
    const currentConsent = getConsentStatus();
    
    // Contenido del panel
    preferencesPanel.innerHTML = `
      <div class="cookie-preferences-content">
        <h2 id="cookie-prefs-title">Preferencias de Cookies</h2>
        <p>Ajuste sus preferencias de privacidad</p>
        
        <div class="cookie-options">
          <div class="cookie-option">
            <input type="checkbox" id="essential-cookies" checked disabled>
            <label for="essential-cookies">Cookies Esenciales (Requeridas)</label>
            <p>Necesarias para el funcionamiento básico del sitio.</p>
          </div>
          
          <div class="cookie-option">
            <input type="checkbox" id="analytics-cookies" ${currentConsent === ConsentType.FULL ? 'checked' : ''}>
            <label for="analytics-cookies">Cookies Analíticas</label>
            <p>Nos ayudan a entender cómo utiliza el sitio.</p>
          </div>
          
          <div class="cookie-option">
            <input type="checkbox" id="marketing-cookies" ${currentConsent === ConsentType.FULL ? 'checked' : ''}>
            <label for="marketing-cookies">Cookies de Marketing</label>
            <p>Utilizadas para personalizar anuncios.</p>
          </div>
          
          <div class="cookie-option">
            <input type="checkbox" id="preferences-cookies" ${currentConsent === ConsentType.FULL ? 'checked' : ''}>
            <label for="preferences-cookies">Cookies de Preferencias</label>
            <p>Guardan sus preferencias de navegación.</p>
          </div>
        </div>
        
        <div class="cookie-actions">
          <button id="save-preferences" class="btn btn-primary">Guardar preferencias</button>
          <button id="close-preferences" class="btn btn-outline-secondary">Cerrar</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(preferencesPanel);
    
    // Configurar eventos
    setupPreferencesEvents(preferencesPanel);
    
    // Mostrar con animación
    setTimeout(() => {
      preferencesPanel.classList.add('visible');
      focusPreferencesPanel();
    }, 10);
    
    log('Panel de preferencias abierto');
    return preferencesPanel;
  } catch (error) {
    error('Error al abrir panel de preferencias:', error);
    return null;
  }
}

/**
 * Enfoca el primer elemento del panel de preferencias
 */
function focusPreferencesPanel() {
  try {
    if (!preferencesPanel) return;
    
    // Enfocar primer elemento interactivo
    const firstFocusable = preferencesPanel.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      firstFocusable.focus();
    }
  } catch (err) {
    error('Error al enfocar panel:', err);
  }
}

/**
 * Configura eventos del panel de preferencias
 * @param {HTMLElement} panel - Panel de preferencias
 */
function setupPreferencesEvents(panel) {
  try {
    const saveButton = panel.querySelector('#save-preferences');
    const closeButton = panel.querySelector('#close-preferences');
    const analyticsCheckbox = panel.querySelector('#analytics-cookies');
    const marketingCheckbox = panel.querySelector('#marketing-cookies');
    const preferencesCheckbox = panel.querySelector('#preferences-cookies');
    
    // Sincronizar checkboxes
    const syncCheckboxes = (checked) => {
      if (analyticsCheckbox) analyticsCheckbox.checked = checked;
      if (marketingCheckbox) marketingCheckbox.checked = checked;
      if (preferencesCheckbox) preferencesCheckbox.checked = checked;
    };
    
    // Guardar preferencias
    if (saveButton) {
      saveButton.addEventListener('click', () => {
        const allAccepted = (analyticsCheckbox && analyticsCheckbox.checked) ||
                           (marketingCheckbox && marketingCheckbox.checked) ||
                           (preferencesCheckbox && preferencesCheckbox.checked);
        
        const newConsentType = allAccepted ? ConsentType.FULL : ConsentType.ESSENTIAL;
        
        // Guardar consentimiento
        setConsentStatus(newConsentType);
        
        // Inicializar servicios según nuevo consentimiento
        initializeServices(newConsentType);
        
        // Anunciar para lectores de pantalla
        announceToScreenReader(`Preferencias guardadas: ${getConsentDescription(newConsentType)}`);
        
        // Cerrar panel
        closePreferencesPanel();
      });
    }
    
    // Cerrar sin guardar
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        closePreferencesPanel();
      });
    }
    
    // Cerrar con escape
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closePreferencesPanel();
      }
    });
    
    // Configurar trampa de foco
    setupFocusTrap(panel);
    
    // Cerrar al hacer clic fuera
    panel.addEventListener('click', (e) => {
      if (e.target === panel) {
        closePreferencesPanel();
      }
    });
    
    log('Eventos del panel de preferencias configurados');
  } catch (error) {
    error('Error al configurar eventos del panel:', error);
  }
}

/**
 * Cierra el panel de preferencias
 */
function closePreferencesPanel() {
  try {
    if (!preferencesPanel) return;
    
    // Ocultar con animación
    preferencesPanel.classList.remove('visible');
    
    // Remover después de la animación
    setTimeout(() => {
      if (preferencesPanel && preferencesPanel.parentNode) {
        preferencesPanel.parentNode.removeChild(preferencesPanel);
        preferencesPanel = null;
        
        // Devolver foco
        returnFocusAfterPreferences();
      }
    }, CONFIG.ANIMATION_DURATION);
    
    log('Panel de preferencias cerrado');
  } catch (error) {
    error('Error al cerrar panel de preferencias:', error);
    
    // Fallback para asegurar que se cierre
    if (preferencesPanel && preferencesPanel.parentNode) {
      preferencesPanel.parentNode.removeChild(preferencesPanel);
      preferencesPanel = null;
    }
  }
}

/**
 * Devuelve el foco después de cerrar el panel de preferencias
 */
function returnFocusAfterPreferences() {
  try {
    // El elemento que debería recibir el foco
    const mainElement = document.querySelector('[data-cookie-preferences]') || 
                        document.querySelector('main') ||
                        document.body;
    
    if (mainElement && typeof mainElement.focus === 'function') {
      mainElement.focus();
    }
  } catch (err) {
    error('Error al devolver foco después de preferencias:', err);
  }
}

/**
 * Crea un API público para gestionar el consentimiento
 * @returns {Object} API de consentimiento
 */
function createConsentAPI() {
  return {
    /**
     * Obtiene el estado actual de consentimiento
     * @returns {string} Tipo de consentimiento
     */
    getConsent: () => currentConsentType,
    
    /**
     * Actualiza el consentimiento manualmente
     * @param {string} consentType - Tipo de consentimiento
     * @returns {boolean} Resultado de la operación
     */
    updateConsent: (consentType) => {
      if (!Object.values(ConsentType).includes(consentType)) {
        error(`Tipo de consentimiento inválido: ${consentType}`);
        return false;
      }
      
      setConsentStatus(consentType);
      initializeServices(consentType);
      return true;
    },
    
    /**
     * Abre el panel de preferencias
     * @returns {HTMLElement|null} Panel o null si hay error
     */
    openPreferences: openCookiePreferences,
    
    /**
     * Verifica si una categoría tiene consentimiento
     * @param {string} category - Categoría a verificar
     * @returns {boolean} Si la categoría tiene consentimiento
     */
    hasConsent: (category) => {
      // Esenciales siempre tienen consentimiento
      if (category === CookieCategory.ESSENTIAL) return true;
      
      // Para otras categorías, necesita consentimiento completo
      return currentConsentType === ConsentType.FULL;
    },
    
    /**
     * Elimina todos los datos de consentimiento
     * @returns {boolean} Resultado de la operación
     */
    reset: () => {
      try {
        eraseCookie(CONFIG.COOKIE_CONSENT_KEY);
        localStorage.removeItem(CONFIG.COOKIE_CONSENT_KEY);
        currentConsentType = ConsentType.NONE;
        
        // Mostrar banner nuevamente
        if (cookieBanner) {
          setupConsentBanner(cookieBanner);
        }
        
        return true;
      } catch (err) {
        error('Error al resetear consentimiento:', err);
        return false;
      }
    }
  };
}

// Funciones de logging
function log(...args) {
  if (CONFIG.DEBUG) {
    console.log('[Cookie Consent]', ...args);
  }
}

function warn(...args) {
  console.warn('[Cookie Consent]', ...args);
}

function error(...args) {
  console.error('[Cookie Consent]', ...args);
}