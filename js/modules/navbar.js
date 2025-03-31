/**
 * Módulo para la gestión del navbar
 * Incluye funcionalidades para cambio de apariencia al scroll,
 * mejoras de accesibilidad y optimización de rendimiento.
 * 
 * @version 2.0
 */

// Configuración por defecto
const DEFAULT_CONFIG = {
  scrollThreshold: 50,
  largeScreenBreakpoint: 992, // Breakpoint para considerar pantalla grande (md->lg en Bootstrap)
  scrollOffsetAdjustment: 80, // Ajuste de offset para scroll a secciones
  hoverDelay: 200,           // ms de retraso antes de cerrar dropdown en hover
  useNativeScroll: true,     // Usar scrollIntoView en lugar de scrollTo
  handleLogo: false,         // Si debe gestionar el logo (false si se usa LogoManager)
  animationDuration: 300,    // Duración de animaciones
  debug: false               // Modo debug
};

// Variables para limpiar recursos
let navbarListeners = [];
let navbarObservers = [];
let styleElements = [];
let currentConfig = { ...DEFAULT_CONFIG };

/**
 * Inicializa todas las funcionalidades del navbar
 * @param {Object} options - Opciones de configuración personalizadas
 * @returns {Object} API para controlar el navbar
 */
export function initNavbar(options = {}) {
  try {
    // Mezclar opciones con valores predeterminados
    currentConfig = { ...DEFAULT_CONFIG, ...options };
    
    log('Inicializando navbar...');
    
    // Verificar elementos básicos del navbar
    const navbar = document.querySelector('nav.navbar');
    if (!navbar) {
      warn('Elemento navbar no encontrado en el DOM');
      return createNavbarAPI();
    }
    
    // Inicializar componentes en orden
    setupScrollBehavior();
    setupActiveLinks();
    setupAccessibility();
    setupDropdowns();
    
    // Sólo configurar el logo si se especifica y no usa LogoManager
    if (currentConfig.handleLogo) {
      setupLogo();
    }
    
    // Añadir estilos CSS necesarios
    addHoverStyles();
    
    log('Navbar inicializado correctamente');
    
    // Retornar API pública
    return createNavbarAPI();
  } catch (error) {
    error('Error al inicializar navbar:', error);
    
    // Intentar limpiar recursos en caso de error
    cleanup();
    return createNavbarAPI();
  }
}

/**
 * Configura el tamaño del logo y su comportamiento responsive
 * @private
 */
function setupLogo() {
  try {
    const logo = document.querySelector('.logo-principal');
    if (!logo) {
      warn('Logo no encontrado para configurar');
      return;
    }
    
    // Definir tamaños según viewport
    const sizes = {
      xs: { normal: '40px', scrolled: '35px' },  // <= 575.98px
      sm: { normal: '45px', scrolled: '40px' },  // <= 767.98px
      md: { normal: '55px', scrolled: '45px' },  // <= 991.98px
      lg: { normal: '60px', scrolled: '50px' }   // > 991.98px
    };
    
    // Función para ajustar el tamaño según el viewport
    const handleResize = () => {
      try {
        let size;
        
        if (window.innerWidth <= 575.98) {
          size = sizes.xs.normal;
        } else if (window.innerWidth <= 767.98) {
          size = sizes.sm.normal;
        } else if (window.innerWidth <= 991.98) {
          size = sizes.md.normal;
        } else {
          size = sizes.lg.normal;
        }
        
        // Verificar si el navbar está scrolled
        const navbar = document.querySelector('nav.navbar');
        if (navbar && navbar.classList.contains('scrolled')) {
          // Usar tamaño reducido
          if (window.innerWidth <= 575.98) {
            size = sizes.xs.scrolled;
          } else if (window.innerWidth <= 767.98) {
            size = sizes.sm.scrolled;
          } else if (window.innerWidth <= 991.98) {
            size = sizes.md.scrolled;
          } else {
            size = sizes.lg.scrolled;
          }
        }
        
        // Aplicar tamaño
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          logo.style.transition = 'none';
        } else {
          logo.style.transition = `max-height ${currentConfig.animationDuration}ms ease`;
        }
        
        logo.style.maxHeight = size;
        logo.style.height = 'auto';
      } catch (err) {
        error('Error en handleResize:', err);
      }
    };
    
    // Aplicar tamaño inicial
    handleResize();
    
    // Actualizar al cambiar el tamaño de la ventana
    window.addEventListener('resize', debounce(handleResize, 100));
    registerListener(window, 'resize', debounce(handleResize, 100));
    
    // Actualizar al cambiar el estado de scroll del navbar
    const navbar = document.querySelector('nav.navbar');
    if (navbar) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            handleResize();
          }
        });
      });
      
      observer.observe(navbar, { attributes: true });
      registerObserver(observer);
    }
    
    log('Logo configurado');
  } catch (err) {
    error('Error al configurar logo:', err);
  }
}

/**
 * Configura el comportamiento del navbar al hacer scroll
 * Utiliza requestAnimationFrame para optimizar rendimiento
 * @private
 */
function setupScrollBehavior() {
  try {
    const navbar = document.querySelector('nav.navbar');
    if (!navbar) return;
    
    let isScrolled = false;
    let ticking = false;
    
    // Aplicar clase inicial si la página ya está scrolleada al cargar
    if (window.scrollY > currentConfig.scrollThreshold) {
      navbar.classList.add('scrolled');
      isScrolled = true;
    }
    
    // Función para actualizar estado del navbar
    const updateScrollState = () => {
      try {
        const shouldBeScrolled = window.scrollY > currentConfig.scrollThreshold;
        
        if (shouldBeScrolled !== isScrolled) {
          isScrolled = shouldBeScrolled;
          navbar.classList.toggle('scrolled', isScrolled);
          
          // Disparar evento personalizado para otros componentes
          const event = new CustomEvent('navbarScrollStateChange', { 
            detail: { scrolled: isScrolled } 
          });
          navbar.dispatchEvent(event);
          
          log(`Estado de scroll cambiado: ${isScrolled ? 'scrolled' : 'top'}`);
        }
        
        ticking = false;
      } catch (err) {
        error('Error en updateScrollState:', err);
        ticking = false;
      }
    };
    
    // Listener optimizado con requestAnimationFrame
    const scrollHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', scrollHandler, { passive: true });
    registerListener(window, 'scroll', scrollHandler, { passive: true });
    
    log('Comportamiento de scroll configurado');
  } catch (err) {
    error('Error al configurar comportamiento de scroll:', err);
  }
}

/**
 * Configura los enlaces activos basados en la sección visible
 * @private
 */
function setupActiveLinks() {
  try {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    if (navLinks.length === 0) {
      warn('No se encontraron enlaces de navegación');
      return;
    }
    
    // Crear map de enlaces y secciones
    const navSections = [...navLinks]
      .map(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#') && href !== '#') {
          const section = document.querySelector(href);
          return section ? { link, section } : null;
        }
        return null;
      })
      .filter(Boolean);
    
    if (navSections.length === 0) {
      warn('No se encontraron secciones para los enlaces');
      return;
    }
    
    log(`Configurando ${navSections.length} enlaces a secciones`);
    
    // Configurar detección de sección activa
    if ('IntersectionObserver' in window) {
      setupIntersectionBasedActiveLinks(navLinks, navSections);
    } else {
      setupScrollBasedActiveLinks(navLinks, navSections);
    }
    
    // Configurar navegación al hacer clic en enlaces
    setupLinkNavigation(navLinks);
    
    log('Enlaces activos configurados');
  } catch (err) {
    error('Error al configurar enlaces activos:', err);
  }
}

/**
 * Configura la detección de enlaces activos usando IntersectionObserver
 * @param {NodeList} navLinks - Enlaces de navegación
 * @param {Array} navSections - Pares de enlaces y secciones
 * @private
 */
function setupIntersectionBasedActiveLinks(navLinks, navSections) {
  try {
    const observerOptions = {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };
    
    const observerCallback = (entries) => {
      try {
        // Filtrar secciones visibles
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        
        if (visibleEntries.length > 0) {
          // Primero desactivar todos los enlaces
          navLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
          });
          
          // Activar enlace para la sección visible
          visibleEntries.forEach(entry => {
            const matchingItem = navSections.find(item => item.section === entry.target);
            if (matchingItem) {
              matchingItem.link.classList.add('active');
              matchingItem.link.setAttribute('aria-current', 'page');
            }
          });
        }
      } catch (err) {
        error('Error en observerCallback:', err);
      }
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // Observar todas las secciones
    navSections.forEach(item => observer.observe(item.section));
    
    // Registrar observer para limpieza
    registerObserver(observer);
  } catch (err) {
    error('Error al configurar IntersectionObserver para enlaces activos:', err);
    
    // Fallback al método basado en scroll
    setupScrollBasedActiveLinks(navLinks, navSections);
  }
}

