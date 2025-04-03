/**
 * Módulo para las animaciones al hacer scroll
 * Implementa efectos de aparición y movimiento para elementos
 * cuando entran en el viewport, con soporte para diferentes tipos
 * de animaciones y configuraciones.
 * 
 * Uso:
 * 1. Agregar la clase 'animate-on-scroll' a los elementos que deseas animar
 * 2. Agregar una clase adicional para definir el tipo de animación: 
 *    'fade-up', 'fade-down', 'fade-left', 'fade-right', 'scale-in', 'slide-left', 'slide-right'
 * 3. Opcionalmente, agregar atributos data para personalizar:
 *    - data-delay="200" (ms)
 *    - data-duration="600" (ms)
 *    - data-custom-animation="nombre" (para animaciones personalizadas)
 */

// Constantes y configuración
const ANIMATION_TYPES = {
  'fade-up': [
    { opacity: 0, transform: 'translateY(30px)' },
    { opacity: 1, transform: 'translateY(0)' }
  ],
  'fade-down': [
    { opacity: 0, transform: 'translateY(-30px)' },
    { opacity: 1, transform: 'translateY(0)' }
  ],
  'fade-left': [
    { opacity: 0, transform: 'translateX(-30px)' },
    { opacity: 1, transform: 'translateX(0)' }
  ],
  'fade-right': [
    { opacity: 0, transform: 'translateX(30px)' },
    { opacity: 1, transform: 'translateX(0)' }
  ],
  'scale-in': [
    { opacity: 0, transform: 'scale(0.95)' },
    { opacity: 1, transform: 'scale(1)' }
  ],
  'slide-left': [
    { transform: 'translateX(-100%)' },
    { transform: 'translateX(0)' }
  ],
  'slide-right': [
    { transform: 'translateX(100%)' },
    { transform: 'translateX(0)' }
  ],
  'default': [
    { opacity: 0 },
    { opacity: 1 }
  ]
};

// Variables globales del módulo
let observer = null;
let customAnimations = {};
let isAnimationPaused = false;
let observedElements = new Set();

/**
 * Inicializa las animaciones al scroll
 * @returns {Object} API para controlar las animaciones
 */
export function initScrollAnimations() {
  try {
    console.log('Inicializando sistema de animaciones de scroll...');
    
    // Verificar si hay elementos para animar
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (elements.length === 0) {
      console.log('No se encontraron elementos para animar');
      return createAnimationAPI({});
    }
    
    // Verificar soporte para animaciones
    const reducedMotionActive = prefersReducedMotion();
    if (reducedMotionActive) {
      console.log('Preferencia de reducción de movimiento detectada, mostrando elementos sin animación');
      showAllElements();
      return createAnimationAPI({ reducedMotion: true });
    }
    
    // Iniciar sistema según soporte del navegador
    if ('IntersectionObserver' in window) {
      setupScrollObserver(elements);
    } else {
      console.log('IntersectionObserver no soportado, usando fallback');
      showAllElements();
    }
    
    // Escuchar cambios en preferencias de movimiento
    setupMotionPreferenceListener();
    
    // Retornar API
    return createAnimationAPI({
      observer,
      elements: observedElements
    });
  } catch (error) {
    console.error('Error al inicializar animaciones de scroll:', error);
    // Fallback seguro: mostrar todos los elementos
    showAllElements();
    return createAnimationAPI({ error });
  }
}

/**
 * Verifica si el usuario prefiere reducción de movimiento
 * @returns {Boolean}
 */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Configura el listener para cambios en preferencias de movimiento
 */
function setupMotionPreferenceListener() {
  try {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handlePreferenceChange = ({ matches }) => {
      if (matches) {
        console.log('Preferencia de reducción de movimiento activada');
        isAnimationPaused = true;
        showAllElements();
        
        // Desconectar observer para ahorrar recursos
        if (observer) {
          observer.disconnect();
          observer = null;
        }
      } else {
        console.log('Preferencia de reducción de movimiento desactivada');
        isAnimationPaused = false;
      }
    };
    
    // Usar método moderno si está disponible
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handlePreferenceChange);
    } else if (mediaQuery.addListener) {
      // Método obsoleto para compatibilidad
      mediaQuery.addListener(handlePreferenceChange);
    }
  } catch (error) {
    console.error('Error al configurar listener de preferencias de movimiento:', error);
  }
}

/**
 * Configura el observer para detectar elementos que entran en viewport
 * @param {NodeList} elements - Elementos a observar
 */
