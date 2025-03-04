/**
 * Módulo para la gestión del carrusel de testimonios
 * Maneja grupos de tarjetas de testimonios con rotación automática
 * y controles de navegación.
 */

// Constantes de configuración
const AUTO_ROTATE_DELAY = 8000; // ms entre rotaciones automáticas
const TRANSITION_DURATION = 500; // ms para duración de transiciones

/**
 * Inicializa el carrusel de testimonios
 */
export function initTestimonials() {
  const section = document.querySelector('.comentarios-section');
  if (!section) return;
  
  const wrapper = section.querySelector('.comentarios-wrapper');
  if (!wrapper) return;
  
  const groups = wrapper.querySelectorAll('.comentarios-group');
  if (groups.length <= 1) {
    // Si solo hay un grupo, solo mostrarlo
    if (groups.length === 1) {
      groups[0].classList.add('active');
    }
    return;
  }
  
  let currentGroup = 0;
  let autoRotateTimer = null;
  let isPaused = false;
  
  // Configurar estructura para accesibilidad
  setupTestimonialsStructure(wrapper, groups);
  
  // Crear controles de navegación
  const { prevButton, nextButton } = createTestimonialsControls(section);
  
  /**
   * Muestra un grupo específico con animación
   */
  function showGroup(index, direction = null) {
    if (index === currentGroup) return;
    
    // Determinar dirección si no se especifica
    if (direction === null) {
      direction = index > currentGroup ? 'next' : 'prev';
    }
    
    const currentEl = groups[currentGroup];
    const nextEl = groups[index];
    
    // Actualizar ARIA para accesibilidad
    currentEl.setAttribute('aria-hidden', 'true');
    nextEl.setAttribute('aria-hidden', 'false');
    
    // Aplicar clases para animación
    currentEl.classList.remove('active');
    currentEl.classList.add('going-out');
    
    nextEl.classList.add('active');
    nextEl.classList.add('coming-in');
    
    // Eliminar clases después de la transición
    setTimeout(() => {
      currentEl.classList.remove('going-out');
      nextEl.classList.remove('coming-in');
    }, TRANSITION_DURATION);
    
    // Actualizar índice actual
    currentGroup = index;
    
    // Anunciar cambio para lectores de pantalla
    announceGroupChange(index + 1, groups.length);
  }
  
  /**
   * Avanza al siguiente grupo
   */
  function nextGroup() {
    const newIndex = (currentGroup + 1) % groups.length;
    showGroup(newIndex, 'next');
    resetAutoRotate();
  }
  
  /**
   * Retrocede al grupo anterior
   */
  function prevGroup() {
    const newIndex = (currentGroup - 1 + groups.length) % groups.length;
    showGroup(newIndex, 'prev');
    resetAutoRotate();
  }
  
  /**
   * Inicia o reinicia la rotación automática
   */
  function startAutoRotate() {
    clearInterval(autoRotateTimer);
    if (!isPaused) {
      autoRotateTimer = setInterval(nextGroup, AUTO_ROTATE_DELAY);
    }
  }
  
  /**
   * Reinicia el temporizador de rotación automática
   */
  function resetAutoRotate() {
    startAutoRotate();
  }
  
  /**
   * Detiene temporalmente la rotación automática
   */
  function pauseAutoRotate() {
    clearInterval(autoRotateTimer);
  }
  
  // Configurar eventos para botones
  if (prevButton) {
    prevButton.addEventListener('click', prevGroup);
  }
  
  if (nextButton) {
    nextButton.addEventListener('click', nextGroup);
  }
  
  // Configurar eventos táctiles (swipe)
  setupSwipeSupport(wrapper, prevGroup, nextGroup);
  
  // Pausar en hover/foco
  wrapper.addEventListener('mouseenter', () => {
    isPaused = true;
    pauseAutoRotate();
  });
  
  wrapper.addEventListener('mouseleave', () => {
    isPaused = false;
    startAutoRotate();
  });
  
  wrapper.addEventListener('focusin', () => {
    isPaused = true;
    pauseAutoRotate();
  });
  
  wrapper.addEventListener('focusout', (e) => {
    if (!wrapper.contains(e.relatedTarget)) {
      isPaused = false;
      startAutoRotate();
    }
  });
  
  // Configurar soporte para teclado
  wrapper.setAttribute('tabindex', '0');
  wrapper.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      prevGroup();
    } else if (e.key === 'ArrowRight') {
      nextGroup();
    } else if (e.key === ' ') {
      e.preventDefault(); // Prevenir scroll
      isPaused = !isPaused;
      if (isPaused) {
        pauseAutoRotate();
      } else {
        startAutoRotate();
      }
    }
  });
  
  // Mostrar primer grupo e iniciar rotación automática
  showGroup(0);
  startAutoRotate();
  
  // Pausar rotación cuando la página no es visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pauseAutoRotate();
    } else if (!isPaused) {
      startAutoRotate();
    }
  });
}

/**
 * Configura estructura y accesibilidad
 */
function setupTestimonialsStructure(wrapper, groups) {
  // Configurar contenedor
  wrapper.setAttribute('role', 'region');
  wrapper.setAttribute('aria-roledescription', 'carrusel');
  wrapper.setAttribute('aria-label', 'Testimonios de clientes');
  
  // Crear región para anuncios de lectores de pantalla
  const liveRegion = document.createElement('div');
  liveRegion.className = 'visually-hidden';
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.id = 'testimonials-announcer';
  wrapper.appendChild(liveRegion);
  
  // Configurar cada grupo
  groups.forEach((group, index) => {
    group.setAttribute('aria-hidden', index !== 0 ? 'true' : 'false');
  });
}

/**
 * Crea controles de navegación
 */
function createTestimonialsControls(container) {
  // Crear contenedor de controles
  const controls = document.createElement('div');
  controls.className = 'comentarios-controls';
  container.appendChild(controls);
  
  // Crear botones
  const prevButton = document.createElement('button');
  prevButton.className = 'comentario-control prev-button';
  prevButton.innerHTML = '<i class="bi bi-chevron-left"></i>';
  prevButton.setAttribute('aria-label', 'Testimonios anteriores');
  prevButton.type = 'button';
  
  const nextButton = document.createElement('button');
  nextButton.className = 'comentario-control next-button';
  nextButton.innerHTML = '<i class="bi bi-chevron-right"></i>';
  nextButton.setAttribute('aria-label', 'Siguientes testimonios');
  nextButton.type = 'button';
  
  controls.appendChild(prevButton);
  controls.appendChild(nextButton);
  
  return { prevButton, nextButton };
}

/**
 * Anuncia cambio de grupo para lectores de pantalla
 */
function announceGroupChange(current, total) {
  const announcer = document.getElementById('testimonials-announcer');
  if (announcer) {
    announcer.textContent = `Mostrando testimonios ${current} de ${total}`;
  }
}

/**
 * Configura soporte para gestos táctiles (swipe)
 */
function setupSwipeSupport(element, onSwipeRight, onSwipeLeft) {
  let touchStartX = 0;
  let touchEndX = 0;
  const swipeThreshold = 50;
  
  element.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  element.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swipe izquierda -> avanzar
      onSwipeLeft();
    } else if (touchEndX > touchStartX + swipeThreshold) {
      // Swipe derecha -> retroceder
      onSwipeRight();
    }
  }
}