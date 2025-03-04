/**
 * Módulo para la gestión del carrusel principal (slider-area)
 * Implementa un carrusel accesible, responsive con controles
 * de navegación, autoplay y soporte táctil.
 */

// Constantes de configuración
const AUTOPLAY_DELAY = 5000;          // Tiempo entre slides en autoplay (ms)
const AUTOPLAY_RESTART_DELAY = 10000; // Tiempo para reiniciar autoplay tras interacción (ms)
const TRANSITION_DURATION = 600;      // Duración de las transiciones (ms)
const SWIPE_THRESHOLD = 50;           // Umbral para detectar swipes (px)

/**
 * Inicializa el carrusel
 */
export function initSliders() {
  const sliderArea = document.querySelector('.slider-area');
  if (!sliderArea) return;
  
  const slides = sliderArea.querySelectorAll('.single-slider');
  if (slides.length <= 1) {
    // Si solo hay un slide o ninguno, solo mostrar el primero
    if (slides.length === 1) {
      slides[0].classList.add('active');
    }
    return;
  }
  
  // Configuración inicial
  let currentSlide = 0;
  let isPlaying = true;
  let autoplayTimer = null;
  let isTouching = false;
  
  // Configurar estructura y accesibilidad
  setupSliderStructure(sliderArea, slides);
  
  // Crear controles del slider
  const { prevButton, nextButton, playPauseButton } = createSliderControls(sliderArea);
  
  // Crear indicadores de posición
  const indicators = createSliderIndicators(sliderArea, slides.length);
  
  /**
   * Muestra un slide específico con animación
   */
  function showSlide(index, direction = null) {
    if (index === currentSlide) return;
    
    // Determinar dirección si no se especifica
    if (direction === null) {
      direction = index > currentSlide ? 'next' : 'prev';
    }
    
    const currentEl = slides[currentSlide];
    const nextEl = slides[index];
    
    // Actualizar ARIA para accesibilidad
    currentEl.setAttribute('aria-hidden', 'true');
    nextEl.setAttribute('aria-hidden', 'false');
    
    // Aplicar clases para animación
    currentEl.classList.remove('active');
    currentEl.classList.add(direction === 'next' ? 'leaving-to-left' : 'leaving-to-right');
    
    nextEl.classList.add('active');
    nextEl.classList.add(direction === 'next' ? 'entering-from-right' : 'entering-from-left');
    
    // Actualizar indicadores
    updateIndicators(indicators, index);
    
    // Anunciar cambio para lectores de pantalla
    announceSlideChange(index + 1, slides.length);
    
    // Eliminar clases después de la transición
    setTimeout(() => {
      currentEl.classList.remove('leaving-to-left', 'leaving-to-right');
      nextEl.classList.remove('entering-from-left', 'entering-from-right');
    }, TRANSITION_DURATION);
    
    // Actualizar índice actual
    currentSlide = index;
  }
  
  /**
   * Avanza al siguiente slide
   */
  function nextSlide() {
    const newIndex = (currentSlide + 1) % slides.length;
    showSlide(newIndex, 'next');
  }
  
  /**
   * Retrocede al slide anterior
   */
  function prevSlide() {
    const newIndex = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(newIndex, 'prev');
  }
  
  /**
   * Va a un slide específico y gestiona autoplay
   */
  function goToSlide(index) {
    // Parar autoplay temporalmente
    stopAutoplay();
    
    // Mostrar slide
    showSlide(index);
    
    // Reiniciar autoplay después de un tiempo si estaba activo
    if (isPlaying) {
      setTimeout(startAutoplay, AUTOPLAY_RESTART_DELAY);
    }
  }
  
  /**
   * Inicia el autoplay
   */
  function startAutoplay() {
    stopAutoplay(); // Evitar múltiples intervalos
    autoplayTimer = setInterval(nextSlide, AUTOPLAY_DELAY);
    
    if (playPauseButton) {
      playPauseButton.innerHTML = '<i class="bi bi-pause-fill"></i>';
      playPauseButton.setAttribute('aria-label', 'Pausar presentación');
    }
  }
  
  /**
   * Detiene el autoplay
   */
  function stopAutoplay() {
    clearInterval(autoplayTimer);
  }
  
  /**
   * Alterna el autoplay
   */
  function toggleAutoplay() {
    isPlaying = !isPlaying;
    
    if (isPlaying) {
      startAutoplay();
    } else {
      stopAutoplay();
      
      if (playPauseButton) {
        playPauseButton.innerHTML = '<i class="bi bi-play-fill"></i>';
        playPauseButton.setAttribute('aria-label', 'Reanudar presentación');
      }
    }
  }
  
  // Configurar eventos para botones de control
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      prevSlide();
      stopAutoplay();
      setTimeout(() => { if (isPlaying) startAutoplay(); }, AUTOPLAY_RESTART_DELAY);
    });
  }
  
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      nextSlide();
      stopAutoplay();
      setTimeout(() => { if (isPlaying) startAutoplay(); }, AUTOPLAY_RESTART_DELAY);
    });
  }
  
  if (playPauseButton) {
    playPauseButton.addEventListener('click', toggleAutoplay);
  }
  
  // Configurar eventos para indicadores
  indicators.forEach((indicator, i) => {
    indicator.addEventListener('click', () => goToSlide(i));
  });
  
  // Configurar soporte para teclado
  sliderArea.setAttribute('tabindex', '0');
  sliderArea.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
      stopAutoplay();
      setTimeout(() => { if (isPlaying) startAutoplay(); }, AUTOPLAY_RESTART_DELAY);
    } else if (e.key === 'ArrowRight') {
      nextSlide();
      stopAutoplay();
      setTimeout(() => { if (isPlaying) startAutoplay(); }, AUTOPLAY_RESTART_DELAY);
    } else if (e.key === ' ') {
      e.preventDefault(); // Prevenir scroll
      toggleAutoplay();
    }
  });
  
  // Configurar soporte para gestos táctiles
  setupTouchSupport(sliderArea, prevSlide, nextSlide, () => {
    isTouching = true;
    stopAutoplay();
  }, () => {
    isTouching = false;
    if (isPlaying) {
      setTimeout(startAutoplay, AUTOPLAY_RESTART_DELAY);
    }
  });
  
  // Pausar autoplay cuando se hace hover/foco
  sliderArea.addEventListener('mouseenter', stopAutoplay);
  sliderArea.addEventListener('focusin', stopAutoplay);
  
  sliderArea.addEventListener('mouseleave', () => {
    if (isPlaying && !isTouching) startAutoplay();
  });
  
  sliderArea.addEventListener('focusout', (e) => {
    if (!sliderArea.contains(e.relatedTarget) && isPlaying && !isTouching) {
      startAutoplay();
    }
  });
  
  // Mostrar primer slide e iniciar autoplay
  showSlide(0);
  startAutoplay();
  
  // Detener autoplay si la página está oculta (cambio de pestaña)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoplay();
    } else if (isPlaying) {
      startAutoplay();
    }
  });
}

