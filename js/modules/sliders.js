/**
 * Módulo para la gestión del carrusel principal (slider-area)
 * Implementa un carrusel accesible, responsive con controles
 * de navegación, autoplay y soporte táctil.
 * 
 * @version 2.0
 */

// Configuración por defecto
const DEFAULT_CONFIG = {
  autoplayDelay: 5000,          // Tiempo entre slides en autoplay (ms)
  autoplayRestartDelay: 10000,  // Tiempo para reiniciar autoplay tras interacción (ms)
  transitionDuration: 600,      // Duración de las transiciones (ms)
  swipeThreshold: 50,           // Umbral para detectar swipes (px)
  sliderSelector: '.slider-area', // Selector para el contenedor del slider
  slideSelector: '.single-slider', // Selector para cada slide
  initialSlide: 0,              // Índice del slide inicial
  autoplay: true,               // Si debe iniciar con autoplay
  createControls: true,         // Si debe crear controles de navegación
  createIndicators: true,       // Si debe crear indicadores
  enableKeyboard: true,         // Si debe habilitar navegación por teclado
  enableTouch: true,            // Si debe habilitar soporte táctil
  pauseOnHover: true,           // Si debe pausar al hacer hover
  respectReducedMotion: true,   // Si debe respetar preferencia de reducción de movimiento
  animationDirection: true,     // Si debe animar según dirección (true) o fade (false)
  debug: false                  // Modo debug
};

// Variables para estado global
let sliders = [];
let slideInterval = null;

/**
 * Inicializa el carrusel con opciones personalizadas
 * @param {Object} options - Opciones de configuración
 * @returns {Object} API para controlar el slider
 */
export function initSliders(options = {}) {
  try {
    // Combinar opciones con valores predeterminados
    const config = { ...DEFAULT_CONFIG, ...options };
    
    // Buscar contenedor del slider
    const sliderArea = document.querySelector(config.sliderSelector);
    if (!sliderArea) {
      console.warn(`Slider no encontrado con selector: ${config.sliderSelector}`);
      return createEmptySliderAPI();
    }
    
    log('Inicializando slider...', config);
    
    // Detectar preferencia de reducción de movimiento
    const prefersReducedMotion = 
      config.respectReducedMotion && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Buscar slides
    const slides = sliderArea.querySelectorAll(config.slideSelector);
    if (slides.length <= 1) {
      // Si solo hay un slide o ninguno, solo mostrar el primero
      if (slides.length === 1) {
        slides[0].classList.add('active');
        setupSlideForAccessibility(slides[0], 0, 1);
      }
      log('Slider inicializado con un solo slide o ninguno');
      return createEmptySliderAPI();
    }
    
    // Estado del slider
    const state = {
      currentSlide: config.initialSlide >= 0 && config.initialSlide < slides.length ? 
                    config.initialSlide : 0,
      isPlaying: config.autoplay,
      autoplayTimer: null,
      isTouching: false,
      isTransitioning: false,
      slides: Array.from(slides),
      controls: {
        prevButton: null,
        nextButton: null,
        playPauseButton: null
      },
      indicators: [],
      eventListeners: [],
      sliderArea,
      config,
      prefersReducedMotion
    };
    
    // Configurar estructura y accesibilidad
    setupSliderStructure(state);
    
    // Crear controles del slider si está habilitado
    if (config.createControls) {
      state.controls = createSliderControls(state);
    }
    
    // Crear indicadores de posición si está habilitado
    if (config.createIndicators) {
      state.indicators = createSliderIndicators(state);
    }
    
    // Configurar eventos para controles e indicadores
    setupControlEvents(state);
    
    // Configurar navegación por teclado si está habilitada
    if (config.enableKeyboard) {
      setupKeyboardNavigation(state);
    }
    
    // Configurar soporte táctil si está habilitado
    if (config.enableTouch) {
      setupTouchSupport(state);
    }
    
    // Configurar comportamiento de hover/focus si está habilitado
    if (config.pauseOnHover) {
      setupHoverBehavior(state);
    }
    
    // Mostrar primer slide
    showSlide(state, state.currentSlide);
    
    // Iniciar autoplay si está habilitado
    if (state.isPlaying) {
      startAutoplay(state);
    }
    
    // Manejar cambios de visibilidad de página
    setupVisibilityHandling(state);
    
    // Manejar cambios en preferencia de movimiento
    setupMotionPreferenceHandling(state);
    
    // Guardar referencia al slider
    const sliderId = `slider-${Date.now()}`;
    sliderArea.dataset.sliderId = sliderId;
    sliders.push({ id: sliderId, state });
    
    log(`Slider inicializado con ${slides.length} slides`);
    
    // Retornar API pública
    return createSliderAPI(state);
  } catch (error) {
    console.error('Error al inicializar slider:', error);
    return createEmptySliderAPI();
  }
}

