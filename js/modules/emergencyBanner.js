/**
 * Módulo para el banner de emergencia de servicios penales 24h
 */

export function initEmergencyBanner() {
    const emergencyBanner = document.getElementById('emergency-banner');
    const closeButton = document.getElementById('close-emergency-banner');
    
    if (emergencyBanner && closeButton) {
      closeButton.addEventListener('click', () => {
        emergencyBanner.classList.remove('visible');
        document.body.classList.remove('has-emergency-banner');
        
        // Guardar en sessionStorage para que no vuelva a aparecer en esta sesión
        sessionStorage.setItem('emergencyBannerClosed', 'true');
      });
      
      // Verificar si ya lo cerró en esta sesión
      if (!sessionStorage.getItem('emergencyBannerClosed')) {
        emergencyBanner.classList.add('visible');
        document.body.classList.add('has-emergency-banner');
      }
    }
  }