/**
 * Configura la estructura base del slider y mejora accesibilidad
 */
function setupSliderStructure(sliderArea, slides) {
  // Añadir roles ARIA para accesibilidad
  sliderArea.setAttribute('role', 'region');
  sliderArea.setAttribute('aria-roledescription', 'carrusel');
  sliderArea.setAttribute('aria-label', 'Socios fundadores');
  
  // Crear contenedor para anuncios de lector de pantalla
  const liveRegion = document.createElement('div');
  liveRegion.className = 'visually-hidden';
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.id = 'slider-announcer';
  sliderArea.appendChild(liveRegion);
  
  // Configurar cada slide
  slides.forEach((slide, index) => {
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `Slide ${index + 1} de ${slides.length}`);
    slide.setAttribute('aria-hidden', index !== 0 ? 'true' : 'false');
  });
}

/**
 * Crea los controles de navegación para el slider
 */
function createSliderControls(sliderArea) {
  // Crear contenedor de controles
  const controls = document.createElement('div');
  controls.className = 'slider-controls';
  sliderArea.appendChild(controls);
  
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
  
  return { prevButton, nextButton, playPauseButton };
}

/**
 * Crea los indicadores de posición para el slider
 */
function createSliderIndicators(sliderArea, count) {
  const indicators = document.createElement('div');
  indicators.className = 'slider-indicators';
  sliderArea.appendChild(indicators);
  
  const buttons = [];
  
  for (let i = 0; i < count; i++) {
    const button = document.createElement('button');
    button.className = 'slider-indicator';
    button.type = 'button';
    button.setAttribute('aria-label', `Ir al slide ${i + 1} de ${count}`);
    
    if (i === 0) {
      button.classList.add('active');
      button.setAttribute('aria-current', 'true');
    } else {
      button.setAttribute('aria-current', 'false');
    }
    
    indicators.appendChild(button);
    buttons.push(button);
  }
  
  return buttons;
}

/**
 * Actualiza los indicadores de posición
 */
function updateIndicators(indicators, activeIndex) {
  indicators.forEach((indicator, index) => {
    if (index === activeIndex) {
      indicator.classList.add('active');
      indicator.setAttribute('aria-current', 'true');
    } else {
      indicator.classList.remove('active');
      indicator.setAttribute('aria-current', 'false');
    }
  });
}

/**
 * Anuncia el cambio de slide para lectores de pantalla
 */
function announceSlideChange(current, total) {
  const announcer = document.getElementById('slider-announcer');
  if (announcer) {
    announcer.textContent = `Slide ${current} de ${total}`;
  }
}

/**
 * Configura soporte para gestos táctiles
 */
function setupTouchSupport(element, onSwipeRight, onSwipeLeft, onTouchStart, onTouchEnd) {
  let touchStartX = 0;
  let touchEndX = 0;
  
  element.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    if (onTouchStart) onTouchStart();
  }, { passive: true });
  
  element.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
    if (onTouchEnd) onTouchEnd();
  }, { passive: true });
  
  function handleSwipe() {
    if (touchEndX < touchStartX - SWIPE_THRESHOLD) {
      // Swipe izquierda -> siguiente slide
      onSwipeLeft();
    } else if (touchEndX > touchStartX + SWIPE_THRESHOLD) {
      // Swipe derecha -> slide anterior
      onSwipeRight();
    }
  }
}