/**
 * Configura la estructura base del slider y mejora accesibilidad
 * @param {Object} state - Estado del slider
 * @private
 */
function setupSliderStructure(state) {
  try {
    const { sliderArea, slides, config } = state;
    
    // Añadir roles ARIA para accesibilidad
    sliderArea.setAttribute('role', 'region');
    sliderArea.setAttribute('aria-roledescription', 'carrusel');
    sliderArea.setAttribute('aria-label', 'Socios fundadores');
    
    // Optimizar para animaciones
    if (!state.prefersReducedMotion) {
      sliderArea.style.willChange = 'contents';
    }
    
    // Crear contenedor para anuncios de lector de pantalla
    let liveRegion = sliderArea.querySelector('.slider-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.className = 'sr-only slider-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.id = `slider-announcer-${Date.now()}`;
      sliderArea.appendChild(liveRegion);
    }
    
    // Configurar cada slide
    slides.forEach((slide, index) => {
      setupSlideForAccessibility(slide, index, slides.length);
      
      // Optimizar para animaciones
      if (!state.prefersReducedMotion) {
        slide.style.willChange = 'transform, opacity';
      }
    });
    
    log('Estructura del slider configurada');
  } catch (error) {
    console.error('Error al configurar estructura del slider:', error);
  }
}

/**
 * Configura un slide para accesibilidad
 * @param {HTMLElement} slide - Elemento del slide
 * @param {number} index - Índice del slide
 * @param {number} total - Total de slides
 * @private
 */
function setupSlideForAccessibility(slide, index, total) {
  try {
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `Slide ${index + 1} de ${total}`);
    slide.setAttribute('aria-hidden', index !== 0 ? 'true' : 'false');
  } catch (error) {
    console.error('Error al configurar accesibilidad del slide:', error);
  }
}

/**
 * Crea los controles de navegación para el slider
 * @param {Object} state - Estado del slider
 * @returns {Object} Botones de control
 * @private
 */
function createSliderControls(state) {
  try {
    const { sliderArea, slides } = state;
    
    // Buscar contenedor existente o crear uno nuevo
    let controls = sliderArea.querySelector('.slider-controls');
    if (!controls) {
      controls = document.createElement('div');
      controls.className = 'slider-controls';
      sliderArea.appendChild(controls);
    } else {
      // Limpiar controles existentes
      controls.innerHTML = '';
    }
    
    // Crear botones de navegación
    const prevButton = document.createElement('button');
    prevButton.className = 'slider-control prev-button';
    prevButton.innerHTML = '<i class="bi bi-chevron-left"></i>';
    prevButton.setAttribute('aria-label', 'Slide anterior');
    prevButton.type = 'button';
    
    const nextButton = document.createElement('button');
    nextButton.className = 'slider-control next-button';
    nextButton.innerHTML = '<i class="bi bi-chevron-right"></i>';
    nextButton.setAttribute('aria-label', 'Siguiente slide');
    nextButton.type = 'button';
    
    const playPauseButton = document.createElement('button');
    playPauseButton.className = 'slider-control play-pause-button';
    playPauseButton.innerHTML = '<i class="bi bi-pause-fill"></i>';
    playPauseButton.setAttribute('aria-label', 'Pausar presentación');
    playPauseButton.type = 'button';
    
    controls.appendChild(prevButton);
    controls.appendChild(playPauseButton);
    controls.appendChild(nextButton);
    
    log('Controles del slider creados');
    return { prevButton, nextButton, playPauseButton };
  } catch (error) {
    console.error('Error al crear controles del slider:', error);
    return { prevButton: null, nextButton: null, playPauseButton: null };
  }
}

/**
 * Crea los indicadores de posición para el slider
 * @param {Object} state - Estado del slider
 * @returns {Array} Botones indicadores
 * @private
 */
