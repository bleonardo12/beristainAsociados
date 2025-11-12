/**
 * Módulo para el banner de emergencia de servicios penales 24h
 */

export function initEmergencyBanner() {
    const emergencyBanner = document.getElementById('emergency-banner');
    const closeButton = document.getElementById('close-emergency-banner');

    console.log('[EmergencyBanner] Inicializando...', { emergencyBanner, closeButton });

    if (emergencyBanner && closeButton) {
      // Asegurar que el botón sea clickeable forzando estilos
      closeButton.style.pointerEvents = 'all';
      closeButton.style.cursor = 'pointer';
      closeButton.style.zIndex = '99999';
      closeButton.style.position = 'absolute';

      // Agregar múltiples event listeners para asegurar que funcione
      closeButton.addEventListener('click', handleClose, true);
      closeButton.addEventListener('touchend', handleClose, true);
      closeButton.addEventListener('mouseup', handleClose, true);

      function handleClose(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[EmergencyBanner] Botón X clickeado!');

        emergencyBanner.classList.remove('visible');
        emergencyBanner.style.display = 'none';
        document.body.classList.remove('has-emergency-banner');

        // Guardar en sessionStorage para que no vuelva a aparecer en esta sesión
        sessionStorage.setItem('emergencyBannerClosed', 'true');
      }

      // Log para verificar que el event listener se registró
      console.log('[EmergencyBanner] Event listeners registrados correctamente');

      // Verificar si ya lo cerró en esta sesión
      if (!sessionStorage.getItem('emergencyBannerClosed')) {
        emergencyBanner.classList.add('visible');
        document.body.classList.add('has-emergency-banner');
      } else {
        emergencyBanner.style.display = 'none';
      }
    } else {
      console.error('[EmergencyBanner] No se encontró el banner o el botón en el DOM');
    }
  }