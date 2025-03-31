/**
 * LogoModule.js
 * Módulo para la gestión y personalización del logo en el navbar
 * Implementado como una clase con constructor para facilitar la instanciación
 * 
 * @version 2.0
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
      lg: 80,    // >= 1200px
      md: 70,    // >= 992px
      sm: 65,    // >= 768px
      xs: 55,    // >= 576px
      xxs: 50    // < 576px
    },
    scrolled: {
      lg: 60,    // >= 1200px
      md: 55,    // >= 992px
      sm: 50,    // >= 768px
      xs: 45,    // >= 576px
      xxs: 40    // < 576px
    }
  };

  /**
   * Constructor de la clase
   * @param {Object} options - Opciones de configuración
   * @param {string} options.logoSelector - Selector CSS para el logo
   * @param {string} options.navbarSelector - Selector CSS para el navbar
   * @param {string} options.brandSelector - Selector CSS para el navbar-brand
   * @param {string} options.companyName - Nombre de la compañía para atributos title/alt
   * @param {boolean} options.enableEffects - Habilitar efectos visuales
   * @param {boolean} options.debug - Habilitar mensajes de depuración
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
      // Evitar inicialización duplicada
      if (this.isInitialized) return;
      
      // Obtener referencias a elementos DOM
      this.logo = document.querySelector(this.options.logoSelector);
      this.navbar = document.querySelector(this.options.navbarSelector);
      this.brand = document.querySelector(this.options.brandSelector);
      
      // Verificar que los elementos existen
      if (!this.logo || !this.navbar) {
        this.logWarning('No se encontraron los elementos necesarios');
        return;
      }
      
      // Añadir estilos CSS
      this.addLogoStyles();
      
      // Configurar logo
      this.setupLogo();
      
      // Escuchar eventos de resize
      window.addEventListener('resize', this.resizeHandler);
      
      // Observar cambios en navbar
      this.setupNavbarObserver();
      
      // Observar cambios en preferencias de movimiento
      this.setupMotionPreferenceObserver();
      
      // Marcar como inicializado
      this.isInitialized = true;
      
      this.log('Inicializado correctamente');
    } catch (error) {
      this.logError('Error al inicializar:', error);
      
      // Intentar liberar recursos si hubo error
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
      
      // Aplicar tamaño inicial según viewport
      this.updateSize();
      
      // Mejorar accesibilidad del logo
      this.enhanceLogoAccessibility();
      
      // Añadir efectos visuales si están habilitados
      if (this.options.enableEffects && !this.prefersReducedMotion) {
        this.setupLogoEffects();
      }
      
      // Gestionar carga de la imagen
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
      
      // Añadir título para SEO y accesibilidad
      this.brand.setAttribute('title', this.options.companyName);
      
      // Asegurar que el logo tenga un alt adecuado
      if (!this.logo.hasAttribute('alt') || !this.logo.alt) {
        this.logo.setAttribute('alt', `Logo de ${this.options.companyName}`);
      }
      
      // Añadir atributos ARIA
      this.brand.setAttribute('aria-label', `Ir a la página de inicio de ${this.options.companyName}`);
    } catch (error) {
      this.logError('Error al mejorar accesibilidad:', error);
    }
  }
  
  /**
   * Configura efectos visuales para el logo
   * @private
   */
  setupLogoEffects() {
    try {
      if (!this.logo || !this.brand) return;
      
      // Añadir efecto de brillo al hacer hover
      this.brand.addEventListener('mouseenter', this.handleLogoEnter.bind(this));
      this.brand.addEventListener('mouseleave', this.handleLogoLeave.bind(this));
      this.brand.addEventListener('focus', this.handleLogoEnter.bind(this));
      this.brand.addEventListener('blur', this.handleLogoLeave.bind(this));
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
      
      // Establecer opacity inicial a 0 para evitar saltos visuales
      this.logo.style.opacity = '0';
      
      // Escuchar evento de carga
      this.logo.addEventListener('load', this.handleLogoLoaded.bind(this));
      
      // Si la imagen ya está en caché, forzar la carga inmediata
      if (this.logo.complete) {
        this.handleLogoLoaded();
      }
    } catch (error) {
      this.logError('Error al gestionar carga del logo:', error);
      
      // Asegurar que el logo sea visible aunque haya error
      if (this.logo) {
        this.logo.style.opacity = '1';
      }
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
      
      // Asegurar que el logo sea visible aunque haya error
      if (this.logo) {
        this.logo.style.opacity = '1';
      }
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
   * Aplica el estado de scroll al logo
   * @param {boolean} isScrolled - Indica si el navbar está scrolled
   * @public
   */
  applyScrolledState(isScrolled) {
    try {
      if (!this.logo) return;
      
      const sizeSet = isScrolled ? this.LOGO_SIZES.scrolled : this.LOGO_SIZES.default;
      
      // Determinar el tamaño según el viewport
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
      
      // Aplicar tamaño con animación suave solo si no hay preferencia de reducción de movimiento
      if (this.prefersReducedMotion) {
        this.logo.style.transition = 'none';
      } else {
        this.logo.style.transition = 'all 0.3s ease';
      }
      
      // Aplicar tamaño
      this.logo.style.maxHeight = `${size}px`;
      this.logo.style.height = 'auto';
    } catch (error) {
      this.logError('Error al aplicar estado de scroll:', error);
      
      // Fallback para asegurar que el logo sea visible
      if (this.logo) {
        this.logo.style.maxHeight = '60px';
        this.logo.style.height = 'auto';
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
      
      // Crear MutationObserver
      this.observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            const isScrolled = this.navbar.classList.contains('scrolled');
            this.applyScrolledState(isScrolled);
          }
        });
      });
      
      // Iniciar observación
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
      
      // Función para actualizar preferencia
      const updateMotionPreference = (e) => {
        this.prefersReducedMotion = e.matches;
        this.updateSize(); // Actualizar tamaño para reflejar preferencia
      };
      
      // Evento para cambios de preferencia
      if (motionQuery.addEventListener) {
        motionQuery.addEventListener('change', updateMotionPreference);
      } else if (motionQuery.addListener) {
        // Soporte para Safari más antiguo
        motionQuery.addListener(updateMotionPreference);
      }
    } catch (error) {
      this.logError('Error al configurar motion preference observer:', error);
    }
  }
  
  /**
   * Añade estilos CSS personalizados para el logo
   * @private
   */
  addLogoStyles() {
    try {
      // Verificar si ya existen los estilos
      if (document.getElementById('enhanced-logo-styles')) return;
      
      // Crear elemento de estilo
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'enhanced-logo-styles';
      
      // Definir estilos
      this.styleElement.textContent = `
        /* Estilos para el logo */
        .navbar .navbar-brand {
          padding: 0;
          margin-right: 2rem;
          transition: all 0.3s ease;
        }
  
        .navbar .logo-principal {
          max-height: 80px;
          width: auto;
          transition: all 0.3s ease;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
          /* Prevenir cambio de layout */
          transform: translateZ(0);
          will-change: transform, opacity;
        }
  
        /* Logo en navbar scrolled */
        .navbar.scrolled .logo-principal {
          max-height: 60px;
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
      
      // Añadir al head
      document.head.appendChild(this.styleElement);
    } catch (error) {
      this.logError('Error al añadir estilos CSS:', error);
    }
  }
  
  /**
   * Limpia los recursos del módulo
   * @public
   */
  cleanup() {
    try {
      // Eliminar event listeners
      if (this.brand) {
        this.brand.removeEventListener('mouseenter', this.handleLogoEnter);
        this.brand.removeEventListener('mouseleave', this.handleLogoLeave);
        this.brand.removeEventListener('focus', this.handleLogoEnter);
        this.brand.removeEventListener('blur', this.handleLogoLeave);
      }
      
      if (this.logo) {
        this.logo.removeEventListener('load', this.handleLogoLoaded);
      }
      
      // Eliminar resize handler
      window.removeEventListener('resize', this.resizeHandler);
      
      // Desconectar observer
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      
      // Restablecer estado
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
   * @param {Function} func - Función a ejecutar
   * @param {number} wait - Tiempo de espera en ms
   * @returns {Function} Función con debounce
   * @private
   */
  debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
  
  /**
   * Registra mensaje de log
   * @param {string} message - Mensaje a registrar
   * @private
   */
  log(message) {
    if (this.options.debug) {
      console.log(`[LogoManager] ${message}`);
    }
  }
  
  /**
   * Registra mensaje de advertencia
   * @param {string} message - Mensaje a registrar
   * @private
   */
  logWarning(message) {
    console.warn(`[LogoManager] ${message}`);
  }
  
  /**
   * Registra mensaje de error
   * @param {string} message - Mensaje a registrar
   * @param {Error} error - Error a registrar
   * @private
   */
  logError(message, error) {
    console.error(`[LogoManager] ${message}`, error);
  }
}

// Exportar clase por defecto
export default LogoManager;