function createSliderIndicators(state) {
  try {
    const { sliderArea, slides, currentSlide } = state;
    
    // Buscar contenedor existente o crear uno nuevo
    let indicators = sliderArea.querySelector('.slider-indicators');
    if (!indicators) {
      indicators = document.createElement('div');
      indicators.className = 'slider-indicators';
      sliderArea.appendChild(indicators);
    } else {
      // Limpiar indicadores existentes
      indicators.innerHTML = '';
    }
    
    const buttons = [];
    
    for (let i = 0; i < slides.length; i++) {
      const button = document.createElement('button');
      button.className = 'slider-indicator';
      button.type = 'button';
      button.setAttribute('aria-label', `Ir al slide ${i + 1} de ${slides.length}`);
      
      if (i === currentSlide) {
        button.classList.add('active');
        button.setAttribute('aria-current', 'true');
      } else {
        button.setAttribute('aria-current', 'false');
      }
      
      indicators.appendChild(button);
      buttons.push(button);
    }
    
    log('Indicadores del slider creados');
    return buttons;
  } catch (error) {
    console.error('Error al crear indicadores del slider:', error);
    return [];
  }
}

/**
 * Configura eventos para controles e indicadores
 * @param {Object} state - Estado del slider
 * @private
 */
function setupControlEvents(state) {
  try {
    const { controls, indicators, config } = state;
    
    // Configurar eventos para botones de control
    if (controls.prevButton) {
      const prevHandler = () => {
        prevSlide(state);
        handleUserInteraction(state);
      };
      
      controls.prevButton.addEventListener('click', prevHandler);
      registerEventListener(state, controls.prevButton, 'click', prevHandler);
    }
    
    if (controls.nextButton) {
      const nextHandler = () => {
        nextSlide(state);
        handleUserInteraction(state);
      };
      
      controls.nextButton.addEventListener('click', nextHandler);
      registerEventListener(state, controls.nextButton, 'click', nextHandler);
    }
    
    if (controls.playPauseButton) {
      const playPauseHandler = () => toggleAutoplay(state);
      
      controls.playPauseButton.addEventListener('click', playPauseHandler);
      registerEventListener(state, controls.playPauseButton, 'click', playPauseHandler);
    }
    
    // Configurar eventos para indicadores
    indicators.forEach((indicator, i) => {
      const indicatorHandler = () => {
        goToSlide(state, i);
        handleUserInteraction(state);
      };
      
      indicator.addEventListener('click', indicatorHandler);
      registerEventListener(state, indicator, 'click', indicatorHandler);
    });
    
    log('Eventos de controles configurados');
  } catch (error) {
    console.error('Error al configurar eventos de controles:', error);
  }
}

/**
 * Configura navegación por teclado
 * @param {Object} state - Estado del slider
 * @private
 */
function setupKeyboardNavigation(state) {
  try {
    const { sliderArea } = state;
    
    // Hacer que el slider sea enfocable
    sliderArea.setAttribute('tabindex', '0');
    
    const keyboardHandler = (e) => {
      try {
        if (e.key === 'ArrowLeft') {
          prevSlide(state);
          handleUserInteraction(state);
        } else if (e.key === 'ArrowRight') {
          nextSlide(state);
          handleUserInteraction(state);
        } else if (e.key === ' ') {
          e.preventDefault(); // Prevenir scroll
          toggleAutoplay(state);
        } else if (e.key === 'Home') {
          e.preventDefault();
          goToSlide(state, 0);
          handleUserInteraction(state);
        } else if (e.key === 'End') {
          e.preventDefault();
          goToSlide(state, state.slides.length - 1);
          handleUserInteraction(state);
        }
      } catch (err) {
        console.error('Error en keyboardHandler:', err);
      }
    };
    
    sliderArea.addEventListener('keydown', keyboardHandler);
    registerEventListener(state, sliderArea, 'keydown', keyboardHandler);
    
    log('Navegación por teclado configurada');
  } catch (error) {
    console.error('Error al configurar navegación por teclado:', error);
  }
}

/**
 * Configura soporte para gestos táctiles
 * @param {Object} state - Estado del slider
 * @private
 */
