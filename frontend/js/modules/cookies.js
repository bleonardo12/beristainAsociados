/**
 * Módulo para la gestión del consentimiento de cookies
 * Implementa un banner de consentimiento GDPR/CCPA compatible,
 * con almacenamiento de preferencias granulares y gestión de cookies.
 * * @version 3.1
 */

const CONFIG = {
  COOKIE_CONSENT_KEY: 'cookie-consent-v3',
  COOKIE_CONSENT_EXPIRY: 365, // días
  ANIMATION_DURATION: 500, // ms
  BANNER_DELAY: 1000, // ms para mostrar el banner
  ANNOUNCEMENT_DURATION: 3000, // ms para anuncios de accesibilidad
  DEBUG: false
};

const ConsentType = {
  NONE: 'none',
  ESSENTIAL: 'essential',
  PARTIAL: 'partial',
  FULL: 'full'
};

const CookieCategory = {
  ESSENTIAL: 'essential',
  ANALYTICS: 'analytics',
  MARKETING: 'marketing',
  PREFERENCES: 'preferences'
};

// Variables globales del módulo
let currentConsentType = ConsentType.NONE;
let allowedCategories = {
  essential: true,
  analytics: false,
  marketing: false,
  preferences: false
};

let cookieBanner = null;
let preferencesPanel = null;
let bannerVisible = false;

export function initCookieConsent() {
  try {
    log('Inicializando sistema de consentimiento de cookies');
    
    cookieBanner = document.getElementById('cookie-banner');
    
    // 1. Establecer el estado 'default' de Google Consent Mode v2 inmediatamente
    initializeDefaultConsent();

    // 2. Verificar si ya existe consentimiento previo guardado
    const savedConsent = getConsentStatus();
    currentConsentType = savedConsent.type;
    allowedCategories = savedConsent.categories;
    
    setupI18n();
    
    if (currentConsentType === ConsentType.NONE) {
      if (cookieBanner) {
        setupConsentBanner(cookieBanner);
      } else {
        warn('Banner de cookies no encontrado en el DOM');
      }
    } else {
      log(`Consentimiento existente: ${currentConsentType}`, allowedCategories);
      applyConsentToServices(allowedCategories);
    }
    
    setupPreferencesLinks();
    
    return createConsentAPI();
  } catch (error) {
    console.error('[Cookie Consent] Error al inicializar sistema de cookies:', error);
    return createConsentAPI();
  }
}

/**
 * Inicializa Google Consent Mode v2 con valores denegados por defecto
 */
function initializeDefaultConsent() {
  if (typeof gtag === 'function') {
    gtag('consent', 'default', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'personalization_storage': 'denied',
      'wait_for_update': 500
    });
    log('Consent Mode v2 seteado por defecto: DENIED');
  }
}

function setupPreferencesLinks() {
  const links = document.querySelectorAll('[data-cookie-preferences]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openCookiePreferences();
    });
  });
}

function setupI18n() {
  const lang = document.documentElement.lang || 'es';
  log(`Idioma detectado: ${lang}`);
}

function setupConsentBanner(banner) {
  try {
    const acceptButton = document.getElementById('accept-cookies');
    const rejectButton = document.getElementById('reject-cookies');
    
    if (!acceptButton || !rejectButton) {
      warn('Botones del banner de cookies no encontrados');
      return;
    }
    
    acceptButton.setAttribute('aria-describedby', 'cookie-banner-description');
    rejectButton.setAttribute('aria-describedby', 'cookie-banner-description');
    
    setTimeout(() => {
      showBanner(banner);
    }, CONFIG.BANNER_DELAY);
    
    // Aceptar Todo
    acceptButton.addEventListener('click', () => {
      const fullCategories = { essential: true, analytics: true, marketing: true, preferences: true };
      handleConsentChoice(ConsentType.FULL, fullCategories);
    });
    
    // Rechazar Todo (Solo Esenciales)
    rejectButton.addEventListener('click', () => {
      const essentialCategories = { essential: true, analytics: false, marketing: false, preferences: false };
      handleConsentChoice(ConsentType.ESSENTIAL, essentialCategories);
    });
    
    setupFocusTrap(banner);
    document.addEventListener('keydown', handleEscapeKey);
  } catch (error) {
    console.error('[Cookie Consent] Error al configurar banner:', error);
  }
}

