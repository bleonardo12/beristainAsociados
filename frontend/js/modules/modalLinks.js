/**
 * modalLinks.js - Módulo para manejar los enlaces en modales
 * @version 2.0.1
 */

const DEFAULT_CONFIG = {
  modalLinkSelector: '.modal a[href^="#"], .modal button[data-bs-dismiss="modal"][href^="#"]',
  modalCloseDelay: 300,
  highlightDuration: 2000,
  scrollBehavior: 'smooth',
  scrollBlock: 'start',
  focusTarget: true,
  announceToScreenReader: true,
  debug: false
};

let config = { ...DEFAULT_CONFIG };
let activeLinks = new Set();

export function initModalLinks(options = {}) {
  try {
    config = { ...DEFAULT_CONFIG, ...options };
    
    const modalLinks = document.querySelectorAll(config.modalLinkSelector);
    
    modalLinks.forEach(link => setupModalLink(link));
    
    return createModalLinksAPI();
  } catch (error) {
    console.error('Error al inicializar enlaces de modal:', error);
    return createModalLinksAPI();
  }
}

function setupModalLink(link) {
  if (activeLinks.has(link)) return;
  
  // Usamos una arrow function como handler para mantener el contexto
  const handler = (e) => handleModalLinkClick(e, link);
  
  link.addEventListener('click', handler);
  enhanceLinkAccessibility(link);
  
  activeLinks.add(link);
  // Almacenamos el handler directamente en el objeto link para poder removerlo
  link._modalLinkHandler = handler;
}

function handleModalLinkClick(e, link) {
  const targetId = link.getAttribute('href');
  if (!targetId || !targetId.startsWith('#')) return;
  
  e.preventDefault();
  
  const targetElement = document.querySelector(targetId);
  if (!targetElement) return;

  // Manejo robusto de Bootstrap Modal
  const modalElement = document.querySelector('.modal.show');
  const modalInstance = modalElement ? bootstrap.Modal.getInstance(modalElement) : null;

  if (modalInstance) {
    modalInstance.hide();
    // Esperar cierre del modal
    setTimeout(() => navigateToTarget(targetElement), config.modalCloseDelay);
  } else {
    navigateToTarget(targetElement);
  }
}

function navigateToTarget(targetElement) {
  targetElement.scrollIntoView({ 
    behavior: config.scrollBehavior, 
    block: config.scrollBlock 
  });
  
  targetElement.classList.add('highlight-section');
  setTimeout(() => targetElement.classList.remove('highlight-section'), config.highlightDuration);
  
  if (config.focusTarget) {
    // Si el elemento no es naturalmente enfocable, le damos un tabindex temporal
    if (targetElement.getAttribute('tabindex') === null) {
      targetElement.setAttribute('tabindex', '-1');
      // Limpiamos el atributo al perder el foco
      targetElement.addEventListener('blur', () => targetElement.removeAttribute('tabindex'), { once: true });
    }
    targetElement.focus({ preventScroll: true });
  }
  
  if (config.announceToScreenReader) announceNavigation(targetElement);
}

function announceNavigation(targetElement) {
  let announcer = document.getElementById('screen-reader-announcer');
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'screen-reader-announcer';
    announcer.className = 'sr-only';
    announcer.setAttribute('aria-live', 'polite');
    Object.assign(announcer.style, { position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' });
    document.body.appendChild(announcer);
  }
  
  const targetTitle = getElementTitle(targetElement);
  announcer.textContent = `Navegado a ${targetTitle}`;
  setTimeout(() => { announcer.textContent = ''; }, 3000);
}

function getElementTitle(element) {
  const heading = element.querySelector('h1, h2, h3, h4, h5, h6');
  return heading?.textContent.trim() || element.id?.replace(/-/g, ' ') || 'la sección seleccionada';
}

function cleanup() {
  activeLinks.forEach(link => {
    if (link._modalLinkHandler) {
      link.removeEventListener('click', link._modalLinkHandler);
      delete link._modalLinkHandler;
    }
  });
  activeLinks.clear();
}

function createModalLinksAPI() {
  return {
    reinit: (options = {}) => { cleanup(); return initModalLinks(options); },
    cleanup,
    updateConfig: (newConfig = {}) => { config = { ...config, ...newConfig }; }
  };
}