function setupTouchSupport(state) {
  try {
    const { sliderArea, config } = state;
    
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartTime = 0;
    
    // Gestor de eventos táctiles con throttling
    let isThrottled = false;
    
    const touchStartHandler = (e) => {
      try {
        if (isThrottled) return;
        isThrottled = true;
        
        touchStartX = e.changedTouches[0].screenX;
        touchStartTime = Date.now();
        state.isTouching = true;
        
        // Parar autoplay durante el toque
        stopAutoplay(state);
        
        setTimeout(() => { isThrottled = false; }, 60);
      } catch (err) {
        console.error('Error en touchStartHandler:', err);
        isThrottled = false;
      }
    };
    
    const touchEndHandler = (e) => {
      try {
        if (isThrottled) return;
        isThrottled = true;
        
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        
        state.isTouching = false;
        
        // Reiniciar autoplay después si estaba activo
        if (state.isPlaying) {
          setTimeout(() => startAutoplay(state), config.autoplayRestartDelay);
        }
        
        setTimeout(() => { isThrottled = false; }, 60);
      } catch (err) {
        console.error('Error en touchEndHandler:', err);
        isThrottled = false;
      }
    };
    
    function handleSwipe() {
      // Calcular velocidad de swipe
      const touchDuration = Date.now() - touchStartTime;
      const distance = touchEndX - touchStartX;
      
      // Si el swipe es rápido, reducir el umbral
      const effectiveThreshold = touchDuration < 200 ? 
        config.swipeThreshold * 0.7 : config.swipeThreshold;
      
      if (distance < -effectiveThreshold) {
        // Swipe izquierda -> siguiente slide
        nextSlide(state);
      } else if (distance > effectiveThreshold) {
        // Swipe derecha -> slide anterior
        prevSlide(state);
      }
    }
    
    sliderArea.addEventListener('touchstart', touchStartHandler, { passive: true });
    sliderArea.addEventListener('touchend', touchEndHandler, { passive: true });
    
    registerEventListener(state, sliderArea, 'touchstart', touchStartHandler, { passive: true });
    registerEventListener(state, sliderArea, 'touchend', touchEndHandler, { passive: true });
    
    log('Soporte táctil configurado');
  } catch (error) {
    console.error('Error al configurar soporte táctil:', error);
  }
}

/**
 * Configura comportamiento de hover/focus
 * @param {Object} state - Estado del slider
 * @private
 */
function setupHoverBehavior(state) {
  try {
    const { sliderArea } = state;
    
    const mouseEnterHandler = () => stopAutoplay(state);
    const focusInHandler = () => stopAutoplay(state);
    
    const mouseLeaveHandler = () => {
      if (state.isPlaying && !state.isTouching) {
        startAutoplay(state);
      }
    };
    
    const focusOutHandler = (e) => {
      if (!sliderArea.contains(e.relatedTarget) && state.isPlaying && !state.isTouching) {
        startAutoplay(state);
      }
    };
    
    sliderArea.addEventListener('mouseenter', mouseEnterHandler);
    sliderArea.addEventListener('focusin', focusInHandler);
    sliderArea.addEventListener('mouseleave', mouseLeaveHandler);
    sliderArea.addEventListener('focusout', focusOutHandler);
    
    registerEventListener(state, sliderArea, 'mouseenter', mouseEnterHandler);
    registerEventListener(state, sliderArea, 'focusin', focusInHandler);
    registerEventListener(state, sliderArea, 'mouseleave', mouseLeaveHandler);
    registerEventListener(state, sliderArea, 'focusout', focusOutHandler);
    
    log('Comportamiento hover/focus configurado');
  } catch (error) {
    console.error('Error al configurar comportamiento hover/focus:', error);
  }
}

/**
 * Configura manejo de visibilidad de página
 * @param {Object} state - Estado del slider
 * @private
 */
function setupVisibilityHandling(state) {
  try {
    const visibilityHandler = () => {
      if (document.hidden) {
        stopAutoplay(state);
      } else if (state.isPlaying) {
        startAutoplay(state);
      }
    };
    
    document.addEventListener('visibilitychange', visibilityHandler);
    registerEventListener(state, document, 'visibilitychange', visibilityHandler);
    
    log('Manejo de visibilidad de página configurado');
  } catch (error) {
    console.error('Error al configurar manejo de visibilidad:', error);
  }
}

/**
 * Configura manejo de preferencia de movimiento
 * @param {Object} state - Estado del slider
 * @private
 */
