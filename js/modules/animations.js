/**
 * Módulo para las animaciones al hacer scroll
 * Implementa efectos de aparición y movimiento para elementos
 * cuando entran en el viewport, con soporte para diferentes tipos
 * de animaciones y configuraciones.
 */

/**
 * Inicializa las animaciones al scroll
 */
export function initScrollAnimations() {
    if ('IntersectionObserver' in window) {
      setupScrollObserver();
    } else {
      // Fallback para navegadores sin soporte
      showAllElements();
    }
  }
  
  /**
   * Configura el observer para detectar elementos que entran en viewport
   */
  function setupScrollObserver() {
    // Seleccionar todos los elementos a animar
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (elements.length === 0) return;
    
    // Configurar opciones del observer
    const options = {
      root: null, // viewport
      rootMargin: '0px 0px -10% 0px', // trigger un poco antes del borde inferior
      threshold: 0.1 // 10% del elemento visible
    };
    
    // Crear observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateElement(entry.target);
          observer.unobserve(entry.target); // dejar de observar una vez animado
        }
      });
    }, options);
    
    // Observar todos los elementos
    elements.forEach(element => {
      // Verificar si reducción de movimiento está activa
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Mostrar sin animación
        element.classList.add('visible');
      } else {
        // Preparar para animar
        prepareElement(element);
        // Observar
        observer.observe(element);
      }
    });
    
    // Actualizar si cambian las preferencias de movimiento
    window.matchMedia('(prefers-reduced-motion: reduce)')
      .addEventListener('change', ({ matches }) => {
        if (matches) {
          // Mostrar todos los elementos inmediatamente
          elements.forEach(element => {
            element.classList.add('visible');
          });
        }
      });
  }
  
  /**
   * Prepara un elemento para ser animado
   */
  function prepareElement(element) {
    // Aplicar clase base si no tiene una específica
    if (!element.classList.contains('fade-up') && 
        !element.classList.contains('fade-down') && 
        !element.classList.contains('fade-left') && 
        !element.classList.contains('fade-right') && 
        !element.classList.contains('scale-in') &&
        !element.classList.contains('slide-left') && 
        !element.classList.contains('slide-right')) {
      element.classList.add('fade-up');
    }
    
    // Establecer retraso personalizado si se especifica
    if (element.dataset.delay) {
      element.style.transitionDelay = `${parseInt(element.dataset.delay)}ms`;
    }
    
    // Establecer duración personalizada si se especifica
    if (element.dataset.duration) {
      element.style.transitionDuration = `${parseInt(element.dataset.duration)}ms`;
    }
  }
  
  /**
   * Anima un elemento aplicando la clase visible
   */
  function animateElement(element) {
    // Si el navegador soporta Web Animation API y está activado
    if ('animate' in element && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Crear animación según el tipo
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
    } else {
      // Fallback estándar con CSS
      element.classList.add('visible');
    }
  }
  
  /**
   * Obtiene la configuración de animación según las clases del elemento
   */
  function getAnimationConfig(element) {
    // Opciones base
    const options = {
      duration: parseInt(element.dataset.duration) || 600,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      fill: 'forwards'
    };
    
    // Keyframes según tipo de animación
    let keyframes = [];
    
    if (element.classList.contains('fade-up')) {
      keyframes = [
        { opacity: 0, transform: 'translateY(30px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ];
    } else if (element.classList.contains('fade-down')) {
      keyframes = [
        { opacity: 0, transform: 'translateY(-30px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ];
    } else if (element.classList.contains('fade-left')) {
      keyframes = [
        { opacity: 0, transform: 'translateX(-30px)' },
        { opacity: 1, transform: 'translateX(0)' }
      ];
    } else if (element.classList.contains('fade-right')) {
      keyframes = [
        { opacity: 0, transform: 'translateX(30px)' },
        { opacity: 1, transform: 'translateX(0)' }
      ];
    } else if (element.classList.contains('scale-in')) {
      keyframes = [
        { opacity: 0, transform: 'scale(0.95)' },
        { opacity: 1, transform: 'scale(1)' }
      ];
    } else if (element.classList.contains('slide-left')) {
      keyframes = [
        { transform: 'translateX(-100%)' },
        { transform: 'translateX(0)' }
      ];
    } else if (element.classList.contains('slide-right')) {
      keyframes = [
        { transform: 'translateX(100%)' },
        { transform: 'translateX(0)' }
      ];
    } else {
      // Animación por defecto
      keyframes = [
        { opacity: 0 },
        { opacity: 1 }
      ];
    }
    
    return { keyframes, options };
  }
  
  /**
   * Muestra todos los elementos inmediatamente (fallback)
   */
  function showAllElements() {
    document.querySelectorAll('.animate-on-scroll').forEach(element => {
      element.classList.add('visible');
      element.style.transition = 'none';
    });
  }
  
  /**
   * Crea un efecto de parallax para elementos específicos
   * Esta función se puede llamar desde initScrollAnimations si es necesario
   */
  export function setupParallaxEffect() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    if (parallaxElements.length === 0) return;
    
    // No aplicar parallax si la reducción de movimiento está activada
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    // Función para actualizar posiciones
    const updateParallax = () => {
      const scrollY = window.scrollY;
      
      parallaxElements.forEach(element => {
        const speed = parseFloat(element.dataset.parallax) || 0.1;
        const offsetY = scrollY * speed;
        
        // Aplicar transformación
        element.style.transform = `translate3d(0, ${offsetY}px, 0)`;
      });
    };
    
    // Inicializar posiciones
    updateParallax();
    
    // Actualizar en scroll con optimización
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }