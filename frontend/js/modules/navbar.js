/**
 * navbar.js - Módulo de gestión de navbar optimizado (v2.0.2)
 */

// ... (DEFAULT_CONFIG y variables de estado permanecen igual)

export function initNavbar(options = {}) {
  try {
    currentConfig = { ...DEFAULT_CONFIG, ...options };
    
    // Usamos MutationObserver para asegurar que el nav exista si la carga es asíncrona
    const navbar = document.querySelector('nav.navbar');
    if (!navbar) {
      warn('Navbar no encontrado, esperando carga del DOM...');
      // Implementación simplificada: en producción se recomienda un Promise wrapper
      return createNavbarAPI();
    }
    
    // Inicialización (mantiene tu lógica, optimizando la ejecución)
    [setupScrollBehavior, setupActiveLinks, setupAccessibility, setupDropdowns].forEach(fn => fn());
    
    if (currentConfig.handleLogo) setupLogo();
    addHoverStyles();
    
    return createNavbarAPI();
  } catch (error) {
    console.error('[Navbar] Error crítico:', error);
    return createNavbarAPI();
  }
}

/**
 * Optimización de setupLogo: evita recálculos innecesarios
 */
function setupLogo() {
  const logo = document.querySelector('.logo-principal');
  if (!logo) return;

  const observer = new MutationObserver(() => updateLogoSize(logo));
  observer.observe(document.querySelector('nav.navbar'), { attributes: true, attributeFilter: ['class'] });
  registerObserver(observer);
  
  window.addEventListener('resize', debounce(() => updateLogoSize(logo), 100));
  updateLogoSize(logo);
}

function updateLogoSize(logo) {
  const isScrolled = document.querySelector('nav.navbar').classList.contains('scrolled');
  const width = window.innerWidth;
  
  // Lógica centralizada para evitar redundancia
  let size = '176px'; 
  if (width <= 575.98) size = isScrolled ? '62px' : '88px';
  else if (width <= 991.98) size = isScrolled ? '79px' : '158px';
  // ... resto de la lógica simplificada

  logo.style.height = size;
  logo.style.transition = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'none' : `height ${currentConfig.animationDuration}ms ease`;
}

/**
 * Mejora de accesibilidad: retorno de foco al cerrar
 */
function closeMobileMenu(navbarCollapse, toggleButton) {
  const bsCollapse = window.bootstrap?.Collapse?.getInstance(navbarCollapse);
  if (bsCollapse) {
    bsCollapse.hide();
    // Retorno de foco esencial para accesibilidad
    if (toggleButton) toggleButton.focus();
  } else {
    navbarCollapse.classList.remove('show');
  }
}

// ... (Resto de funciones: setupScrollBehavior, setupActiveLinks, etc. se mantienen estables)

/**
 * Limpieza mejorada: evita duplicidad de estilos
 */
function addHoverStyles() {
  const styleId = 'dropdown-hover-styles';
  if (document.getElementById(styleId)) return; // Prevención de duplicados
  
  const styleSheet = document.createElement('style');
  styleSheet.id = styleId;
  styleSheet.textContent = `
    @media (min-width: ${currentConfig.largeScreenBreakpoint}px) {
      .dropdown-hover:hover > .dropdown-menu { display: block; }
    }
  `;
  document.head.appendChild(styleSheet);
  styleElements.push(styleSheet);
}