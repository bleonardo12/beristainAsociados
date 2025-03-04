/**
 * Módulo para la gestión del consentimiento de cookies
 * Implementa un banner de consentimiento GDPR/CCPA compatible,
 * con almacenamiento de preferencias y gestión de cookies.
 */

// Constantes de configuración
const COOKIE_CONSENT_KEY = 'cookie-consent-v2';
const COOKIE_CONSENT_EXPIRY = 365; // días

/**
 * Tipos de consentimiento posibles
 */
const ConsentType = {
  NONE: 'none',    // No se ha dado consentimiento
  ESSENTIAL: 'essential', // Solo cookies esenciales
  FULL: 'full'     // Todas las cookies (incluyendo analíticas y marketing)
};

/**
 * Inicializa el sistema de consentimiento de cookies
 */
export function initCookieConsent() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  
  // Verificar si ya existe consentimiento
  const existingConsent = getConsentStatus();
  
  if (existingConsent === ConsentType.NONE) {
    // Mostrar banner si no hay consentimiento previo
    setupConsentBanner(banner);
  } else {
    // Inicializar servicios según el consentimiento existente
    initializeServices(existingConsent);
  }
}

/**
 * Configura el banner de consentimiento y sus controles
 */
function setupConsentBanner(banner) {
  const acceptButton = document.getElementById('accept-cookies');
  const rejectButton = document.getElementById('reject-cookies');
  
  if (!acceptButton || !rejectButton) return;
  
  // Mostrar banner con animación
  setTimeout(() => {
    banner.classList.add('visible');
    
    // Anunciar para lectores de pantalla
    const ariaElement = document.createElement('div');
    ariaElement.setAttribute('role', 'status');
    ariaElement.setAttribute('aria-live', 'polite');
    ariaElement.className = 'visually-hidden';
    ariaElement.textContent = 'Aviso importante sobre cookies y privacidad';
    document.body.appendChild(ariaElement);
    
    setTimeout(() => ariaElement.remove(), 3000);
  }, 1000);
  
  // Configurar botón de aceptar
  acceptButton.addEventListener('click', () => {
    setConsentStatus(ConsentType.FULL);
    hideBanner(banner);
    initializeServices(ConsentType.FULL);
  });
  
  // Configurar botón de rechazar no esenciales
  rejectButton.addEventListener('click', () => {
    setConsentStatus(ConsentType.ESSENTIAL);
    hideBanner(banner);
    initializeServices(ConsentType.ESSENTIAL);
  });
}

/**
 * Oculta el banner con animación
 */
function hideBanner(banner) {
  banner.style.transition = 'transform 0.5s ease-in-out';
  banner.classList.remove('visible');
  
  // Permitir que la animación termine antes de ocultar completamente
  setTimeout(() => {
    banner.style.display = 'none';
  }, 500);
}

/**
 * Guarda el estado de consentimiento en una cookie
 */
function setConsentStatus(consentType) {
  // Crear objeto con información de consentimiento
  const consentData = {
    type: consentType,
    timestamp: new Date().toISOString(),
    version: '2.0'
  };
  
  // Guardar como cookie
  setCookie(COOKIE_CONSENT_KEY, JSON.stringify(consentData), COOKIE_CONSENT_EXPIRY);
  
  // También guardar en localStorage como respaldo
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
  } catch (e) {
    console.warn('No se pudo guardar en localStorage', e);
  }
}

/**
 * Obtiene el estado actual de consentimiento
 */
function getConsentStatus() {
  // Intentar leer desde cookie
  const cookieValue = getCookie(COOKIE_CONSENT_KEY);
  
  if (cookieValue) {
    try {
      const data = JSON.parse(cookieValue);
      return data.type || ConsentType.NONE;
    } catch (e) {
      // Error al parsear JSON
      return ConsentType.NONE;
    }
  }
  
  // Si no hay cookie, intentar leer desde localStorage
  try {
    const localData = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (localData) {
      const data = JSON.parse(localData);
      
      // Sincronizar con cookie por si acaso
      setCookie(COOKIE_CONSENT_KEY, localData, COOKIE_CONSENT_EXPIRY);
      
      return data.type || ConsentType.NONE;
    }
  } catch (e) {
    console.warn('Error al leer localStorage', e);
  }
  
  return ConsentType.NONE;
}

