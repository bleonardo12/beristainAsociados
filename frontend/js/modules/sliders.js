import { DEFAULT_CONFIG } from './config.js';

export function initSliders() {
    try {
        console.log('[Sliders] Inicializado con:', DEFAULT_CONFIG.animationSpeed);
        const sliders = document.querySelectorAll('.slider-area');
        sliders.forEach(slider => {
            slider.style.opacity = '1';
        });
    } catch (error) {
        console.error('[Sliders] Error:', error);
    }
}