/**
 * Módulo de scroll suave v1.1
 * Optimizado con AbortController y gestión de foco accesible
 */

let abortController = new AbortController();

export function initSmoothScroll() {
  // Limpieza previa si se reinicia el módulo
  abortController.abort();
  abortController = new AbortController();
  const { signal } = abortController;

  const supportsNative = 'scrollBehavior' in document.documentElement.style;

  if (!supportsNative) {
    window.smoothScrollTo = createPolyfill();
  }

  setupAnchorScrolling(signal);
}

function createPolyfill() {
  const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  return (targetY, duration = 800) => {
    const startY = window.pageYOffset;
    const difference = targetY - startY;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + difference * easeInOutCubic(progress));
      if (progress < 1) requestAnimationFrame(animateScroll);
    };
    requestAnimationFrame(animateScroll);
  };
}

function setupAnchorScrolling(signal) {
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        e.preventDefault();
        
        const navbar = document.querySelector('.navbar');
        const offset = navbar?.offsetHeight || 100;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

        // Ejecución de scroll
        if (typeof window.smoothScrollTo === 'function') {
          window.smoothScrollTo(targetPosition);
        } else {
          window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }

        // Accesibilidad: Asegurar que el elemento pueda recibir foco
        if (!targetElement.hasAttribute('tabindex')) {
          targetElement.setAttribute('tabindex', '-1');
        }
        
        // PushState y Foco
        history.pushState(null, null, targetId);
        targetElement.focus({ preventScroll: true });
      }
    }, { signal });
  });
}