/**
 * Inicializa servicios según el nivel de consentimiento
 */
function initializeServices(consentType) {
  // Siempre se cargan servicios esenciales
  initializeEssentialServices();
  
  // Servicios adicionales si hay consentimiento completo
  if (consentType === ConsentType.FULL) {
    initializeMarketingServices();
    initializeAnalyticsServices();
  }
}

/**
 * Inicializa servicios esenciales (siempre permitidos)
 */
function initializeEssentialServices() {
  // Implementar lógica para servicios esenciales
  console.log('Servicios esenciales inicializados');
}

/**
 * Inicializa servicios de analítica (solo con consentimiento completo)
 */
function initializeAnalyticsServices() {
  // Implementar lógica para Google Analytics o similares
  if (typeof gtag === 'function') {
    gtag('consent', 'update', {
      'analytics_storage': 'granted'
    });
    console.log('Servicios de analítica inicializados');
  }
}

/**
 * Inicializa servicios de marketing (solo con consentimiento completo)
 */
function initializeMarketingServices() {
  // Implementar lógica para cookies de marketing
  if (typeof gtag === 'function') {
    gtag('consent', 'update', {
      'ad_storage': 'granted',
      'personalization_storage': 'granted'
    });
    console.log('Servicios de marketing inicializados');
  }
}

/**
 * Establece una cookie con los parámetros especificados
 */
function setCookie(name, value, days) {
  let expires = '';
  
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = '; expires=' + date.toUTCString();
  }
  
  // Establecer cookie segura con samesite
  document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; samesite=lax; secure';
}

/**
 * Obtiene el valor de una cookie por su nombre
 */
function getCookie(name) {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  
  return null;
}

/**
 * Elimina una cookie por su nombre
 */
function eraseCookie(name) {
  document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; samesite=lax; secure';
}

/**
 * Función pública para gestionar el panel de preferencias de cookies
 * (Se puede llamar desde otros módulos o un panel de preferencias)
 */
export function openCookiePreferences() {
  // Implementar lógica para mostrar un panel de preferencias más detallado
  // Esta funcionalidad se puede expandir según sea necesario
  console.log('Abrir panel de preferencias avanzadas');
  
  // Ejemplo: Crear un modal para gestionar cookies
  const preferencesModal = document.createElement('div');
  preferencesModal.className = 'cookie-preferences-modal';
  preferencesModal.innerHTML = `
    <div class="cookie-preferences-content">
      <h2>Preferencias de Cookies</h2>
      <p>Ajuste sus preferencias de privacidad</p>
      
      <div class="cookie-options">
        <div class="cookie-option">
          <input type="checkbox" id="essential-cookies" checked disabled>
          <label for="essential-cookies">Cookies Esenciales (Requeridas)</label>
          <p>Necesarias para el funcionamiento básico del sitio.</p>
        </div>
        
        <div class="cookie-option">
          <input type="checkbox" id="analytics-cookies">
          <label for="analytics-cookies">Cookies Analíticas</label>
          <p>Nos ayudan a entender cómo utiliza el sitio.</p>
        </div>
        
        <div class="cookie-option">
          <input type="checkbox" id="marketing-cookies">
          <label for="marketing-cookies">Cookies de Marketing</label>
          <p>Utilizadas para personalizar anuncios.</p>
        </div>
      </div>
      
      <div class="cookie-actions">
        <button id="save-preferences">Guardar preferencias</button>
        <button id="close-preferences">Cerrar</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(preferencesModal);
  
  // Implementar lógica para guardar preferencias
  // ...
  
  return preferencesModal;
}