/**
 * Configura la detección de enlaces activos usando eventos de scroll
 * @param {NodeList} navLinks - Enlaces de navegación
 * @param {Array} navSections - Pares de enlaces y secciones
 * @private
 */
function setupScrollBasedActiveLinks(navLinks, navSections) {
  try {
    const scrollHandler = () => {
      try {
        const scrollPosition = window.scrollY + 200;
        let activeSection = null;
        
        // Encontrar la sección visible
        for (const item of navSections) {
          const { section } = item;
          const sectionTop = section.offsetTop;
          const sectionBottom = sectionTop + section.offsetHeight;
          
          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            activeSection = item;
            break;
          }
        }
        
        // Actualizar enlaces activos
        if (activeSection) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
          });
          
          activeSection.link.classList.add('active');
          activeSection.link.setAttribute('aria-current', 'page');
        }
      } catch (err) {
        error('Error en scrollHandler:', err);
      }
    };
    
    // Throttle para mejorar rendimiento
    const throttledScrollHandler = throttle(scrollHandler, 100);
    
    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    registerListener(window, 'scroll', throttledScrollHandler, { passive: true });
    
    // Ejecutar una vez inicialmente
    scrollHandler();
  } catch (err) {
    error('Error al configurar enlaces activos basados en scroll:', err);
  }
}

/**
 * Configura la navegación al hacer clic en enlaces
 * @param {NodeList} navLinks - Enlaces de navegación
 * @private
 */
function setupLinkNavigation(navLinks) {
  try {
    navLinks.forEach(link => {
      const clickHandler = (e) => {
        try {
          // Solo procesar enlaces internos
          const href = link.getAttribute('href');
          if (href && href.startsWith('#') && href !== '#') {
            e.preventDefault();
            const targetSection = document.querySelector(href);
            
            if (targetSection) {
              // Scroll suave a la sección
              if (currentConfig.useNativeScroll) {
                targetSection.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'start' 
                });
              } else {
                window.scrollTo({
                  top: targetSection.offsetTop - currentConfig.scrollOffsetAdjustment,
                  behavior: 'smooth'
                });
              }
              
              // Colapsar navbar en móviles después de clic
              const navbarToggler = document.querySelector('.navbar-toggler');
              const navbarCollapse = document.querySelector('.navbar-collapse');
              
              if (navbarToggler && !navbarToggler.classList.contains('collapsed') && 
                  navbarCollapse && navbarCollapse.classList.contains('show')) {
                navbarToggler.click();
              }
              
              // Actualizar URL (opcional, para marcadores)
              history.pushState(null, null, href);
              
              // Anunciar para lectores de pantalla
              announceNavigation(targetSection);
            }
          }
        } catch (err) {
          error('Error en clickHandler:', err);
        }
      };
      
      link.addEventListener('click', clickHandler);
      registerListener(link, 'click', clickHandler);
    });
  } catch (err) {
    error('Error al configurar navegación por clic:', err);
  }
}

/**
 * Anuncia un cambio de sección para lectores de pantalla
 * @param {HTMLElement} section - Sección a la que se navega
 * @private
 */
function announceNavigation(section) {
  try {
    // Crear o reutilizar elemento anunciador
    let announcer = document.getElementById('navbar-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'navbar-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.className = 'sr-only';
      announcer.style.position = 'absolute';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.margin = '-1px';
      announcer.style.padding = '0';
      announcer.style.overflow = 'hidden';
      announcer.style.clip = 'rect(0, 0, 0, 0)';
      announcer.style.whiteSpace = 'nowrap';
      announcer.style.border = '0';
      document.body.appendChild(announcer);
    }
    
    // Buscar un título en la sección
    const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
    const sectionName = heading ? heading.textContent.trim() : 'la sección seleccionada';
    
    // Anunciar navegación
    announcer.textContent = `Navegando a ${sectionName}`;
    
    // Limpiar después de 3 segundos
    setTimeout(() => {
      announcer.textContent = '';
    }, 3000);
  } catch (err) {
    error('Error al anunciar navegación:', err);
  }
}

/**
 * Mejoras de accesibilidad para el navbar
 * @private
 */