function setupMotionPreferenceHandling(state) {
  try {
    if (!state.config.respectReducedMotion) return;
    
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const motionChangeHandler = (e) => {
      state.prefersReducedMotion = e.matches;
      
      // Actualizar will-change para slides
      state.slides.forEach(slide => {
        slide.style.willChange = e.matches ? 'auto' : 'transform, opacity';
      });
      
      // Actualizar transiciones
      const transitionElements = [
        ...state.slides,
        ...state.indicators,
        ...Object.values(state.controls).filter(Boolean)
      ];
      
      transitionElements.forEach(el => {
        el.style.transition = e.matches ? 'none' : '';
      });
      
      log(`Preferencia de movimiento actualizada: ${e.matches ? 'reducida' : 'normal'}`);
    };
    
    // Usar método moderno o fallback según soporte
    if (motionMediaQuery.addEventListener) {
      motionMediaQuery.addEventListener('change', motionChangeHandler);
      registerEventListener(state, motionMediaQuery, 'change', motionChangeHandler);
    } else if (motionMediaQuery.addListener) {
      motionMediaQuery.addListener(motionChangeHandler);
      // Registrar para limpieza
      state.motionQueryReference = {
        query: motionMediaQuery,
        handler: motionChangeHandler
      };
    }
    
    log('Manejo de preferencia de movimiento configurado');
  } catch (error) {
    console.error('Error al configurar manejo de preferencia de movimiento:', error);
  }
}

/**
 * Muestra un slide específico con animación
 * @param {Object} state - Estado del slider
 * @param {number} index - Índice del slide a mostrar
 * @param {string|null} direction - Dirección de la animación ('prev', 'next' o null)
 * @private
 */
function showSlide(state, index, direction = null) {
  try {
    const { slides, currentSlide, config } = state;
    
    // No hacer nada si ya estamos en el slide solicitado o hay una transición en curso
    if (index === currentSlide || state.isTransitioning) return;
    
    // Validar índice
    if (index < 0 || index >= slides.length) {
      console.warn(`Índice de slide inválido: ${index}. Debe estar entre 0 y ${slides.length - 1}`);
      return;
    }
    
    // Determinar dirección si no se especifica
    if (direction === null) {
      direction = index > currentSlide ? 'next' : 'prev';
    }
    
    const currentEl = slides[currentSlide];
    const nextEl = slides[index];
    
    // Marcar transición en curso
    state.isTransitioning = true;
    
    // Actualizar ARIA para accesibilidad
    currentEl.setAttribute('aria-hidden', 'true');
    nextEl.setAttribute('aria-hidden', 'false');
    
    // Usar requestAnimationFrame para animaciones más suaves
    requestAnimationFrame(() => {
      // Aplicar clases para animación
      currentEl.classList.remove('active');
      
      if (state.prefersReducedMotion || !config.animationDirection) {
        // Sin animación de dirección si se prefiere reducción de movimiento
        currentEl.classList.add('going-out');
        nextEl.classList.add('active', 'coming-in');
      } else {
        // Animación con dirección
        currentEl.classList.add(direction === 'next' ? 'leaving-to-left' : 'leaving-to-right');
        nextEl.classList.add('active');
        nextEl.classList.add(direction === 'next' ? 'entering-from-right' : 'entering-from-left');
      }
      
      // Actualizar indicadores
      updateIndicators(state, index);
      
      // Anunciar cambio para lectores de pantalla
      announceSlideChange(state, index + 1, slides.length);
      
      // Eliminar clases después de la transición
      setTimeout(() => {
        if (state.prefersReducedMotion || !config.animationDirection) {
          currentEl.classList.remove('going-out');
          nextEl.classList.remove('coming-in');
        } else {
          currentEl.classList.remove('leaving-to-left', 'leaving-to-right');
          nextEl.classList.remove('entering-from-left', 'entering-from-right');
        }
        
        // Marcar transición como completada
        state.isTransitioning = false;
      }, config.transitionDuration);
      
      // Actualizar índice actual
      state.currentSlide = index;
    });
    
    log(`Mostrando slide ${index + 1} de ${slides.length}, dirección: ${direction}`);
  } catch (error) {
    console.error('Error al mostrar slide:', error);
    
    // Resetear estado de transición en caso de error
    state.isTransitioning = false;
  }
}

