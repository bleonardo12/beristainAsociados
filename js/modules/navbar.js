/**
 * Módulo para la gestión del navbar
 * Incluye funcionalidades para cambio de apariencia al scroll,
 * mejoras de accesibilidad y optimización de rendimiento.
 */

// Constantes
const SCROLL_THRESHOLD = 50;
const LARGE_SCREEN_BREAKPOINT = 992; // Breakpoint para considerar pantalla grande (md->lg en Bootstrap)

/**
 * Inicializa todas las funcionalidades del navbar
 */
export function initNavbar() {
  setupScrollBehavior();
  setupActiveLinks();
  setupAccessibility();
  setupDropdowns();
  setupLogo(); // Añadimos la función para el logo
}

/**
 * Configura el tamaño del logo y su comportamiento responsive
 */
function setupLogo() {
  const logo = document.querySelector('.logo-principal');
  if (!logo) return;
  
  // Función para ajustar el tamaño según el viewport
  const handleResize = () => {
    if (window.innerWidth <= 575.98) {
      logo.style.maxHeight = '40px';
    } else if (window.innerWidth <= 767.98) {
      logo.style.maxHeight = '45px';
    } else if (window.innerWidth <= 991.98) {
      logo.style.maxHeight = '55px';
    } else {
      logo.style.maxHeight = '60px';
    }
    logo.style.height = 'auto';
  };
  
  // Aplicar tamaño inicial
  handleResize();
  
  // Actualizar al cambiar el tamaño de la ventana
  window.addEventListener('resize', handleResize);
  
  // Reducir tamaño al hacer scroll (si la clase scrolled está activa)
  const navbar = document.querySelector('nav.navbar');
  if (navbar) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          if (navbar.classList.contains('scrolled')) {
            logo.style.maxHeight = window.innerWidth <= 575.98 ? '35px' : '50px';
          } else {
            handleResize(); // Restaurar tamaño basado en viewport
          }
        }
      });
    });
    
    observer.observe(navbar, { attributes: true });
  }
}

/**
 * Configura el comportamiento del navbar al hacer scroll
 * Utiliza requestAnimationFrame para optimizar rendimiento
 */
function setupScrollBehavior() {
  const navbar = document.querySelector('nav.navbar');
  if (!navbar) return;
  
  let isScrolled = false;
  let ticking = false;
  
  // Aplicar clase inicial si la página ya está scrolleada al cargar
  if (window.scrollY > SCROLL_THRESHOLD) {
    navbar.classList.add('scrolled');
    isScrolled = true;
  }
  
  // Listener optimizado con requestAnimationFrame
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const shouldBeScrolled = window.scrollY > SCROLL_THRESHOLD;
        
        if (shouldBeScrolled !== isScrolled) {
          isScrolled = shouldBeScrolled;
          navbar.classList.toggle('scrolled', isScrolled);
        }
        
        ticking = false;
      });
      
      ticking = true;
    }
  }, { passive: true });
}

/**
 * Configura los enlaces activos basados en la sección visible
 */
function setupActiveLinks() {
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  if (navLinks.length === 0) return;
  
  // Crear observer para las secciones
  if ('IntersectionObserver' in window) {
    const navSections = [...navLinks]
      .map(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#') && href !== '#') {
          const section = document.querySelector(href);
          return { link, section };
        }
        return null;
      })
      .filter(item => item && item.section);
    
    const observerOptions = {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };
    
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        // Encontrar el enlace correspondiente a la sección
        const matchingItem = navSections.find(item => item.section === entry.target);
        if (matchingItem) {
          if (entry.isIntersecting) {
            // Marcar enlace como activo
            navLinks.forEach(link => link.classList.remove('active'));
            matchingItem.link.classList.add('active');
            matchingItem.link.setAttribute('aria-current', 'page');
          } else {
            matchingItem.link.classList.remove('active');
            matchingItem.link.removeAttribute('aria-current');
          }
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // Observar todas las secciones
    navSections.forEach(item => observer.observe(item.section));
  } else {
    // Fallback para navegadores sin IntersectionObserver
    window.addEventListener('scroll', () => {
      const scrollPosition = window.scrollY + 200;
      
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#') && href !== '#') {
          const section = document.querySelector(href);
          
          if (section) {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
              navLinks.forEach(l => l.classList.remove('active'));
              link.classList.add('active');
            }
          }
        }
      });
    }, { passive: true });
  }
  
  // Manejar clics en enlaces de navegación
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Solo procesar enlaces internos
      const href = link.getAttribute('href');
      if (href && href.startsWith('#') && href !== '#') {
        e.preventDefault();
        const targetSection = document.querySelector(href);
        
        if (targetSection) {
          // Scroll suave a la sección
          window.scrollTo({
            top: targetSection.offsetTop - 80, // Ajustar según altura del navbar
            behavior: 'smooth'
          });
          
          // Colapsar navbar en móviles después de clic
          const navbarToggler = document.querySelector('.navbar-toggler');
          const navbarCollapse = document.querySelector('.navbar-collapse');
          
          if (navbarToggler && !navbarToggler.classList.contains('collapsed') && 
              navbarCollapse && navbarCollapse.classList.contains('show')) {
            navbarToggler.click();
          }
          
          // Actualizar URL (opcional, para marcadores)
          history.pushState(null, null, href);
        }
      }
    });
  });
}

