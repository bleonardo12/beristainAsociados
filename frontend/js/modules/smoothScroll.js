/**
 * Módulo de scroll suave con fallback para navegadores antiguos
 * Mejora la experiencia de navegación con smooth scroll
 * Compatible con Safari < 15.4 y otros navegadores legacy
 *
 * @version 1.0
 */

/**
 * Inicializa el smooth scroll
 */
export function initSmoothScroll() {
  try {
    // Detectar si el navegador soporta scroll-behavior: smooth
    const supportsNativeSmoothScroll = 'scrollBehavior' in document.documentElement.style;

    if (supportsNativeSmoothScroll) {
      log('Usando scroll suave nativo del navegador');
      enableNativeSmoothScroll();
    } else {
      log('Aplicando polyfill de scroll suave');
      enableSmoothScrollPolyfill();
    }

    // Mejorar scroll para enlaces con anclas
    setupAnchorScrolling();

    log('Smooth scroll inicializado correctamente');
  } catch (error) {
    console.error('Error al inicializar smooth scroll:', error);
  }
}

/**
 * Habilita el scroll suave nativo
 */
function enableNativeSmoothScroll() {
  document.documentElement.style.scrollBehavior = 'smooth';
}

/**
 * Polyfill de scroll suave para navegadores que no lo soportan
 */
function enableSmoothScrollPolyfill() {
  // Implementación de ease-in-out
  const easeInOutCubic = (t) => {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // Función de scroll suave manual
  window.smoothScrollTo = (targetY, duration = 800) => {
    const startY = window.pageYOffset;
    const difference = targetY - startY;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = easeInOutCubic(progress);

      window.scrollTo(0, startY + difference * ease);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };
}

/**
 * Configura el scroll suave para enlaces con anclas
 */
function setupAnchorScrolling() {
  // Seleccionar todos los enlaces que apuntan a anclas (#)
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        e.preventDefault();

        // Función para calcular posición correctamente
        const scrollToTarget = () => {
          // Calcular posición con offset para navbar fijo
          const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 100;

          // Usar offsetTop para cálculo más confiable (no afectado por scroll actual)
          let element = targetElement;
          let offsetTop = 0;

          while (element) {
            offsetTop += element.offsetTop;
            element = element.offsetParent;
          }

          const targetPosition = offsetTop - navbarHeight - 20; // 20px extra de padding

          // Usar scroll nativo o polyfill según disponibilidad
          if (typeof window.smoothScrollTo === 'function') {
            window.smoothScrollTo(targetPosition);
          } else {
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }

          // Actualizar la URL sin hacer scroll adicional
          if (history.pushState) {
            history.pushState(null, null, targetId);
          }

          // Enfocar el elemento para accesibilidad
          setTimeout(() => {
            targetElement.focus({ preventScroll: true });
          }, 800);
        };

        // Si hay imágenes cargando, esperar un poco para recalcular
        // Esto evita problemas cuando lazy-load cambia las posiciones
        if (document.readyState === 'complete') {
          // Página ya cargada completamente
          scrollToTarget();
        } else {
          // Página todavía cargando, esperar 100ms para que imágenes se posicionen
          setTimeout(scrollToTarget, 100);
        }
      }
    });
  });

  log(`Configurados ${anchorLinks.length} enlaces con scroll suave`);
}

/**
 * Logging helper
 */
function log(message) {
  if (typeof console !== 'undefined' && console.log) {
    console.log(`[SmoothScroll] ${message}`);
  }
}

/**
 * Exportar API pública
 */
export default {
  init: initSmoothScroll
};