function setupAccessibility() {
  try {
    // Mejorar las interacciones de teclado
    const navbarElements = document.querySelectorAll('.navbar-nav .nav-link, .navbar-nav .dropdown-item');
    
    navbarElements.forEach(element => {
      const keydownHandler = (e) => {
        try {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            element.click();
          }
        } catch (err) {
          error('Error en keydownHandler:', err);
        }
      };
      
      // Asegurar que los elementos sean accesibles por teclado
      element.addEventListener('keydown', keydownHandler);
      registerListener(element, 'keydown', keydownHandler);
    });
    
    // Mejorar los atributos ARIA para dropdown
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
      try {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (toggle && menu) {
          // Configurar atributos ARIA
          toggle.setAttribute('aria-haspopup', 'true');
          toggle.setAttribute('aria-expanded', 'false');
          
          const menuId = menu.id || `dropdown-menu-${Math.random().toString(36).substring(2, 9)}`;
          menu.id = menuId;
          toggle.setAttribute('aria-controls', menuId);
          
          menu.setAttribute('role', 'menu');
          
          // Configurar items del menú
          const dropdownItems = menu.querySelectorAll('.dropdown-item');
          dropdownItems.forEach((item, index) => {
            item.setAttribute('role', 'menuitem');
            item.setAttribute('tabindex', '0');
            
            // Si es el primer elemento, asegurarse que reciba foco cuando se abre el menú
            if (index === 0) {
              item.id = item.id || `${menuId}-first-item`;
              menu.setAttribute('aria-activedescendant', item.id);
            }
          });
          
          // Observer para actualizar aria-expanded cuando cambia el estado del dropdown
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.attributeName === 'class') {
                const isExpanded = dropdown.classList.contains('show');
                toggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
              }
            });
          });
          
          observer.observe(dropdown, { attributes: true });
          registerObserver(observer);
        }
      } catch (err) {
        error('Error al configurar accesibilidad para dropdown:', err);
      }
    });
    
    log('Mejoras de accesibilidad configuradas');
  } catch (err) {
    error('Error al configurar accesibilidad:', err);
  }
}

/**
 * Configura los dropdowns para comportamiento diferenciado según tamaño de pantalla
 * @private
 */
