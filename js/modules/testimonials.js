


/**
 * Módulo para la gestión del carrusel de testimonios
 * Maneja grupos de tarjetas de testimonios con rotación automática
 * y controles de navegación.
 */

// Constantes de configuración
const CONFIG = Object.freeze({
  AUTO_ROTATE_DELAY: 8000, // ms entre rotaciones automáticas
  TRANSITION_DURATION: 500, // ms para duración de transiciones
  SWIPE_THRESHOLD: 50, // umbral para detección de swipe
  SELECTORS: {
    SECTION: '.comentarios-section',
    WRAPPER: '.comentarios-wrapper',
    GROUP: '.comentarios-group'
  }
});

/**
 * Clase Carrusel de Testimonios
 * Encapsula toda la funcionalidad del carrusel
 */
class TestimonialsCarousel {
  constructor(section) {
    this.section = section;
    this.wrapper = section.querySelector(CONFIG.SELECTORS.WRAPPER);
    this.groups = this.wrapper ? Array.from(this.wrapper.querySelectorAll(CONFIG.SELECTORS.GROUP)) : [];
    this.currentGroup = 0;
    this.autoRotateTimer = null;
    this.isPaused = false;
    this.announcer = null;
    this.controls = { prevButton: null, nextButton: null };
    
    // Verificar si hay suficientes grupos para mostrar como carrusel
    if (!this.wrapper || this.groups.length <= 1) {
      this.handleSingleGroup();
      return;
    }
    
    this.init();
  }
  
  /**
   * Muestra un solo grupo sin funcionalidad de carrusel
   */
  handleSingleGroup() {
    if (this.groups.length === 1) {
      this.groups[0].classList.add('active');
    }
  }
  
  /**
   * Inicializa el carrusel
   */
  init() {
    this.setupAccessibility();
    this.createControls();
    this.setupEventListeners();
    this.showGroup(0);
    this.startAutoRotate();
  }
  
  /**
   * Configura estructura y accesibilidad
   */
  setupAccessibility() {
    // Configurar contenedor
    this.wrapper.setAttribute('role', 'region');
    this.wrapper.setAttribute('aria-roledescription', 'carrusel');
    this.wrapper.setAttribute('aria-label', 'Testimonios de clientes');
    this.wrapper.setAttribute('tabindex', '0');
    
    // Crear región para anuncios de lectores de pantalla
    this.announcer = document.createElement('div');
    this.announcer.className = 'visually-hidden';
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.id = 'testimonials-announcer';
    this.wrapper.appendChild(this.announcer);
    
    // Configurar cada grupo
    this.groups.forEach((group, index) => {
      group.setAttribute('aria-hidden', index !== 0 ? 'true' : 'false');
    });
  }
  
  /**
   * Crea controles de navegación
   */
  createControls() {
    // Crear contenedor de controles
    const controls = document.createElement('div');
    controls.className = 'comentarios-controls';
    
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
    this.section.appendChild(controls);
    
    this.controls = { prevButton, nextButton };
  }
  
