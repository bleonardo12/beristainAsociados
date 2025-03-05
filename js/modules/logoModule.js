/**
 * LogoModule.js
 * Módulo para la gestión y personalización del logo en el navbar
 * Implementado como una clase con constructor para facilitar la instanciación
 */

/**
 * Clase para gestionar el logo del sitio
 */
export class LogoManager {
    /**
     * Constantes para la configuración del logo
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
     */
    constructor(options = {}) {
      // Establecer opciones por defecto
      this.options = {
        logoSelector: '.logo-principal',
        navbarSelector: 'nav.navbar',
        brandSelector: '.navbar-brand',
        ...options
      };
      
      // Referencias a elementos DOM
      this.logo = null;
      this.navbar = null;
      this.brand = null;
      
      // Inicializar
      this.init();
    }
    
    /**
     * Inicializa el módulo
     */
    init() {
      // Obtener referencias a elementos DOM
      this.logo = document.querySelector(this.options.logoSelector);
      this.navbar = document.querySelector(this.options.navbarSelector);
      this.brand = document.querySelector(this.options.brandSelector);
      
      // Verificar que los elementos existen
      if (!this.logo || !this.navbar) {
        console.warn('LogoManager: No se encontraron los elementos necesarios');
        return;
      }
      
      // Añadir estilos CSS
      this.addLogoStyles();
      
      // Configurar logo
      this.setupLogo();
      
      // Escuchar eventos de resize
      window.addEventListener('resize', () => this.updateSize());
      
      // Observar cambios en navbar
      this.observeNavbarScroll();
      
      console.log('LogoManager: Inicializado correctamente');
    }
    
    /**
     * Configura el comportamiento del logo
     */
    setupLogo() {
      if (!this.logo) return;
      
      // Aplicar tamaño inicial según viewport
      this.updateSize();
      
      // Añadir título para mejorar SEO y accesibilidad
      if (this.brand) {
        this.brand.setAttribute('title', 'Beristain & Javulia Estudio Jurídico');
        
        // Añadir efecto de brillo al hacer hover
        this.brand.addEventListener('mouseenter', () => {
          this.logo.classList.add('logo-highlight');
        });
        
        this.brand.addEventListener('mouseleave', () => {
          this.logo.classList.remove('logo-highlight');
        });
      }
      
      // Función para detectar carga completa del logo
      this.logo.addEventListener('load', () => {
        this.logo.style.opacity = '1';
      });
      
      // Establecer opacity inicial a 0 para evitar saltos visuales
      this.logo.style.opacity = '0';
      
      // Si la imagen ya está en caché, forzar el evento load
      if (this.logo.complete) {
        this.logo.style.opacity = '1';
      }
    }
    
    /**
     * Actualiza el tamaño del logo según el viewport actual
     * @public
     */
    updateSize() {
      if (!this.logo || !this.navbar) return;
      
      const isScrolled = this.navbar.classList.contains('scrolled');
      this.applyScrolledState(isScrolled);
    }
    
    /**
     * Aplica el estado de scroll al logo
     * @param {boolean} isScrolled - Indica si el navbar está scrolled
     * @public
     */
    applyScrolledState(isScrolled) {
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
      
      // Aplicar tamaño
      this.logo.style.maxHeight = `${size}px`;
      this.logo.style.height = 'auto';
    }
    
    /**
     * Observa cambios en la clase 'scrolled' del navbar
     */
    observeNavbarScroll() {
      if (!this.navbar) return;
      
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            const isScrolled = this.navbar.classList.contains('scrolled');
            this.applyScrolledState(isScrolled);
          }
        });
      });
      
      observer.observe(this.navbar, { attributes: true });
    }
    
    /**
     * Añade estilos CSS personalizados para el logo
     */
    addLogoStyles() {
      if (document.getElementById('enhanced-logo-styles')) return;
      
      const styleSheet = document.createElement('style');
      styleSheet.id = 'enhanced-logo-styles';
      styleSheet.textContent = `
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
        }
  
        /* Logo en navbar scrolled */
        .navbar.scrolled .logo-principal {
          max-height: 60px;
        }
  
        /* Efecto de hover para el logo */
        .navbar .navbar-brand:hover .logo-principal {
          transform: scale(1.05);
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15));
        }
        
        /* Efecto de brillo */
        .logo-highlight {
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5)) brightness(1.05) !important;
        }
      `;
      document.head.appendChild(styleSheet);
    }
  }
  
  // Exportar clase por defecto
  export default LogoManager;