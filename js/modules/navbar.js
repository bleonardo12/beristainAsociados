/**
 * Módulo para la gestión del navbar
 * Incluye funcionalidades para cambio de apariencia al scroll,
 * mejoras de accesibilidad y optimización de rendimiento.
 */

// Constantes
const SCROLL_THRESHOLD = 50;

/**
 * Inicializa todas las funcionalidades del navbar
 */
export function initNavbar() {
  setupScrollBehavior();
  setupActiveLinks();
  setupAccessibility();
  setupDropdowns();
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
 * Optimiza el comportamiento de los dropdowns en dispositivos táctiles
 */
function setupDropdowns() {
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  
  // Para dispositivos táctiles, el primer toque abre el dropdown
  if ('ontouchstart' in window) {
    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', function(e) {
        const parent = this.parentNode;
        
        if (!parent.classList.contains('show')) {
          e.preventDefault();
          e.stopPropagation();
          
          // Cerrar otros dropdowns
          document.querySelectorAll('.dropdown.show').forEach(d => {
            if (d !== parent) {
              d.classList.remove('show');
              d.querySelector('.dropdown-menu').classList.remove('show');
            }
          });
          
          // Mostrar este dropdown
          parent.classList.add('show');
          parent.querySelector('.dropdown-menu').classList.add('show');
        }
      });
    });
    
    // Cerrar dropdowns al tocar fuera
    document.addEventListener('touchstart', function(e) {
      if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown.show').forEach(d => {
          d.classList.remove('show');
          d.querySelector('.dropdown-menu').classList.remove('show');
        });
      }
    }, { passive: true });
  }
}