function handleConsentChoice(consentType, categories) {
  try {
    saveConsentToStorage(consentType, categories);
    
    currentConsentType = consentType;
    allowedCategories = categories;
    
    hideBanner(cookieBanner);
    applyConsentToServices(categories);
    
    announceToScreenReader(`Preferencias de cookies actualizadas.`);
    log(`Usuario eligió tipo: ${consentType}`, categories);
  } catch (err) {
    console.error('[Cookie Consent] Error al procesar elección:', err);
  }
}

function setupFocusTrap(container) {
  try {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length < 2) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
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
    console.error('[Cookie Consent] Error en trampa de foco:', err);
  }
}

function handleEscapeKey(e) {
  if (e.key === 'Escape' && bannerVisible) {
    const essentialCategories = { essential: true, analytics: false, marketing: false, preferences: false };
    handleConsentChoice(ConsentType.ESSENTIAL, essentialCategories);
  }
}

function showBanner(banner) {
  banner.style.display = 'block';
  banner.style.opacity = '0';
  banner.style.transform = 'translateY(100%)';
  
  banner.offsetHeight; // Reflow
  
  banner.classList.add('visible');
  bannerVisible = true;
  
  announceToScreenReader('Aviso importante sobre cookies y privacidad');
  
  setTimeout(() => {
    const firstButton = banner.querySelector('button');
    if (firstButton) firstButton.focus();
  }, 100);
}

function hideBanner(banner) {
  if (!banner) return;
  banner.style.transition = `transform ${CONFIG.ANIMATION_DURATION}ms ease-in-out, opacity ${CONFIG.ANIMATION_DURATION}ms ease-in-out`;
  banner.classList.remove('visible');
  bannerVisible = false;
  
  setTimeout(() => {
    banner.style.display = 'none';
    returnFocusAfterBanner();
  }, CONFIG.ANIMATION_DURATION);
}

function returnFocusAfterBanner() {
  const mainContent = document.querySelector('main h1') || document.querySelector('main') || document.body;
  if (mainContent && typeof mainContent.focus === 'function') {
    mainContent.focus();
  }
}

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
    
    ariaElement.textContent = '';
    setTimeout(() => { ariaElement.textContent = message; }, 100);
    setTimeout(() => { ariaElement.textContent = ''; }, CONFIG.ANNOUNCEMENT_DURATION);
  } catch (error) {
    console.error('[Cookie Consent] Error en aria-live:', error);
  }
}

function saveConsentToStorage(consentType, categories) {
  try {
    const consentData = {
      type: consentType,
      categories: categories,
      timestamp: new Date().toISOString(),
      version: '3.1'
    };
    
    const consentJson = JSON.stringify(consentData);
    setCookie(CONFIG.COOKIE_CONSENT_KEY, consentJson, CONFIG.COOKIE_CONSENT_EXPIRY);
    
    try {
      localStorage.setItem(CONFIG.COOKIE_CONSENT_KEY, consentJson);
    } catch (e) {
      warn('Storage bloqueado o lleno.');
    }
    return true;
  } catch (error) {
    console.error('[Cookie Consent] Error al guardar estructurado:', error);
    return false;
  }
}

function getConsentStatus() {
  const defaultFallback = {
    type: ConsentType.NONE,
    categories: { essential: true, analytics: false, marketing: false, preferences: false }
  };

  try {
    const cookieValue = getCookie(CONFIG.COOKIE_CONSENT_KEY);
    if (cookieValue) {
      const data = JSON.parse(cookieValue);
      if (data.categories) return data;
    }
    
    const localData = localStorage.getItem(CONFIG.COOKIE_CONSENT_KEY);
    if (localData) {
      const data = JSON.parse(localData);
      if (data.categories) {
        setCookie(CONFIG.COOKIE_CONSENT_KEY, localData, CONFIG.COOKIE_CONSENT_EXPIRY);
        return data;
      }
    }
  } catch (e) {
    warn('Error al parsear storage, aplicando fallback por defecto.');
  }
  return defaultFallback;
}