function setupDropdowns() {
  try {
    const dropdowns = document.querySelectorAll('.dropdown');
    if (dropdowns.length === 0) {
      warn('No se encontraron dropdowns para configurar');
      return;
    }
    
    // Función para verificar si estamos en pantalla grande
    const isLargeScreen = () => window.innerWidth >= currentConfig.largeScreenBreakpoint;
    
    // Aplicar comportamiento inicial
    applyDropdownBehavior();
    
    // Volver a aplicar comportamiento cuando cambie el tamaño de la ventana
    const resizeHandler = debounce(() => {
      applyDropdownBehavior();
    }, 150);
    
    window.addEventListener('resize', resizeHandler);
    registerListener(window, 'resize', resizeHandler);
    
    // Función para aplicar el comportamiento adecuado según tamaño de pantalla
    function applyDropdownBehavior() {
      try {
        // Eliminar comportamientos anteriores
        cleanup('dropdown');
        
        if (isLargeScreen()) {
          // En pantallas grandes: Activar hover
          setupHoverBehavior();
        } else {
          // En pantallas pequeñas: Activar click
          setupClickBehavior();
        }
      } catch (err) {
        error('Error en applyDropdownBehavior:', err);
      }
    }
    
    // Configurar comportamiento hover para pantallas grandes
    function setupHoverBehavior() {
      try {
        dropdowns.forEach(dropdown => {
          const toggle = dropdown.querySelector('.dropdown-toggle');
          const menu = dropdown.querySelector('.dropdown-menu');
          
          if (!toggle || !menu) return;
          
          // Agregar clases para activar hover
          dropdown.classList.add('dropdown-hover');
          
          // Variables para gestionar timers
          let enterTimer = null;
          let leaveTimer = null;
          
          // Mostrar al hover
          const mouseenterHandler = () => {
            try {
              clearTimeout(leaveTimer);
              
              // Mostrar este dropdown
              dropdown.classList.add('show');
              menu.classList.add('show');
              toggle.setAttribute('aria-expanded', 'true');
              
              // Cerrar otros dropdowns
              dropdowns.forEach(d => {
                if (d !== dropdown && d.classList.contains('show')) {
                  d.classList.remove('show');
                  const m = d.querySelector('.dropdown-menu');
                  const t = d.querySelector('.dropdown-toggle');
                  if (m) m.classList.remove('show');
                  if (t) t.setAttribute('aria-expanded', 'false');
                }
              });
            } catch (err) {
              error('Error en mouseenterHandler:', err);
            }
          };
          
          // Ocultar al quitar hover
          const mouseleaveHandler = () => {
            try {
              clearTimeout(enterTimer);
              
              // Retraso para evitar ocultamiento accidental
              leaveTimer = setTimeout(() => {
                dropdown.classList.remove('show');
                menu.classList.remove('show');
                toggle.setAttribute('aria-expanded', 'false');
              }, currentConfig.hoverDelay);
            } catch (err) {
              error('Error en mouseleaveHandler:', err);
            }
          };
          
          dropdown.addEventListener('mouseenter', mouseenterHandler);
          dropdown.addEventListener('mouseleave', mouseleaveHandler);
          
          registerListener(dropdown, 'mouseenter', mouseenterHandler, 'dropdown');
          registerListener(dropdown, 'mouseleave', mouseleaveHandler, 'dropdown');
        });
        
        log('Comportamiento hover configurado para dropdowns');
      } catch (err) {
        error('Error en setupHoverBehavior:', err);
      }
    }
    
    // Configurar comportamiento click para pantallas pequeñas
    function setupClickBehavior() {
      try {
        // Eliminar clase hover
        dropdowns.forEach(dropdown => {
          dropdown.classList.remove('dropdown-hover');
        });
        
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
        
        // Configurar click toggle
        dropdownToggles.forEach(toggle => {
          const clickHandler = function(e) {
            try {
              // Siempre prevenir comportamiento por defecto en pantallas pequeñas
              if (!isLargeScreen()) {
                e.preventDefault();
                e.stopPropagation();
                
                const parent = this.parentNode;
                const menu = parent.querySelector('.dropdown-menu');
                
                if (!parent || !menu) return;
                
                // Alternar estado del dropdown
                const wasOpen = parent.classList.contains('show');
                
                // Cerrar otros dropdowns
                document.querySelectorAll('.dropdown.show').forEach(d => {
                  if (d !== parent) {
                    d.classList.remove('show');
                    const m = d.querySelector('.dropdown-menu');
                    const t = d.querySelector('.dropdown-toggle');
                    if (m) m.classList.remove('show');
                    if (t) t.setAttribute('aria-expanded', 'false');
                  }
                });
                
                // Alternar este dropdown
                parent.classList.toggle('show', !wasOpen);
                menu.classList.toggle('show', !wasOpen);
                toggle.setAttribute('aria-expanded', !wasOpen ? 'true' : 'false');
                
                // Si se abre, enfocar primer elemento
                if (!wasOpen) {
                  setTimeout(() => {
                    const firstItem = menu.querySelector('.dropdown-item');
                    if (firstItem) firstItem.focus();
                  }, 100);
                }
              }
            } catch (err) {
              error('Error en clickHandler de dropdown:', err);
            }
          };
          
          toggle.addEventListener('click', clickHandler);
          registerListener(toggle, 'click', clickHandler, 'dropdown');
        });
        
        // Cerrar dropdowns al tocar fuera
        const documentClickHandler = function(e) {
          try {
            if (!isLargeScreen() && !e.target.closest('.dropdown')) {
              document.querySelectorAll('.dropdown.show').forEach(d => {
                d.classList.remove('show');
                const m = d.querySelector('.dropdown-menu');
                const t = d.querySelector('.dropdown-toggle');
                if (m) m.classList.remove('show');
                if (t) t.setAttribute('aria-expanded', 'false');
              });
            }
          } catch (err) {
            error('Error en documentClickHandler:', err);
          }
        };
        
        document.addEventListener('click', documentClickHandler);
        registerListener(document, 'click', documentClickHandler, 'dropdown');
        
        log('Comportamiento click configurado para dropdowns');
      } catch (err) {
        error('Error en setupClickBehavior:', err);
      }
    }
    
    log('Dropdowns configurados');
  } catch (err) {
    error('Error al configurar dropdowns:', err);
  }
}

/**
 * Agrega estilos CSS necesarios para los dropdowns hover
 * @private
 */
