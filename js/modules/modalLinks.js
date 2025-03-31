/**
 * modalLinks.js - Módulo para manejar los enlaces en modales
 * 
 * Gestiona la navegación desde enlaces dentro de modales hacia secciones
 * de la página, con soporte mejorado para accesibilidad y manejo de errores.
 * 
 * @version 2.0
 */

// Configuración por defecto
const DEFAULT_CONFIG = {
  modalLinkSelector: '.modal a[href^="#"], .modal button[data-bs-dismiss="modal"][href^="#"]',
  modalCloseDelay: 300,      // ms a esperar después de cerrar el modal
  highlightDuration: 2000,   // ms que dura el resaltado
  scrollBehavior: 'smooth',  // 'smooth' o 'auto'
  scrollBlock: 'start',      // 'start', 'center', 'end', 'nearest'
  focusTarget: true,         // si se debe enfocar la sección objetivo
  announceToScreenReader: true, // anunciar navegación a lectores de pantalla
  debug: false               // mostrar mensajes de depuración
};

// Variables de estado
let config = { ...DEFAULT_CONFIG };
let activeLinks = new Set();

/**
 * Inicializa el comportamiento de los enlaces en modales
 * @param {Object} options - Opciones de configuración
 * @returns {Object} API para controlar los enlaces de modal
 */
export function initModalLinks(options = {}) {
  try {
    // Combinar opciones con valores predeterminados
    config = { ...DEFAULT_CONFIG, ...options };
    
    log('Inicializando enlaces de modal...');
    
    // Verificar si Bootstrap está disponible
    checkBootstrapAvailability();
    
    // Encontrar todos los enlaces dentro de modales que apuntan a secciones
    const modalLinks = document.querySelectorAll(config.modalLinkSelector);
    
    if (modalLinks.length === 0) {
      log('No se encontraron enlaces de modal');
      return createModalLinksAPI();
    }
    
    // Configurar cada enlace
    modalLinks.forEach(link => {
      setupModalLink(link);
    });
    
    log(`${modalLinks.length} enlaces de modal configurados correctamente`);
    
    // Retornar API pública
    return createModalLinksAPI();
  } catch (error) {
    console.error('Error al inicializar enlaces de modal:', error);
    return createModalLinksAPI();
  }
}

/**
 * Verifica si Bootstrap está disponible
 * @private
 */
function checkBootstrapAvailability() {
  if (typeof bootstrap === 'undefined' || !bootstrap.Modal) {
    console.warn('Bootstrap Modal no detectado. Asegúrese de que Bootstrap esté cargado antes de inicializar modalLinks.');
  }
}

/**
 * Configura un enlace de modal individual
 * @param {HTMLElement} link - Elemento de enlace
 * @private
 */
function setupModalLink(link) {
  try {
    // Verificar si ya está configurado
    if (activeLinks.has(link)) return;
    
    // Función manejadora de eventos
    const handleClick = function(e) {
      handleModalLinkClick(e, this);
    };
    
    // Añadir detector de eventos
    link.addEventListener('click', handleClick);
    
    // Mejorar accesibilidad
    enhanceLinkAccessibility(link);
    
    // Registrar enlace activo para limpieza posterior
    activeLinks.add(link);
    link._modalLinkHandler = handleClick; // Guardar referencia para poder eliminarla después
  } catch (error) {
    console.error('Error al configurar enlace de modal:', error);
  }
}

/**
 * Mejora la accesibilidad del enlace
 * @param {HTMLElement} link - Elemento de enlace
 * @private
 */
function enhanceLinkAccessibility(link) {
  try {
    // Obtener el ID del objetivo
    const targetId = link.getAttribute('href');
    if (!targetId || !targetId.startsWith('#')) return;
    
    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;
    
    // Añadir atributos ARIA mejorados
    link.setAttribute('aria-controls', targetId.substring(1));
    
    // Añadir título descriptivo si no existe
    if (!link.hasAttribute('title')) {
      const targetTitle = getElementTitle(targetElement);
      link.setAttribute('title', `Ir a "${targetTitle}"`);
    }
  } catch (error) {
    console.error('Error al mejorar accesibilidad del enlace:', error);
  }
}

/**
 * Obtiene un título descriptivo para un elemento
 * @param {HTMLElement} element - Elemento para obtener título
 * @returns {string} Título descriptivo
 * @private
 */
function getElementTitle(element) {
  try {
    // Intentar encontrar un encabezado dentro del elemento
    const heading = element.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading && heading.textContent.trim()) {
      return heading.textContent.trim();
    }
    
    // Usar el ID como fallback
    if (element.id) {
      return element.id.replace(/-/g, ' ');
    }
    
    // Último recurso
    return 'la sección seleccionada';
  } catch (error) {
    console.error('Error al obtener título del elemento:', error);
    return 'la sección seleccionada';
  }
}