/**
 * Aplica de forma granular los permisos del usuario a las APIs de terceros
 */
function applyConsentToServices(categories) {
  try {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        'analytics_storage': categories.analytics ? 'granted' : 'denied',
        'ad_storage': categories.marketing ? 'granted' : 'denied',
        'ad_user_data': categories.marketing ? 'granted' : 'denied',
        'ad_personalization': categories.marketing ? 'granted' : 'denied',
        'personalization_storage': categories.preferences ? 'granted' : 'denied'
      });
      log('Google Consent Mode v2 actualizado de forma granular:', categories);
    }

    if (typeof fbq === 'function') {
      fbq('consent', categories.marketing ? 'grant' : 'revoke');
      log('Facebook Pixel consent actualizado:', categories.marketing);
    }
  } catch (err) {
    console.error('[Cookie Consent] Error aplicando tags granulares:', err);
  }
}

function setCookie(name, value, days) {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; samesite=lax; secure';
  return true;
}

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

function eraseCookie(name) {
  document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; samesite=lax; secure';
  return true;
}

export function openCookiePreferences() {
  try {
    if (preferencesPanel && document.body.contains(preferencesPanel)) {
      preferencesPanel.style.display = 'flex';
      focusPreferencesPanel();
      return preferencesPanel;
    }
    
    preferencesPanel = document.createElement('div');
    preferencesPanel.className = 'cookie-preferences-modal';
    preferencesPanel.setAttribute('role', 'dialog');
    preferencesPanel.setAttribute('aria-modal', 'true');
    preferencesPanel.setAttribute('aria-labelledby', 'cookie-prefs-title');
    
    // Obtener las categorías que están permitidas actualmente
    const currentStatus = getConsentStatus();
    const cats = currentStatus.categories;
    
    preferencesPanel.innerHTML = `
      <div class="cookie-preferences-content">
        <h2 id="cookie-prefs-title">Preferencias de Cookies</h2>
        <p>Ajuste sus preferencias de privacidad de forma individual</p>
        
        <div class="cookie-options">
          <div class="cookie-option">
            <input type="checkbox" id="essential-cookies" checked disabled>
            <label for="essential-cookies">Cookies Esenciales (Requeridas)</label>
            <p>Necesarias para el funcionamiento básico del sitio.</p>
          </div>
          
          <div class="cookie-option">
            <input type="checkbox" id="analytics-cookies" ${cats.analytics ? 'checked' : ''}>
            <label for="analytics-cookies">Cookies Analíticas</label>
            <p>Nos ayudan a entender cómo utiliza el sitio de forma anónima.</p>
          </div>
          
          <div class="cookie-option">
            <input type="checkbox" id="marketing-cookies" ${cats.marketing ? 'checked' : ''}>
            <label for="marketing-cookies">Cookies de Marketing</label>
            <p>Utilizadas para medir el rendimiento de anuncios de Google Ads.</p>
          </div>
          
          <div class="cookie-option">
            <input type="checkbox" id="preferences-cookies" ${cats.preferences ? 'checked' : ''}>
            <label for="preferences-cookies">Cookies de Preferencias</label>
            <p>Guardan configuraciones de personalización del sitio.</p>
          </div>
        </div>
        
        <div class="cookie-actions">
          <button id="save-preferences" class="btn btn-primary">Guardar preferencias</button>
          <button id="close-preferences" class="btn btn-outline-secondary">Cerrar</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(preferencesPanel);
    setupPreferencesEvents(preferencesPanel);
    
    setTimeout(() => {
      preferencesPanel.classList.add('visible');
      focusPreferencesPanel();
    }, 10);
    
    return preferencesPanel;
  } catch (error) {
    console.error('[Cookie Consent] Error abriendo panel:', error);
    return null;
  }
}

function focusPreferencesPanel() {
  if (!preferencesPanel) return;
  const firstFocusable = preferencesPanel.querySelector('button, input:not([disabled])');
  if (firstFocusable) firstFocusable.focus();
}

function setupPreferencesEvents(panel) {
  try {
    const saveButton = panel.querySelector('#save-preferences');
    const closeButton = panel.querySelector('#close-preferences');
    
    if (saveButton) {
      saveButton.addEventListener('click', () => {
        const analyticsChecked = !!panel.querySelector('#analytics-cookies')?.checked;
        const marketingChecked = !!panel.querySelector('#marketing-cookies')?.checked;
        const preferencesChecked = !!panel.querySelector('#preferences-cookies')?.checked;
        
        const newCategories = {
          essential: true,
          analytics: analyticsChecked,
          marketing: marketingChecked,
          preferences: preferencesChecked
        };
        
        // Determinar el nivel de consentimiento en base a una evaluación real (AND)
        let newType = ConsentType.PARTIAL;
        if (analyticsChecked && marketingChecked && preferencesChecked) {
          newType = ConsentType.FULL;
        } else if (!analyticsChecked && !marketingChecked && !preferencesChecked) {
          newType = ConsentType.ESSENTIAL;
        }
        
        handleConsentChoice(newType, newCategories);
        closePreferencesPanel();
      });
    }
    
    if (closeButton) {
      closeButton.addEventListener('click', () => closePreferencesPanel());
    }
    
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePreferencesPanel();
    });
    
    setupFocusTrap(panel);
    
    panel.addEventListener('click', (e) => {
      if (e.target === panel) closePreferencesPanel();
    });
  } catch (error) {
    console.error('[Cookie Consent] Error al enlazar eventos de modal:', error);
  }
}

function closePreferencesPanel() {
  if (!preferencesPanel) return;
  preferencesPanel.classList.remove('visible');
  setTimeout(() => {
    if (preferencesPanel && preferencesPanel.parentNode) {
      preferencesPanel.parentNode.removeChild(preferencesPanel);
      preferencesPanel = null;
      returnFocusAfterPreferences();
    }
  }, CONFIG.ANIMATION_DURATION);
}

function returnFocusAfterPreferences() {
  const mainElement = document.querySelector('[data-cookie-preferences]') || document.body;
  if (mainElement && typeof mainElement.focus === 'function') mainElement.focus();
}

function createConsentAPI() {
  return {
    getConsent: () => currentConsentType,
    getAllowedCategories: () => ({ ...allowedCategories }),
    updateConsent: (consentType, customCategories = null) => {
      let cats = customCategories;
      if (!cats) {
        cats = consentType === ConsentType.FULL 
          ? { essential: true, analytics: true, marketing: true, preferences: true }
          : { essential: true, analytics: false, marketing: false, preferences: false };
      }
      saveConsentToStorage(consentType, cats);
      applyConsentToServices(cats);
      currentConsentType = consentType;
      allowedCategories = cats;
      return true;
    },
    openPreferences: openCookiePreferences,
    hasConsent: (category) => {
      if (category === CookieCategory.ESSENTIAL) return true;
      return !!allowedCategories[category];
    },
    reset: () => {
      try {
        eraseCookie(CONFIG.COOKIE_CONSENT_KEY);
        localStorage.removeItem(CONFIG.COOKIE_CONSENT_KEY);
        currentConsentType = ConsentType.NONE;
        allowedCategories = { essential: true, analytics: false, marketing: false, preferences: false };
        if (cookieBanner) setupConsentBanner(cookieBanner);
        return true;
      } catch (err) {
        return false;
      }
    }
  };
}

function log(...args) {
  if (CONFIG.DEBUG) console.log('[Cookie Consent]', ...args);
}

function warn(...args) {
  console.warn('[Cookie Consent]', ...args);
}