function addHoverStyles() {
  try {
    // Verificar si ya existe el estilo
    if (!document.getElementById('dropdown-hover-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'dropdown-hover-styles';
      styleSheet.textContent = `
        @media (min-width: ${currentConfig.largeScreenBreakpoint}px) {
          .dropdown-hover:hover > .dropdown-menu {
            display: block;
          }
          .dropdown-hover > .dropdown-toggle:active {
            pointer-events: none;
          }
        }
      `;
      document.head.appendChild(styleSheet);
      styleElements.push(styleSheet);
    }
    
    log('Estilos hover añadidos');
  } catch (err) {
    error('Error al añadir estilos hover:', err);
  }
}

/**
 * Registra un event listener para limpieza posterior
 * @param {HTMLElement} element - Elemento al que se añade el listener
 * @param {string} event - Nombre del evento
 * @param {Function} handler - Función manejadora
 * @param {string} [group] - Grupo opcional para limpieza selectiva
 * @private
 */
function registerListener(element, event, handler, group = 'default') {
  navbarListeners.push({ element, event, handler, group });
}

/**
 * Registra un observer para limpieza posterior
 * @param {MutationObserver|IntersectionObserver} observer - Observer a registrar
 * @private
 */
function registerObserver(observer) {
  navbarObservers.push(observer);
}

/**
 * Limpia los recursos (event listeners, observers, etc.)
 * @param {string} [group] - Grupo específico a limpiar (opcional)
 * @returns {boolean} Resultado de la operación
 * @private
 */
function cleanup(group = null) {
  try {
    // Limpiar listeners
    if (group) {
      // Limpiar solo el grupo especificado
      navbarListeners
        .filter(listener => listener.group === group)
        .forEach(({ element, event, handler }) => {
          element.removeEventListener(event, handler);
        });
      
      // Filtrar para mantener solo los no eliminados
      navbarListeners = navbarListeners.filter(listener => listener.group !== group);
    } else {
      // Limpiar todos
      navbarListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      navbarListeners = [];
      
      // Desconectar observers
      navbarObservers.forEach(observer => observer.disconnect());
      navbarObservers = [];
      
      // Eliminar estilos añadidos
      styleElements.forEach(style => {
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      });
      styleElements = [];
    }
    
    log(`Recursos ${group ? 'del grupo ' + group : ''} liberados correctamente`);
    return true;
  } catch (err) {
    error('Error al limpiar recursos:', err);
    return false;
  }
}

/**
 * Crea una API pública para el navbar
 * @returns {Object} API para controlar el navbar
 * @private
 */
function createNavbarAPI() {
  return {
    /**
     * Actualiza la configuración del navbar
     * @param {Object} options - Nuevas opciones de configuración
     * @returns {Object} API del navbar
     */
    updateConfig: (options = {}) => {
      currentConfig = { ...currentConfig, ...options };
      return createNavbarAPI();
    },
    
    /**
     * Reinicializa el navbar con nuevas opciones
     * @param {Object} options - Nuevas opciones de configuración
     * @returns {Object} API del navbar
     */
    reinit: (options = {}) => {
      cleanup();
      return initNavbar(options);
    },
    
    /**
     * Limpia todos los recursos utilizados por el navbar
     * @returns {boolean} Resultado de la operación
     */
    cleanup: () => cleanup(),
    
    /**
     * Indica si el navbar está en estado scrolled
     * @returns {boolean} Estado scrolled
     */
    isScrolled: () => {
      const navbar = document.querySelector('nav.navbar');
      return navbar ? navbar.classList.contains('scrolled') : false;
    },
    
    /**
     * Navega a una sección específica
     * @param {string} sectionId - ID de la sección (con o sin #)
     * @returns {boolean} Resultado de la operación
     */
    navigateTo: (sectionId) => {
      try {
        const id = sectionId.startsWith('#') ? sectionId : `#${sectionId}`;
        const section = document.querySelector(id);
        
        if (section) {
          section.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
          return true;
        }
        return false;
      } catch (err) {
        error('Error en navigateTo:', err);
        return false;
      }
    }
  };
}

/**
 * Función de utilidad para debounce
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} Función con debounce
 * @private
 */
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Función de utilidad para throttle
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Límite de tiempo en ms
 * @returns {Function} Función con throttle
 * @private
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Funciones de logging
 */
function log(message) {
  if (currentConfig.debug) {
    console.log(`[Navbar] ${message}`);
  }
}

function warn(message) {
  console.warn(`[Navbar] ${message}`);
}

function error(message, err) {
  console.error(`[Navbar] ${message}`, err);
}