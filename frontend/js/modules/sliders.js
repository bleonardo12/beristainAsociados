/**
 * Módulo de gestión del carrusel principal (v2.1)
 * Optimizado con AbortController e IntersectionObserver
 */

// ... (DEFAULT_CONFIG se mantiene igual)

export function initSliders(options = {}) {
  const config = { ...DEFAULT_CONFIG, ...options };
  const sliderArea = document.querySelector(config.sliderSelector);
  
  if (!sliderArea) return createEmptySliderAPI();

  // AbortController para limpieza masiva de eventos
  const abortController = new AbortController();
  const { signal } = abortController;

  const state = {
    // ... estado inicial (se mantiene igual)
    abortController,
    signal
  };

  // Implementación de IntersectionObserver para pausa automática
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (state.isPlaying) startAutoplay(state);
      } else {
        stopAutoplay(state);
      }
    });
  }, { threshold: 0.1 });
  
  observer.observe(sliderArea);

  // Setup unificado usando la señal de aborto
  setupSliderStructure(state);
  if (config.createControls) state.controls = createSliderControls(state);
  // ... (resto de las llamadas a setup se mantienen)

  // Ejemplo de cómo aplicar el nuevo criterio de listeners:
  sliderArea.addEventListener('touchstart', touchStartHandler, { passive: true, signal });

  return createSliderAPI(state);
}

/**
 * Método de destrucción ultra-eficiente
 */
function destroySlider(state) {
  // Limpia todos los eventos ligados al AbortController
  state.abortController.abort();
  stopAutoplay(state);
  // ... (limpieza adicional de referencias)
  log('Slider destruido y recursos liberados');
}