function setupScrollObserver(elements) {
  try {
    // Configurar opciones del observer
    const options = {
      root: null, // viewport
      rootMargin: '0px 0px -10% 0px', // trigger un poco antes del borde inferior
      threshold: 0.1 // 10% del elemento visible
    };
    
    // Crear observer
    observer = new IntersectionObserver((entries) => {
      if (isAnimationPaused) return;
      
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          try {
            animateElement(entry.target);
            observer.unobserve(entry.target);
            observedElements.delete(entry.target);
          } catch (animationError) {
            console.error('Error al animar elemento:', animationError);
            // Mostrar el elemento como fallback
            entry.target.classList.add('visible');
          }
        }
      });
    }, options);
    
    // Batch elements en grupos de 20 para mejorar performance
    const BATCH_SIZE = 20;
    let elementArray = Array.from(elements);
    
    // Procesar elementos en lotes para evitar bloqueo del hilo principal
    function processBatch(startIndex) {
      const endIndex = Math.min(startIndex + BATCH_SIZE, elementArray.length);
      const currentBatch = elementArray.slice(startIndex, endIndex);
      
      currentBatch.forEach(element => {
        try {
          prepareElement(element);
          observer.observe(element);
          observedElements.add(element);
        } catch (error) {
          console.error('Error al preparar elemento para animación:', error);
          element.classList.add('visible');
        }
      });
      
      // Procesar siguiente lote si quedan elementos
      if (endIndex < elementArray.length) {
        setTimeout(() => {
          processBatch(endIndex);
        }, 10);
      }
    }
    
    // Iniciar procesamiento
    processBatch(0);
    
  } catch (error) {
    console.error('Error al configurar IntersectionObserver:', error);
    showAllElements();
  }
}

/**
 * Prepara un elemento para ser animado
 * @param {Element} element - Elemento DOM a preparar
 */
function prepareElement(element) {
  // Aplicar clase base si no tiene una específica
  const hasAnimationType = Object.keys(ANIMATION_TYPES).some(type => 
    type !== 'default' && element.classList.contains(type)
  );
  
  if (!hasAnimationType) {
    element.classList.add('fade-up');
  }
  
  // Establecer retraso personalizado si se especifica
  if (element.dataset.delay) {
    const delay = parseInt(element.dataset.delay);
    if (!isNaN(delay) && delay >= 0) {
      element.style.transitionDelay = `${delay}ms`;
    }
  }
  
  // Establecer duración personalizada si se especifica
  if (element.dataset.duration) {
    const duration = parseInt(element.dataset.duration);
    if (!isNaN(duration) && duration > 0) {
      element.style.transitionDuration = `${duration}ms`;
    }
  }
  
  // Marcar como preparado
  element.dataset.animationPrepared = 'true';
}

/**
 * Anima un elemento aplicando la clase visible
 * @param {Element} element - Elemento DOM a animar
 */
function animateElement(element) {
  // Verificar si ya está animado o si estamos en pausa
  if (element.classList.contains('visible') || isAnimationPaused) {
    return;
  }
  
  // Si tiene animación personalizada registrada, usarla
  const customAnimationName = element.dataset.customAnimation;
  if (customAnimationName && customAnimations[customAnimationName]) {
    try {
      customAnimations[customAnimationName](element);
      return;
    } catch (error) {
      console.error(`Error en animación personalizada "${customAnimationName}":`, error);
      // Continuar con animación estándar como fallback
    }
  }
  
  // Si el navegador soporta Web Animation API y no se prefiere reducción de movimiento
  if ('animate' in element && !prefersReducedMotion()) {
    try {
      // Obtener configuración de animación
      const animationConfig = getAnimationConfig(element);
      
      // Aplicar la animación con Web Animation API
      const animation = element.animate(
        animationConfig.keyframes,
        animationConfig.options
      );
      
      // Al finalizar, establecer como visible permanentemente
      animation.onfinish = () => {
        element.classList.add('visible');
      };
      
      // Manejar eventos de error
      animation.oncancel = () => {
        element.classList.add('visible');
      };
      
      animation.onremove = () => {
        element.classList.add('visible');
      };
    } catch (error) {
      console.error('Error al usar Web Animation API:', error);
      // Fallback a CSS
      element.classList.add('visible');
    }
  } else {
    // Fallback estándar con CSS
    element.classList.add('visible');
  }
}

/**
 * Obtiene la configuración de animación según las clases del elemento
 * @param {Element} element - Elemento DOM
 * @returns {Object} Configuración de animación
 */
