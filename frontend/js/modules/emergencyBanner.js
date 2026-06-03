// modules/emergencyBanner.js
export function initEmergencyBanner() {
    const banner = document.querySelector('.emergency-banner');
    const closeButton = document.getElementById('close-emergency-banner');

    if (!banner || !closeButton) return;

    console.log('[EmergencyBanner] Inicializando módulo...');

    closeButton.addEventListener('click', () => {
        console.log('[EmergencyBanner] Cerrando banner de emergencia...');
        
        // Quitar foco antes de ocultar
        closeButton.blur();
        document.body.focus();

        banner.classList.remove('visible');
        banner.setAttribute('aria-hidden', 'true');
    });

    console.log('[EmergencyBanner] Módulo inicializado con soporte A11Y y eventos limpios.');
}