  /**
   * Configura todos los event listeners
   */
  setupEventListeners() {
    // Eventos para botones
    this.controls.prevButton.addEventListener('click', this.prevGroup.bind(this));
    this.controls.nextButton.addEventListener('click', this.nextGroup.bind(this));
    
    // Configurar eventos táctiles (swipe)
    this.setupSwipeSupport();
    
    // Pausar en hover/foco
    this.wrapper.addEventListener('mouseenter', () => {
      this.isPaused = true;
      this.pauseAutoRotate();
    });
    
    this.wrapper.addEventListener('mouseleave', () => {
      this.isPaused = false;
      this.startAutoRotate();
    });
    
    this.wrapper.addEventListener('focusin', () => {
      this.isPaused = true;
      this.pauseAutoRotate();
    });
    
    this.wrapper.addEventListener('focusout', (e) => {
      if (!this.wrapper.contains(e.relatedTarget)) {
        this.isPaused = false;
        this.startAutoRotate();
      }
    });
    
    // Configurar soporte para teclado
    this.wrapper.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
    
    // Pausar rotación cuando la página no es visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAutoRotate();
      } else if (!this.isPaused) {
        this.startAutoRotate();
      }
    });
  }
  
  /**
   * Maneja la navegación por teclado
   */
  handleKeyboardNavigation(e) {
    switch (e.key) {
      case 'ArrowLeft':
        this.prevGroup();
        break;
      case 'ArrowRight':
        this.nextGroup();
        break;
      case ' ':
        e.preventDefault(); // Prevenir scroll
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
          this.pauseAutoRotate();
        } else {
          this.startAutoRotate();
        }
        break;
      case 'Home':
        e.preventDefault();
        this.showGroup(0);
        this.resetAutoRotate();
        break;
      case 'End':
        e.preventDefault();
        this.showGroup(this.groups.length - 1);
        this.resetAutoRotate();
        break;
    }
  }
  
  /**
   * Configura soporte para gestos táctiles (swipe)
   */
  setupSwipeSupport() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    const handleStart = (e) => {
      touchStartX = e.type === 'touchstart' 
        ? e.changedTouches[0].screenX 
        : e.clientX;
    };
    
    const handleEnd = (e) => {
      touchEndX = e.type === 'touchend' 
        ? e.changedTouches[0].screenX 
        : e.clientX;
      
      if (touchEndX < touchStartX - CONFIG.SWIPE_THRESHOLD) {
        // Swipe izquierda -> avanzar
        this.nextGroup();
      } else if (touchEndX > touchStartX + CONFIG.SWIPE_THRESHOLD) {
        // Swipe derecha -> retroceder
        this.prevGroup();
      }
    };
    
    // Eventos táctiles
    this.wrapper.addEventListener('touchstart', handleStart, { passive: true });
    this.wrapper.addEventListener('touchend', handleEnd, { passive: true });
    
    // Soporte para mouse (arrastrar) - opcional
    this.wrapper.addEventListener('mousedown', handleStart);
    this.wrapper.addEventListener('mouseup', handleEnd);
  }
  
  /**
   * Muestra un grupo específico con animación
   * @param {number} index - Índice del grupo a mostrar
   * @param {string|null} direction - Dirección de la animación ('next', 'prev' o null)
   */
  showGroup(index, direction = null) {
    if (index === this.currentGroup || index < 0 || index >= this.groups.length) return;
    
    // Determinar dirección si no se especifica
    if (direction === null) {
      direction = index > this.currentGroup ? 'next' : 'prev';
    }
    
    const currentEl = this.groups[this.currentGroup];
    const nextEl = this.groups[index];
    
    // Actualizar ARIA para accesibilidad
    currentEl.setAttribute('aria-hidden', 'true');
    nextEl.setAttribute('aria-hidden', 'false');
    
    // Aplicar clases para animación
    currentEl.classList.remove('active');
    currentEl.classList.add('going-out', direction === 'next' ? 'to-left' : 'to-right');
    
    nextEl.classList.add('active');
    nextEl.classList.add('coming-in', direction === 'next' ? 'from-right' : 'from-left');
    
    // Eliminar clases después de la transición
    setTimeout(() => {
      currentEl.classList.remove('going-out', 'to-left', 'to-right');
      nextEl.classList.remove('coming-in', 'from-right', 'from-left');
    }, CONFIG.TRANSITION_DURATION);
    
    // Actualizar índice actual
    this.currentGroup = index;
    
    // Anunciar cambio para lectores de pantalla
    this.announceGroupChange();
  }
  
  /**
   * Avanza al siguiente grupo
   */
  nextGroup() {
    const newIndex = (this.currentGroup + 1) % this.groups.length;
    this.showGroup(newIndex, 'next');
    this.resetAutoRotate();
  }
  
  /**
   * Retrocede al grupo anterior
   */
  prevGroup() {
    const newIndex = (this.currentGroup - 1 + this.groups.length) % this.groups.length;
    this.showGroup(newIndex, 'prev');
    this.resetAutoRotate();
  }
  
  /**
   * Inicia o reinicia la rotación automática
   */
  startAutoRotate() {
    this.clearAutoRotateTimer();
    if (!this.isPaused) {
      this.autoRotateTimer = setInterval(() => this.nextGroup(), CONFIG.AUTO_ROTATE_DELAY);
    }
  }
  
  /**
   * Limpia el temporizador actual
   */
  clearAutoRotateTimer() {
    if (this.autoRotateTimer) {
      clearInterval(this.autoRotateTimer);
      this.autoRotateTimer = null;
    }
  }
  
  /**
   * Reinicia el temporizador de rotación automática
   */
  resetAutoRotate() {
    this.startAutoRotate();
  }
  
  /**
   * Detiene temporalmente la rotación automática
   */
  pauseAutoRotate() {
    this.clearAutoRotateTimer();
  }
  
  /**
   * Anuncia cambio de grupo para lectores de pantalla
   */
  announceGroupChange() {
    if (this.announcer) {
      this.announcer.textContent = `Mostrando testimonios ${this.currentGroup + 1} de ${this.groups.length}`;
    }
  }
}

/**
 * Inicializa todos los carruseles de testimonios en la página
 */
export function initTestimonials() {
  const testimonialSections = document.querySelectorAll(CONFIG.SELECTORS.SECTION);
  
  if (!testimonialSections.length) return;
  
  // Crear un carrusel para cada sección encontrada
  return Array.from(testimonialSections).map(section => new TestimonialsCarousel(section));
}

// Si se necesita inicializar automáticamente cuando se carga el documento (opcional)
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initTestimonials();
  });
}