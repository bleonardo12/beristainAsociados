// animations.js - Módulo para las animaciones al hacer scroll

/**
 * Módulo de animaciones al scroll integrado con la arquitectura modular
 */

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

let observer = null;
let customAnimations = {};
let isAnimationPaused = false;
let observedElements = new Set();

export function initScrollAnimations() {
  try {
    console.log('🎬 Inicializando sistema de animaciones de scroll...');
    
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (elements.length === 0) {
      console.log('No se encontraron elementos para animar');
      return createAnimationAPI({});
    }
    
    const reducedMotionActive = prefersReducedMotion();
    if (reducedMotionActive) {
      console.log('Preferencia de reducción de movimiento detectada, mostrando elementos sin animación');
      showAllElements();
      return createAnimationAPI({ reducedMotion: true });
    }
    
    if ('IntersectionObserver' in window) {
      setupScrollObserver(elements);
    } else {
      console.log('IntersectionObserver no soportado, usando fallback');
      showAllElements();
    }
    
    setupMotionPreferenceListener();
    
    return createAnimationAPI({
      observer,
      elements: observedElements
    });
  } catch (error) {
    console.error('Error al inicializar animaciones de scroll:', error);
    showAllElements();
    return createAnimationAPI({ error });
  }
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function setupMotionPreferenceListener() {
  try {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handlePreferenceChange = ({ matches }) => {
      if (matches) {
        console.log('Preferencia de reducción de movimiento activada');
        isAnimationPaused = true;
        showAllElements();
        
        if (observer) {
          observer.disconnect();
          observer = null;
        }
      } else {
        console.log('Preferencia de reducción de movimiento desactivada');
        isAnimationPaused = false;
      }
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handlePreferenceChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handlePreferenceChange);
    }
  } catch (error) {
    console.error('Error al configurar listener de preferencias de movimiento:', error);
  }
}

function setupScrollObserver(elements) {
  try {
    const options = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    };
    
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
            entry.target.classList.add('visible');
          }
        }
      });
    }, options);
    
    const BATCH_SIZE = 20;
    let elementArray = Array.from(elements);
    
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
      
      if (endIndex < elementArray.length) {
        setTimeout(() => {
          processBatch(endIndex);
        }, 10);
      }
    }
    
    processBatch(0);
    
  } catch (error) {
    console.error('Error al configurar IntersectionObserver:', error);
    showAllElements();
  }
}

function prepareElement(element) {
  const hasAnimationType = Object.keys(ANIMATION_TYPES).some(type => 
    type !== 'default' && element.classList.contains(type)
  );
  
  if (!hasAnimationType) {
    element.classList.add('fade-up');
  }
  
  // Mantenemos las propiedades en CSS únicamente como fallback para navegadores antiguos
  if (element.dataset.delay) {
    element.style.transitionDelay = `${element.dataset.delay}ms`;
  }
  if (element.dataset.duration) {
    element.style.transitionDuration = `${element.dataset.duration}ms`;
  }
  
  element.dataset.animationPrepared = 'true';
}

function animateElement(element) {
  if (element.classList.contains('visible') || isAnimationPaused) {
    return;
  }
  
  const customAnimationName = element.dataset.customAnimation;
  if (customAnimationName && customAnimations[customAnimationName]) {
    try {
      customAnimations[customAnimationName](element);
      return;
    } catch (error) {
      console.error(`Error en animación personalizada "${customAnimationName}":`, error);
    }
  }
  
  if ('animate' in element && !prefersReducedMotion()) {
    try {
      const animationConfig = getAnimationConfig(element);
      const animation = element.animate(
        animationConfig.keyframes,
        animationConfig.options
      );
      
      animation.onfinish = () => {
        element.classList.add('visible');
      };
      
      animation.oncancel = () => {
        element.classList.add('visible');
      };
    } catch (error) {
      console.error('Error al usar Web Animation API:', error);
      element.classList.add('visible');
    }
  } else {
    element.classList.add('visible');
  }
}

function getAnimationConfig(element) {
  // ✅ CORRECCIÓN CRÍTICA: Traspasar los atributos data directamente a las opciones de Web Animation API
  const duration = parseInt(element.dataset.duration) || 600;
  const delay = parseInt(element.dataset.delay) || 0;

  const options = {
    duration: duration,
    delay: delay,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    fill: 'forwards'
  };
  
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

export function registerCustomAnimation(name, animationFn) {
  if (typeof animationFn !== 'function') {
    console.error('La animación personalizada debe ser una función');
    return false;
  }
  
  customAnimations[name] = animationFn;
  return true;
}

export function setupParallaxEffect(options = {}) {
  try {
    const config = {
      selector: '[data-parallax]',
      defaultSpeed: 0.1,
      disableOnMobile: true, // ✅ OPTIMIZACIÓN: Evitar saltos de renderizado en móviles
      ...options
    };
    
    // Desactivar si es móvil mediante validación del ancho de pantalla
    if (config.disableOnMobile && window.innerWidth < 768) {
      return null;
    }

    const parallaxElements = document.querySelectorAll(config.selector);
    if (parallaxElements.length === 0) return null;
    
    if (prefersReducedMotion()) return null;
    
    let ticking = false;
    let isEnabled = true;
    
    const updateParallax = () => {
      if (!isEnabled) return;
      
      const scrollY = window.scrollY;
      
      parallaxElements.forEach(element => {
        try {
          const speed = parseFloat(element.dataset.parallax) || config.defaultSpeed;
          const offsetY = scrollY * speed;
          
          element.style.transform = `translate3d(0, ${offsetY}px, 0)`;
          
          if (!element.style.willChange) {
            element.style.willChange = 'transform';
          }
        } catch (error) {
          console.warn('Error al aplicar parallax a elemento:', error);
        }
      });
    };
    
    updateParallax();
    
    const scrollHandler = () => {
      if (!ticking && isEnabled) {
        window.requestAnimationFrame(() => {
          updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', scrollHandler, { passive: true });
    
    return {
      update: updateParallax,
      disable: () => {
        isEnabled = false;
        parallaxElements.forEach(element => {
          element.style.transform = '';
          element.style.willChange = '';
        });
      },
      enable: () => {
        if (!prefersReducedMotion() && !(config.disableOnMobile && window.innerWidth < 768)) {
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

function createAnimationAPI(state) {
  return {
    pause: () => { isAnimationPaused = true; },
    resume: () => { if (!prefersReducedMotion()) isAnimationPaused = false; },
    showAll: showAllElements,
    register: registerCustomAnimation,
    getState: () => ({
      paused: isAnimationPaused,
      reducedMotion: prefersReducedMotion(),
      activeObserver: !!observer,
      elementsCount: observedElements.size,
      customAnimationsCount: Object.keys(customAnimations).length
    })
  };
}