function getAnimationConfig(element) {
  // Opciones base
  const options = {
    duration: parseInt(element.dataset.duration) || 600,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    fill: 'forwards'
  };
  
  // Determinar tipo de animación basado en clases
  let animationType = 'default';
  Object.keys(ANIMATION_TYPES).forEach(type => {
    if (type !== 'default' && element.classList.contains(type)) {
      animationType = type;
    }
  });
  
  return { 
    keyframes: ANIMATION_TYPES[animationType],
    options 
  };
}

/**
 * Muestra todos los elementos inmediatamente (fallback)
 */
function showAllElements() {
  try {
    document.querySelectorAll('.animate-on-scroll').forEach(element => {
      element.classList.add('visible');
      element.style.transition = 'none';
    });
  } catch (error) {
    console.error('Error al mostrar todos los elementos:', error);
  }
}

/**
 * Registra una animación personalizada
 * @param {String} name - Nombre de la animación
 * @param {Function} animationFn - Función que recibe el elemento y lo anima
 */
export function registerCustomAnimation(name, animationFn) {
  if (typeof animationFn !== 'function') {
    console.error('La animación personalizada debe ser una función');
    return false;
  }
  
  customAnimations[name] = animationFn;
  return true;
}

/**
 * Crea un efecto de parallax para elementos específicos
 * @param {Object} options - Opciones de configuración
 */
export function setupParallaxEffect(options = {}) {
  try {
    const config = {
      selector: '[data-parallax]',
      defaultSpeed: 0.1,
      ...options
    };
    
    const parallaxElements = document.querySelectorAll(config.selector);
    if (parallaxElements.length === 0) return null;
    
    // No aplicar parallax si la reducción de movimiento está activada
    if (prefersReducedMotion()) {
      return null;
    }
    
    let ticking = false;
    let isEnabled = true;
    
    // Función para actualizar posiciones
    const updateParallax = () => {
      if (!isEnabled) return;
      
      const scrollY = window.scrollY;
      
      parallaxElements.forEach(element => {
        try {
          const speed = parseFloat(element.dataset.parallax) || config.defaultSpeed;
          const offsetY = scrollY * speed;
          
          // Aplicar transformación
          element.style.transform = `translate3d(0, ${offsetY}px, 0)`;
          
          // Añadir will-change para optimización
          if (!element.style.willChange) {
            element.style.willChange = 'transform';
          }
        } catch (error) {
          console.warn('Error al aplicar parallax a elemento:', error);
        }
      });
    };
    
    // Inicializar posiciones
    updateParallax();
    
    // Actualizar en scroll con optimización
    const scrollHandler = () => {
      if (!ticking && isEnabled) {
        window.requestAnimationFrame(() => {
          updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    // Añadir listener
    window.addEventListener('scroll', scrollHandler, { passive: true });
    
    // Retornar API para controlar el parallax
    return {
      update: updateParallax,
      disable: () => {
        isEnabled = false;
        // Restablecer transformaciones
        parallaxElements.forEach(element => {
          element.style.transform = '';
          element.style.willChange = '';
        });
      },
      enable: () => {
        if (!prefersReducedMotion()) {
          isEnabled = true;
          updateParallax();
        }
      },
      destroy: () => {
        isEnabled = false;
        window.removeEventListener('scroll', scrollHandler);
        parallaxElements.forEach(element => {
          element.style.transform = '';
          element.style.willChange = '';
        });
      }
    };
  } catch (error) {
    console.error('Error al configurar efecto parallax:', error);
    return null;
  }
}

/**
 * Crea un API para controlar las animaciones
 * @param {Object} state - Estado interno del sistema de animaciones
 * @returns {Object} API
 */
function createAnimationAPI(state) {
  return {
    /**
     * Pausa todas las animaciones
     */
    pause: () => {
      isAnimationPaused = true;
    },
    
    /**
     * Reanuda las animaciones
     */
    resume: () => {
      if (!prefersReducedMotion()) {
        isAnimationPaused = false;
      }
    },
    
    /**
     * Muestra todos los elementos inmediatamente
     */
    showAll: showAllElements,
    
    /**
     * Registra una animación personalizada
     */
    register: registerCustomAnimation,
    
    /**
     * Estado actual del sistema
     */
    getState: () => ({
      paused: isAnimationPaused,
      reducedMotion: prefersReducedMotion(),
      activeObserver: !!observer,
      elementsCount: observedElements.size,
      customAnimationsCount: Object.keys(customAnimations).length
    })
  };
}

