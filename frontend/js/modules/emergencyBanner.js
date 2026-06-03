/**
 * Módulo para el banner de emergencia de servicios penales 24h
 * Optimizado para rendimiento, accesibilidad (A11Y) y control de flujo limpio.
 * * @version 1.1
 */

export function initEmergencyBanner() {
  const emergencyBanner = document.getElementById('emergency-banner');
  const closeButton = document.getElementById('close-emergency-banner');

  if (!emergencyBanner || !closeButton) {
    console.warn('[EmergencyBanner] Elementos del banner no encontrados en el DOM.');
    return;
  }

  console.log('[EmergencyBanner] Inicializando módulo...');

  // 1. Verificar el estado de la sesión antes de mostrar el banner
  const isClosedInSession = sessionStorage.getItem('emergencyBannerClosed') === 'true';

  if (isClosedInSession) {
    emergencyBanner.classList.remove('visible');
    emergencyBanner.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('has-emergency-banner');
  } else {
    emergencyBanner.classList.add('visible');
    emergencyBanner.setAttribute('aria-hidden', 'false');
    document.body.classList.add('has-emergency-banner');
  }

  // 2. Manejador de cierre unificado y limpio
  function closeBanner() {
    console.log('[EmergencyBanner] Cerrando banner de emergencia...');

    emergencyBanner.classList.remove('visible');
    emergencyBanner.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('has-emergency-banner');

    // Persistir la elección en la sesión del usuario
    sessionStorage.setItem('emergencyBannerClosed', 'true');

    // Devolver el foco a la página por accesibilidad
    document.body.focus();

    // Limpiar el evento global de teclado
    document.removeEventListener('keydown', handleEscapeKey);
  }

  // 3. Callback del evento click (maneja móviles y desktop de forma nativa)
  function handleCloseEvent(e) {
    e.preventDefault();
    e.stopPropagation();
    closeBanner();
  }

  // 4. Soporte para cerrar con la tecla Escape
  function handleEscapeKey(e) {
    if (e.key === 'Escape' && emergencyBanner.classList.contains('visible')) {
      closeBanner();
    }
  }

  // 5. Registro de Event Listeners (Unificados)
  // El evento 'click' nativo es completamente seguro en mobile hoy en día sin demoras (delay) de 300ms
  closeButton.addEventListener('click', handleCloseEvent);
  document.addEventListener('keydown', handleEscapeKey);

  // Asegurar semántica mínima de accesibilidad al botón si es un tag <a> o <div>
  if (closeButton.tagName !== 'BUTTON') {
    closeButton.setAttribute('role', 'button');
    if (!closeButton.getAttribute('tabindex')) {
      closeButton.setAttribute('tabindex', '0');
    }
    // Permitir activar con la tecla Enter o Espacio si no es un botón nativo
    closeButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        closeBanner();
      }
    });
  }

  console.log('[EmergencyBanner] Módulo inicializado con soporte A11Y y eventos limpios.');
}