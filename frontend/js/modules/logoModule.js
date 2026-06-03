/**
 * LogoModule.js
 * Módulo para la gestión y personalización del logo en el navbar
 * Implementado como una clase con constructor para facilitar la instanciación
 * * @version 2.0.1
 */

/**
 * Clase para gestionar el logo del sitio
 */
export class LogoManager {
  /**
   * Constantes para la configuración del logo
   * @private
   */
  LOGO_SIZES = {
    default: {
      lg: 52,   // >= 1200px
      md: 50,   // >= 992px
      sm: 48,   // >= 768px
      xs: 44,   // >= 576px
      xxs: 40   // < 576px
    },
    scrolled: {
      lg: 42,   // >= 1200px
      md: 40,   // >= 992px
      sm: 38,   // >= 768px
      xs: 36,   // >= 576px
      xxs: 34   // < 576px
    }
  };

  /**
   * Constructor de la clase
   * @param {Object} options - Opciones de configuración
   */
  constructor(options = {}) {
    try {
      // Establecer opciones por defecto
      this.options = {
        logoSelector: '.logo-principal',
        navbarSelector: 'nav.navbar',
        brandSelector: '.navbar-brand',
        companyName: 'Beristain & Asociados Estudio Jurídico',
        enableEffects: true,
        debug: false,
        ...options
      };
      
      // Referencias a elementos DOM
      this.logo = null;
      this.navbar = null;
      this.brand = null;
      
      // Estado
      this.isInitialized = false;
      this.resizeHandler = this.debounce(this.updateSize.bind(this), 150);
      this.observer = null;
      this.styleElement = null;
      
      // Guardar referencias enlazadas para poder remover los eventos correctamente
      this.boundHandleLogoEnter = this.handleLogoEnter.bind(this);
      this.boundHandleLogoLeave = this.handleLogoLeave.bind(this);
      this.boundHandleLogoLoaded = this.handleLogoLoaded.bind(this);
      
      // Verificar preferencias de movimiento reducido
      this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Inicializar
      this.init();
    } catch (error) {
      this.logError('Error en constructor:', error);
    }
  }
  
  /**
   * Inicializa el módulo
   * @public
   */
  init() {
    try {
      if (this.isInitialized) return;
      
      this.logo = document.querySelector(this.options.logoSelector);
      this.navbar = document.querySelector(this.options.navbarSelector);
      this.brand = document.querySelector(this.options.brandSelector);
      
      if (!this.logo || !this.navbar) {
        this.logWarning('No se encontraron los elementos necesarios');
        return;
      }
      
      this.addLogoStyles();
      this.setupLogo();
      
      window.addEventListener('resize', this.resizeHandler);
      this.setupNavbarObserver();
      this.setupMotionPreferenceObserver();
      
      this.isInitialized = true;
      this.log('Inicializado correctamente');
    } catch (error) {
      this.logError('Error al inicializar:', error);
      this.cleanup();
    }
  }
  
  /**
   * Configura el comportamiento del logo
   * @private
   */
  setupLogo() {
    try {
      if (!this.logo) return;
      
      this.updateSize();
      this.enhanceLogoAccessibility();
      
      if (this.options.enableEffects && !this.prefersReducedMotion) {
        this.setupLogoEffects();
      }
      
      this.handleLogoLoading();
    } catch (error) {
      this.logError('Error al configurar logo:', error);
    }
  }
  
  /**
   * Mejora la accesibilidad del logo
   * @private
   */
  enhanceLogoAccessibility() {
    try {
      if (!this.logo || !this.brand) return;
      
      this.brand.setAttribute('title', this.options.companyName);
      
      if (!this.logo.hasAttribute('alt') || !this.logo.alt) {
        this.logo.setAttribute('alt', `Logo de ${this.options.companyName}`);
      }
      
      this.brand.setAttribute('aria-label', `Ir a la página de inicio de ${this.options.companyName}`);
    } catch (error) {
      this.logError('Error al mejorar accesibilidad:', error);
    }
  }
  
  /**
   * Configura efectos visuales para el logo utilizando referencias enlazadas sólidamente
   * @private
   */
  setupLogoEffects() {
    try {
      if (!this.logo || !this.brand) return;
      
      this.brand.addEventListener('mouseenter', this.boundHandleLogoEnter);
      this.brand.addEventListener('mouseleave', this.boundHandleLogoLeave);
      this.brand.addEventListener('focus', this.boundHandleLogoEnter);
      this.brand.addEventListener('blur', this.boundHandleLogoLeave);
    } catch (error) {
      this.logError('Error al configurar efectos:', error);
    }
  }
  
  /**
   * Maneja la entrada del cursor o foco en el logo
   * @private
   */
  handleLogoEnter() {
    try {
      if (!this.logo || this.prefersReducedMotion) return;
      this.logo.classList.add('logo-highlight');
    } catch (error) {
      this.logError('Error en handleLogoEnter:', error);
    }
  }
  
  /**
   * Maneja la salida del cursor o foco del logo
   * @private
   */
  handleLogoLeave() {
    try {
      if (!this.logo) return;
      this.logo.classList.remove('logo-highlight');
    } catch (error) {
      this.logError('Error en handleLogoLeave:', error);
    }
  }
  
  /**
   * Gestiona la carga del logo para evitar saltos visuales
   * @private
   */
  handleLogoLoading() {
    try {
      if (!this.logo) return;
      
      this.logo.style.opacity = '0';
      this.logo.addEventListener('load', this.boundHandleLogoLoaded);
      
      if (this.logo.complete) {
        this.handleLogoLoaded();
      }
    } catch (error) {
      this.logError('Error al gestionar carga del logo:', error);
      if (this.logo) this.logo.style.opacity = '1';
    }
  }
  