/**
 * Mejoras de accesibilidad para el navbar
 */
function setupAccessibility() {
  // Mejorar las interacciones de teclado
  const navbarElements = document.querySelectorAll('.navbar-nav .nav-link, .navbar-nav .dropdown-item');
  
  navbarElements.forEach(element => {
    // Asegurar que los elementos sean accesibles por teclado
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        element.click();
      }
    });
  });
  
  // Mejorar los atributos ARIA para dropdown
  const dropdowns = document.querySelectorAll('.dropdown');
  
  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');
    
    if (toggle && menu) {
      toggle.setAttribute('aria-haspopup', 'true');
      
      menu.setAttribute('role', 'menu');
      
      const dropdownItems = menu.querySelectorAll('.dropdown-item');
      dropdownItems.forEach(item => {
        item.setAttribute('role', 'menuitem');
      });
    }
  });
}

/**
 * Configura los dropdowns para que se muestren al hover en pantallas grandes
 * y al clic en pantallas pequeñas
 */
function setupDropdowns() {
  const dropdowns = document.querySelectorAll('.dropdown');
  
  // Función para verificar si estamos en pantalla grande
  const isLargeScreen = () => window.innerWidth >= LARGE_SCREEN_BREAKPOINT;
  
  // Aplicar comportamiento inicial
  applyDropdownBehavior();
  
  // Volver a aplicar comportamiento cuando cambie el tamaño de la ventana
  window.addEventListener('resize', applyDropdownBehavior);
  
  // Función para aplicar el comportamiento adecuado según tamaño de pantalla
  function applyDropdownBehavior() {
    if (isLargeScreen()) {
      // En pantallas grandes: Activar hover
      setupHoverBehavior();
    } else {
      // En pantallas pequeñas: Activar click
      setupClickBehavior();
    }
  }
  
  // Configurar comportamiento hover para pantallas grandes
  function setupHoverBehavior() {
    dropdowns.forEach(dropdown => {
      // Eliminar manejadores de eventos antiguos si existen
      const toggle = dropdown.querySelector('.dropdown-toggle');
      const menu = dropdown.querySelector('.dropdown-menu');
      
      if (toggle && menu) {
        // Agregar clases de Bootstrap para activar hover
        dropdown.classList.add('dropdown-hover');
        
        // Eventos para mostrar/ocultar al hover (con pequeño retardo)
        let hoverTimer;
        
        // Mostrar al hover
        dropdown.addEventListener('mouseenter', () => {
          clearTimeout(hoverTimer);
          // Cerrar otros dropdowns abiertos
          dropdowns.forEach(d => {
            if (d !== dropdown) {
              d.classList.remove('show');
              const m = d.querySelector('.dropdown-menu');
              if (m) m.classList.remove('show');
            }
          });
          
          dropdown.classList.add('show');
          menu.classList.add('show');
        });
        
        // Ocultar al quitar hover
        dropdown.addEventListener('mouseleave', () => {
          hoverTimer = setTimeout(() => {
            dropdown.classList.remove('show');
            menu.classList.remove('show');
          }, 200); // Pequeño retardo para evitar ocultamiento accidental
        });
      }
    });
  }
  
  // Configurar comportamiento click para pantallas pequeñas
  function setupClickBehavior() {
    // Primero, eliminar cualquier comportamiento hover
    dropdowns.forEach(dropdown => {
      dropdown.classList.remove('dropdown-hover');
    });
    
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    // Para dispositivos táctiles, el primer toque abre el dropdown
    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', function(e) {
        // Siempre prevenir el comportamiento por defecto en pantallas pequeñas
        // para manejar manualmente el dropdown
        if (!isLargeScreen()) {
          e.preventDefault();
          e.stopPropagation();
          
          const parent = this.parentNode;
          
          // Alternar estado del dropdown
          const wasOpen = parent.classList.contains('show');
          
          // Cerrar otros dropdowns
          document.querySelectorAll('.dropdown.show').forEach(d => {
            if (d !== parent) {
              d.classList.remove('show');
              d.querySelector('.dropdown-menu').classList.remove('show');
            }
          });
          
          // Alternar este dropdown
          parent.classList.toggle('show', !wasOpen);
          parent.querySelector('.dropdown-menu').classList.toggle('show', !wasOpen);
        }
      });
    });
    
    // Cerrar dropdowns al tocar fuera
    document.addEventListener('click', function(e) {
      if (!isLargeScreen() && !e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown.show').forEach(d => {
          d.classList.remove('show');
          d.querySelector('.dropdown-menu').classList.remove('show');
        });
      }
    });
  }
}

/**
 * Agrega estilos CSS necesarios para los dropdowns hover
 */
function addHoverStyles() {
  // Verificar si ya existe el estilo
  if (!document.getElementById('dropdown-hover-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'dropdown-hover-styles';
    styleSheet.textContent = `
      @media (min-width: ${LARGE_SCREEN_BREAKPOINT}px) {
        .dropdown-hover:hover > .dropdown-menu {
          display: block;
        }
        .dropdown-hover > .dropdown-toggle:active {
          pointer-events: none;
        }
      }
    `;
    document.head.appendChild(styleSheet);
  }
}

// Llamar a esta función al cargar la página para agregar los estilos CSS necesarios
document.addEventListener('DOMContentLoaded', addHoverStyles);