/**
 * Maneja el clic en un enlace de modal
 * @param {Event} e - Evento de clic
 * @param {HTMLElement} link - Elemento de enlace
 * @private
 */
function handleModalLinkClick(e, link) {
  try {
    // Obtener el ID de la sección a la que se quiere navegar
    const targetId = link.getAttribute('href');
    
    // Si es un enlace interno (comienza con #)
    if (targetId && targetId.startsWith('#')) {
      e.preventDefault(); // Prevenir comportamiento por defecto
      
      // Intentar obtener instancia del modal
      let modal = null;
      try {
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
          modal = bootstrap.Modal.getInstance(document.querySelector('.modal.show'));
        }
      } catch (modalError) {
        console.warn('Error al acceder al modal de Bootstrap:', modalError);
      }
      
      // Referencia al elemento objetivo
      const targetElement = document.querySelector(targetId);
      if (!targetElement) {
        console.warn(`Elemento objetivo no encontrado: ${targetId}`);
        return;
      }
      
      if (modal) {
        // Si hay modal, cerrarlo y luego navegar
        modal.hide();
        
        // Esperar a que se cierre el modal antes de desplazarse
        setTimeout(() => {
          navigateToTarget(targetElement);
        }, config.modalCloseDelay);
      } else {
        // Si no hay modal, navegar directamente
        navigateToTarget(targetElement);
      }
    }
  } catch (error) {
    console.error('Error al manejar clic en enlace de modal:', error);
  }
}

/**
 * Navega al elemento objetivo
 * @param {HTMLElement} targetElement - Elemento objetivo
 * @private
 */
function navigateToTarget(targetElement) {
  try {
    // Desplazarse al elemento
    targetElement.scrollIntoView({ 
      behavior: config.scrollBehavior, 
      block: config.scrollBlock 
    });
    
    // Destacar brevemente la sección
    targetElement.classList.add('highlight-section');
    setTimeout(() => {
      targetElement.classList.remove('highlight-section');
    }, config.highlightDuration);
    
    // Enfocar el elemento si está configurado
    if (config.focusTarget && targetElement.tabIndex < 0) {
      // Hacer que el elemento sea enfocable temporalmente
      targetElement.tabIndex = -1;
    }
    
    if (config.focusTarget) {
      targetElement.focus({ preventScroll: true });
    }
    
    // Anunciar para lectores de pantalla
    if (config.announceToScreenReader) {
      announceNavigation(targetElement);
    }
  } catch (error) {
    console.error('Error al navegar al objetivo:', error);
  }
}

/**
 * Anuncia la navegación para lectores de pantalla
 * @param {HTMLElement} targetElement - Elemento objetivo
 * @private
 */
function announceNavigation(targetElement) {
  try {
    let announcer = document.getElementById('screen-reader-announcer');
    
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'screen-reader-announcer';
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
    
    const targetTitle = getElementTitle(targetElement);
    announcer.textContent = `Navegado a ${targetTitle}`;
    
    // Limpiar después de unos segundos
    setTimeout(() => {
      announcer.textContent = '';
    }, 3000);
  } catch (error) {
    console.error('Error al anunciar navegación:', error);
  }
}

/**
 * Limpia los recursos
 * @private
 */
function cleanup() {
  try {
    // Eliminar todos los event listeners
    activeLinks.forEach(link => {
      if (link._modalLinkHandler) {
        link.removeEventListener('click', link._modalLinkHandler);
      }
    });
    
    // Limpiar conjunto
    activeLinks.clear();
    
    log('Recursos liberados correctamente');
    return true;
  } catch (error) {
    console.error('Error al limpiar recursos:', error);
    return false;
  }
}

/**
 * Registra un mensaje de log
 * @param {string} message - Mensaje a registrar
 * @private
 */
function log(message) {
  if (config.debug) {
    console.log(`[ModalLinks] ${message}`);
  }
}

/**
 * Crea un API para controlar los enlaces de modal
 * @returns {Object} API pública
 * @private
 */
function createModalLinksAPI() {
  return {
    /**
     * Reinicializa todos los enlaces de modal
     * @param {Object} options - Nuevas opciones
     */
    reinit: (options = {}) => {
      cleanup();
      return initModalLinks(options);
    },
    
    /**
     * Libera recursos
     */
    cleanup: cleanup,
    
    /**
     * Actualiza la configuración
     * @param {Object} newConfig - Nueva configuración
     */
    updateConfig: (newConfig = {}) => {
      config = { ...config, ...newConfig };
      return true;
    },
    
    /**
     * Simula clic en un enlace de modal
     * @param {string} linkSelector - Selector del enlace
     */
    simulateClick: (linkSelector) => {
      try {
        const link = document.querySelector(linkSelector);
        if (link) {
          link.click();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error al simular clic:', error);
        return false;
      }
    }
  };
}