  /**
   * Maneja la carga completa del logo
   * @private
   */
  handleLogoLoaded() {
    try {
      if (!this.logo) return;
      this.logo.style.opacity = '1';
    } catch (error) {
      this.logError('Error en handleLogoLoaded:', error);
      if (this.logo) this.logo.style.opacity = '1';
    }
  }
  
  /**
   * Actualiza el tamaño del logo según el viewport actual
   * @public
   */
  updateSize() {
    try {
      if (!this.logo || !this.navbar) return;
      
      const isScrolled = this.navbar.classList.contains('scrolled');
      this.applyScrolledState(isScrolled);
    } catch (error) {
      this.logError('Error al actualizar tamaño:', error);
    }
  }
  
  /**
   * Aplica el estado de scroll al logo calculando la altura exacta
   * @param {boolean} isScrolled - Indica si el navbar está scrolled
   * @public
   */
  applyScrolledState(isScrolled) {
    try {
      if (!this.logo) return;
      
      const sizeSet = isScrolled ? this.LOGO_SIZES.scrolled : this.LOGO_SIZES.default;
      
      let size;
      if (window.innerWidth >= 1200) {
        size = sizeSet.lg;
      } else if (window.innerWidth >= 992) {
        size = sizeSet.md;
      } else if (window.innerWidth >= 768) {
        size = sizeSet.sm;
      } else if (window.innerWidth >= 576) {
        size = sizeSet.xs;
      } else {
        size = sizeSet.xxs;
      }
      
      if (this.prefersReducedMotion) {
        this.logo.style.transition = 'none';
      } else {
        this.logo.style.transition = 'all 0.3s ease';
      }

      this.logo.style.height = `${size}px`;
      this.logo.style.maxHeight = 'none';
      this.logo.style.width = 'auto';
    } catch (error) {
      this.logError('Error al aplicar estado de scroll:', error);
      if (this.logo) {
        this.logo.style.height = '200px';
        this.logo.style.maxHeight = 'none';
        this.logo.style.width = 'auto';
      }
    }
  }
  
  /**
   * Configura el observer para detectar cambios en la clase 'scrolled' del navbar
   * @private
   */
  setupNavbarObserver() {
    try {
      if (!this.navbar) return;
      
      this.observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            const isScrolled = this.navbar.classList.contains('scrolled');
            this.applyScrolledState(isScrolled);
          }
        });
      });
      
      this.observer.observe(this.navbar, { attributes: true });
    } catch (error) {
      this.logError('Error al configurar observer:', error);
    }
  }
  
  /**
   * Configura observer para cambios en preferencias de movimiento
   * @private
   */
  setupMotionPreferenceObserver() {
    try {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      const updateMotionPreference = (e) => {
        this.prefersReducedMotion = e.matches;
        this.updateSize();
      };
      
      if (motionQuery.addEventListener) {
        motionQuery.addEventListener('change', updateMotionPreference);
      } else if (motionQuery.addListener) {
        motionQuery.addListener(updateMotionPreference);
      }
    } catch (error) {
      this.logError('Error al configurar motion preference observer:', error);
    }
  }
  
  /**
   * Añade estilos CSS personalizados para el logo (Se quitó max-height restrictivo)
   * @private
   */
  addLogoStyles() {
    try {
      if (document.getElementById('enhanced-logo-styles')) return;
      
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'enhanced-logo-styles';
      
      this.styleElement.textContent = `
        /* Estilos para el logo */
        .navbar .navbar-brand {
          padding: 0;
          margin-right: 2rem;
          transition: all 0.3s ease;
        }
  
        .navbar .logo-principal {
          /* El tamaño base se controla desde JS mediante width/height para responder a LOGO_SIZES */
          transition: all 0.3s ease;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
          transform: translateZ(0);
          will-change: transform, opacity;
        }
  
        /* Efecto de hover para el logo */
        @media (prefers-reduced-motion: no-preference) {
          .navbar .navbar-brand:hover .logo-principal,
          .navbar .navbar-brand:focus .logo-principal {
            transform: scale(1.05);
            filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15));
          }
          
          /* Efecto de brillo */
          .logo-highlight {
            filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5)) brightness(1.05) !important;
          }
        }
      `;
      
      document.head.appendChild(this.styleElement);
    } catch (error) {
      this.logError('Error al añadir estilos CSS:', error);
    }
  }
  
  /**
   * Limpia adecuadamente los recursos eliminando los listeners con sus firmas correctas
   * @public
   */
  cleanup() {
    try {
      if (this.brand) {
        this.brand.removeEventListener('mouseenter', this.boundHandleLogoEnter);
        this.brand.removeEventListener('mouseleave', this.boundHandleLogoLeave);
        this.brand.removeEventListener('focus', this.boundHandleLogoEnter);
        this.brand.removeEventListener('blur', this.boundHandleLogoLeave);
      }
      
      if (this.logo) {
        this.logo.removeEventListener('load', this.boundHandleLogoLoaded);
      }
      
      window.removeEventListener('resize', this.resizeHandler);
      
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      
      this.isInitialized = false;
      this.log('Recursos liberados correctamente');
      return true;
    } catch (error) {
      this.logError('Error al limpiar recursos:', error);
      return false;
    }
  }
  
  /**
   * Debounce para evitar llamadas frecuentes a funciones
   */
  debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
  
  /**
   * Logs de diagnóstico
   */
  log(message) {
    if (this.options.debug) {
      console.log(`[LogoManager] ${message}`);
    }
  }
  
  logWarning(message) {
    console.warn(`[LogoManager] ${message}`);
  }
  
  logError(message, error) {
    console.error(`[LogoManager] ${message}`, error);
  }
}

export default LogoManager;