/**
 * Avanza al siguiente slide
 * @param {Object} state - Estado del slider
 * @private
 */
function nextSlide(state) {
  try {
    const { slides, currentSlide } = state;
    const newIndex = (currentSlide + 1) % slides.length;
    showSlide(state, newIndex, 'next');
  } catch (error) {
    console.error('Error al avanzar slide:', error);
  }
}

/**
 * Retrocede al slide anterior
 * @param {Object} state - Estado del slider
 * @private
 */
function prevSlide(state) {
  try {
    const { slides, currentSlide } = state;
    const newIndex = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(state, newIndex, 'prev');
  } catch (error) {
    console.error('Error al retroceder slide:', error);
  }
}

/**
 * Va a un slide específico
 * @param {Object} state - Estado del slider
 * @param {number} index - Índice del slide
 * @private
 */
function goToSlide(state, index) {
  try {
    showSlide(state, index);
  } catch (error) {
    console.error('Error al ir a slide específico:', error);
  }
}

/**
 * Maneja interacción de usuario y gestiona autoplay
 * @param {Object} state - Estado del slider
 * @private
 */
function handleUserInteraction(state) {
  try {
    // Parar autoplay temporalmente
    stopAutoplay(state);
    
    // Reiniciar autoplay después de un tiempo si estaba activo
    if (state.isPlaying) {
      setTimeout(() => startAutoplay(state), state.config.autoplayRestartDelay);
    }
  } catch (error) {
    console.error('Error al manejar interacción de usuario:', error);
  }
}

/**
 * Inicia el autoplay
 * @param {Object} state - Estado del slider
 * @private
 */
function startAutoplay(state) {
  try {
    const { controls, config } = state;
    
    // Evitar múltiples intervalos
    stopAutoplay(state);
    
    state.autoplayTimer = setInterval(() => {
      if (!document.hidden && !state.isTouching) {
        nextSlide(state);
      }
    }, config.autoplayDelay);
    
    // Actualizar botón play/pause
    if (controls.playPauseButton) {
      controls.playPauseButton.innerHTML = '<i class="bi bi-pause-fill"></i>';
      controls.playPauseButton.setAttribute('aria-label', 'Pausar presentación');
    }
    
    log('Autoplay iniciado');
  } catch (error) {
    console.error('Error al iniciar autoplay:', error);
  }
}

/**
 * Detiene el autoplay
 * @param {Object} state - Estado del slider
 * @private
 */
function stopAutoplay(state) {
  try {
    clearInterval(state.autoplayTimer);
    state.autoplayTimer = null;
    
    log('Autoplay detenido');
  } catch (error) {
    console.error('Error al detener autoplay:', error);
  }
}

/**
 * Alterna el autoplay
 * @param {Object} state - Estado del slider
 * @private
 */
function toggleAutoplay(state) {
  try {
    const { controls } = state;
    
    state.isPlaying = !state.isPlaying;
    
    if (state.isPlaying) {
      startAutoplay(state);
    } else {
      stopAutoplay(state);
      
      // Actualizar botón play/pause
      if (controls.playPauseButton) {
        controls.playPauseButton.innerHTML = '<i class="bi bi-play-fill"></i>';
        controls.playPauseButton.setAttribute('aria-label', 'Reanudar presentación');
      }
    }
    
    log(`Autoplay ${state.isPlaying ? 'reanudado' : 'pausado'}`);
  } catch (error) {
    console.error('Error al alternar autoplay:', error);
  }
}

/**
 * Actualiza los indicadores de posición
 * @param {Object} state - Estado del slider
 * @param {number} activeIndex - Índice activo
 * @private
 */
function updateIndicators(state, activeIndex) {
  try {
    const { indicators } = state;
    
    indicators.forEach((indicator, index) => {
      if (index === activeIndex) {
        indicator.classList.add('active');
        indicator.setAttribute('aria-current', 'true');
      } else {
        indicator.classList.remove('active');
        indicator.setAttribute('aria-current', 'false');
      }
    });
  } catch (error) {
    console.error('Error al actualizar indicadores:', error);
  }
}

/**
 * Anuncia el cambio de slide para lectores de pantalla
 * @param {Object} state - Estado del slider
 * @param {number} current - Número de slide actual
 * @param {number} total - Total de slides
 * @private
 */
