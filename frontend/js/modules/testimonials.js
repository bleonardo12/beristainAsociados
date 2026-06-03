/**
 * Módulo para la gestión del carrusel de testimonios (v2.0)
 * Implementación optimizada con AbortController, IntersectionObserver y A11y.
 */

const CONFIG = Object.freeze({
  AUTO_ROTATE_DELAY: 8000,
  TRANSITION_DURATION: 500,
  SWIPE_THRESHOLD: 50,
  SELECTORS: {
    SECTION: '.comentarios-section',
    WRAPPER: '.comentarios-wrapper',
    GROUP: '.comentarios-group'
  }
});

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
    
    // Controlador de aborto para limpiar eventos
    this.abortController = new AbortController();

    if (!this.wrapper || this.groups.length <= 1) {
      if (this.groups.length === 1) this.groups[0].classList.add('active');
      return;
    }
    
    this.init();
  }
  
  init() {
    const { signal } = this.abortController;
    this.setupAccessibility();
    this.createControls();
    this.setupEventListeners(signal);
    this.setupObserver();
    this.showGroup(0);
    this.startAutoRotate();
  }
  
  setupAccessibility() {
    this.wrapper.setAttribute('role', 'region');
    this.wrapper.setAttribute('aria-roledescription', 'carrusel');
    this.wrapper.setAttribute('aria-label', 'Testimonios de clientes');
    this.wrapper.setAttribute('tabindex', '0');
    
    this.announcer = document.createElement('div');
    this.announcer.className = 'visually-hidden';
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.wrapper.appendChild(this.announcer);
    
    this.groups.forEach((group, index) => {
      group.setAttribute('aria-hidden', index !== 0 ? 'true' : 'false');
    });
  }
  
  createControls() {
    const controls = document.createElement('div');
    controls.className = 'comentarios-controls';
    
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
  
  setupObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          this.pauseAutoRotate();
        } else if (!this.isPaused) {
          this.startAutoRotate();
        }
      });
    }, { threshold: 0.1 });
    
    observer.observe(this.wrapper);
  }
  
  setupEventListeners(signal) {
    this.controls.prevButton.addEventListener('click', () => this.prevGroup(), { signal });
    this.controls.nextButton.addEventListener('click', () => this.nextGroup(), { signal });
    
    const pause = () => { this.isPaused = true; this.pauseAutoRotate(); };
    const resume = () => { this.isPaused = false; this.startAutoRotate(); };

    this.wrapper.addEventListener('mouseenter', pause, { signal });
    this.wrapper.addEventListener('mouseleave', resume, { signal });
    this.wrapper.addEventListener('focusin', pause, { signal });
    this.wrapper.addEventListener('focusout', (e) => {
      if (!this.wrapper.contains(e.relatedTarget)) resume();
    }, { signal });
    
    this.wrapper.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e), { signal });
    
    document.addEventListener('visibilitychange', () => {
      document.hidden ? this.pauseAutoRotate() : this.startAutoRotate();
    }, { signal });

    this.setupSwipeSupport(signal);
  }
  
  handleKeyboardNavigation(e) {
    switch (e.key) {
      case 'ArrowLeft': this.prevGroup(); break;
      case 'ArrowRight': this.nextGroup(); break;
      case ' ':
        e.preventDefault();
        this.isPaused = !this.isPaused;
        this.isPaused ? this.pauseAutoRotate() : this.startAutoRotate();
        break;
      case 'Home': e.preventDefault(); this.showGroup(0); this.resetAutoRotate(); break;
      case 'End': e.preventDefault(); this.showGroup(this.groups.length - 1); this.resetAutoRotate(); break;
    }
  }
  
  setupSwipeSupport(signal) {
    let touchStartX = 0;
    const handleStart = (e) => { touchStartX = e.type === 'touchstart' ? e.changedTouches[0].screenX : e.clientX; };
    const handleEnd = (e) => {
      const touchEndX = e.type === 'touchend' ? e.changedTouches[0].screenX : e.clientX;
      if (touchEndX < touchStartX - CONFIG.SWIPE_THRESHOLD) this.nextGroup();
      else if (touchEndX > touchStartX + CONFIG.SWIPE_THRESHOLD) this.prevGroup();
    };
    
    this.wrapper.addEventListener('touchstart', handleStart, { passive: true, signal });
    this.wrapper.addEventListener('touchend', handleEnd, { passive: true, signal });
  }
  
  showGroup(index, direction = null) {
    if (index === this.currentGroup || index < 0 || index >= this.groups.length) return;
    
    const dir = direction || (index > this.currentGroup ? 'next' : 'prev');
    const currentEl = this.groups[this.currentGroup];
    const nextEl = this.groups[index];
    
    requestAnimationFrame(() => {
      currentEl.setAttribute('aria-hidden', 'true');
      nextEl.setAttribute('aria-hidden', 'false');
      
      currentEl.classList.remove('active');
      currentEl.classList.add('going-out', dir === 'next' ? 'to-left' : 'to-right');
      
      nextEl.classList.add('active', 'coming-in', dir === 'next' ? 'from-right' : 'from-left');
      
      setTimeout(() => {
        currentEl.classList.remove('going-out', 'to-left', 'to-right');
        nextEl.classList.remove('coming-in', 'from-right', 'from-left');
      }, CONFIG.TRANSITION_DURATION);
      
      this.currentGroup = index;
      this.announceGroupChange();
    });
  }
  
  nextGroup() { this.showGroup((this.currentGroup + 1) % this.groups.length, 'next'); this.resetAutoRotate(); }
  prevGroup() { this.showGroup((this.currentGroup - 1 + this.groups.length) % this.groups.length, 'prev'); this.resetAutoRotate(); }
  
  startAutoRotate() {
    this.clearAutoRotateTimer();
    if (!this.isPaused) this.autoRotateTimer = setInterval(() => this.nextGroup(), CONFIG.AUTO_ROTATE_DELAY);
  }
  
  clearAutoRotateTimer() { if (this.autoRotateTimer) { clearInterval(this.autoRotateTimer); this.autoRotateTimer = null; } }
  resetAutoRotate() { this.startAutoRotate(); }
  pauseAutoRotate() { this.clearAutoRotateTimer(); }
  
  announceGroupChange() {
    if (this.announcer) this.announcer.textContent = `Mostrando testimonios ${this.currentGroup + 1} de ${this.groups.length}`;
  }

  destroy() {
    this.abortController.abort();
    this.clearAutoRotateTimer();
  }
}

export function initTestimonials() {
  const testimonialSections = document.querySelectorAll(CONFIG.SELECTORS.SECTION);
  return Array.from(testimonialSections).map(section => new TestimonialsCarousel(section));
}