function announceSlideChange(state, current, total) {
  try {
    const announcer = document.getElementById(`slider-announcer-${state.sliderArea.dataset.sliderId}`);
    if (!announcer) {
      const announcer = state.sliderArea.querySelector('.slider-live-region');
      if (announcer) {
        announcer.textContent = `Slide ${current} de ${total}`;
      }
      return;
    }
    
    announcer.textContent = ``;
    
    // Pequeño retraso para asegurar que los lectores de pantalla detecten el cambio
    setTimeout(() => {
      announcer.textContent = `Slide ${current} de ${total}`;
    }, 10);
  } catch (error) {
    console.error('Error al anunciar cambio de slide:', error);
  }
}

/**
 * Registra un event listener para limpieza posterior
 * @param {Object} state - Estado del slider
 * @param {EventTarget} element - Elemento objetivo
 * @param {string} event - Nombre del evento
 * @param {Function} handler - Función manejadora
 * @param {Object} [options] - Opciones del listener
 * @private
 */
function registerEventListener(state, element, event, handler, options = {}) {
  state.eventListeners.push({ element, event, handler, options });
}

/**
 * Crea una API pública para controlar el slider
 * @param {Object} state - Estado del slider
 * @returns {Object} API pública
 * @private
 */
function createSliderAPI(state) {
  return {
    /**
     * Avanza al siguiente slide
     * @returns {Object} API del slider
     */
    next: () => {
      nextSlide(state);
      return createSliderAPI(state);
    },
    
    /**
     * Retrocede al slide anterior
     * @returns {Object} API del slider
     */
    prev: () => {
      prevSlide(state);
      return createSliderAPI(state);
    },
    
    /**
     * Va a un slide específico
     * @param {number} index - Índice del slide
     * @returns {Object} API del slider
     */
    goTo: (index) => {
      goToSlide(state, index);
      return createSliderAPI(state);
    },
    
    /**
     * Inicia el autoplay
     * @returns {Object} API del slider
     */
    play: () => {
      state.isPlaying = true;
      startAutoplay(state);
      return createSliderAPI(state);
    },
    
    /**
     * Detiene el autoplay
     * @returns {Object} API del slider
     */
    pause: () => {
      state.isPlaying = false;
      stopAutoplay(state);
      return createSliderAPI(state);
    },
    
    /**
     * Destruye el slider y limpia recursos
     * @returns {boolean} Éxito de la operación
     */
    destroy: () => {
      try {
        // Detener autoplay
        stopAutoplay(state);
        
        // Eliminar event listeners
        state.eventListeners.forEach(({ element, event, handler, options }) => {
          element.removeEventListener(event, handler, options);
        });
        
        // Limpiar listener de MediaQuery para Safari antiguo
        if (state.motionQueryReference) {
          state.motionQueryReference.query.removeListener(state.motionQueryReference.handler);
        }
        
        // Remover de la lista de sliders
        sliders = sliders.filter(s => s.id !== state.sliderArea.dataset.sliderId);
        
        log('Slider destruido');
        return true;
      } catch (error) {
        console.error('Error al destruir slider:', error);
        return false;
      }
    },
    
    /**
     * Obtiene el estado actual del slider
     * @returns {Object} Estado del slider
     */
    getState: () => ({
      currentSlide: state.currentSlide,
      totalSlides: state.slides.length,
      isPlaying: state.isPlaying,
      isTransitioning: state.isTransitioning
    })
  };
}

/**
 * Crea una API vacía para cuando no se puede inicializar el slider
 * @returns {Object} API vacía
 * @private
 */
function createEmptySliderAPI() {
  const noop = () => createEmptySliderAPI();
  return {
    next: noop,
    prev: noop,
    goTo: noop,
    play: noop,
    pause: noop,
    destroy: () => true,
    getState: () => ({ currentSlide: 0, totalSlides: 0, isPlaying: false, isTransitioning: false })
  };
}

/**
 * Función de log condicional
 * @param {string} message - Mensaje a loguear
 * @param {*} [data] - Datos adicionales
 * @private
 */
function log(message, data) {
  const config = sliders.length > 0 ? sliders[0].state.config : DEFAULT_CONFIG;
  if (config.debug) {
    if (data) {
      console.log(`[Slider] ${message}`, data);
    } else {
      console.log(`[Slider] ${message}`);
    }
  }
}