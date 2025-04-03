/**
 * dropdown.js - Módulo para habilitar el menú desplegable solo con clic
 * Con soporte para dispositivos táctiles, accesibilidad y configuración
 */

// Configuración por defecto
const DEFAULT_CONFIG = {
  touchSupport: true,   // habilitar soporte para dispositivos táctiles
  selector: '.navbar-nav .dropdown', // selector de elementos dropdown
  clickOnly: true,      // solo abrir al hacer clic (no hover)
  debug: false          // modo de depuración
};

// Variables para gestionar timeouts
const timers = new Map();

/**
 * Inicializa el comportamiento del menú desplegable
 * @param {Object} config - Configuración personalizada (opcional)
 * @returns {Object} API para controlar los dropdowns
 */
export function initDropdown(config = {}) {
  try {
    const options = { ...DEFAULT_CONFIG, ...config };
    
    if (options.debug) {
      console.log('Inicializando menús desplegables con modo clic...', options);
    }
    
    // Encontrar todos los dropdowns
    const dropdowns = document.querySelectorAll(options.selector);
    
    if (dropdowns.length === 0) {
      console.warn(`No se encontraron dropdowns con el selector: ${options.selector}`);
      return createDropdownAPI([], options);
    }
    
    // Almacenar referencias a los dropdowns configurados
    const configuredDropdowns = [];
    
    // Configurar cada dropdown
    dropdowns.forEach((dropdown, index) => {
      // Asignar ID único si no tiene
      if (!dropdown.id) {
        dropdown.id = `dropdown-${index}`;
      }
      
      // Guardar referencia
      configuredDropdowns.push({
        element: dropdown,
        id: dropdown.id,
        isOpen: false
      });
      
      // Mejorar accesibilidad
      enhanceAccessibility(dropdown);
      
      // Configurar comportamiento de clic
      setupClickBehavior(dropdown, options);
      
      // Soporte para teclado
      setupKeyboardSupport(dropdown, options);
    });
    
    if (options.debug) {
      console.log(`${configuredDropdowns.length} menús desplegables configurados correctamente`);
    }
    
    // Retornar API pública
    return createDropdownAPI(configuredDropdowns, options);
  } catch (error) {
    console.error('Error al inicializar menús desplegables:', error);
    return createDropdownAPI([], DEFAULT_CONFIG);
  }
}

/**
 * Mejora la accesibilidad de un dropdown
 * @param {HTMLElement} dropdown - Elemento dropdown
 */
function enhanceAccessibility(dropdown) {
  try {
    // Obtener elementos relevantes
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');
    
    if (!toggle || !menu) return;
    
    // Añadir atributos ARIA
    toggle.setAttribute('aria-haspopup', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    
    if (!menu.id) {
      menu.id = `${dropdown.id}-menu`;
    }
    
    toggle.setAttribute('aria-controls', menu.id);
    menu.setAttribute('aria-labelledby', toggle.id || `${dropdown.id}-toggle`);
    
    // Asegurar que los items del menú sean accesibles
    const menuItems = menu.querySelectorAll('.dropdown-item');
    menuItems.forEach((item, index) => {
      if (!item.hasAttribute('tabindex')) {
        item.setAttribute('tabindex', '0');
      }
    });
  } catch (error) {
    console.error('Error al mejorar accesibilidad del dropdown:', error);
  }
}

/**
 * Configura el comportamiento de clic para un dropdown
 * @param {HTMLElement} dropdown - Elemento dropdown
 * @param {Object} options - Opciones de configuración
 */
function setupClickBehavior(dropdown, options) {
  try {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');
    
    if (!toggle || !menu) return;
    
    // Configurar solo para clic
    toggle.addEventListener('click', (e) => {
      // Prevenir comportamiento predeterminado
      e.preventDefault();
      e.stopPropagation();
      
      // Alternar estado
      if (menu.classList.contains('show')) {
        hideDropdown(dropdown, menu, toggle);
      } else {
        // Cerrar otros dropdowns abiertos
        document.querySelectorAll(`${options.selector} .dropdown-menu.show`).forEach(openMenu => {
          if (openMenu !== menu) {
            const parentDropdown = openMenu.closest('.dropdown');
            const parentToggle = parentDropdown?.querySelector('.dropdown-toggle');
            if (parentDropdown && parentToggle) {
              hideDropdown(parentDropdown, openMenu, parentToggle);
            }
          }
        });
        
        showDropdown(dropdown, menu, toggle);
      }
    });
    
    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && menu.classList.contains('show')) {
        hideDropdown(dropdown, menu, toggle);
      }
    });
  } catch (error) {
    console.error('Error al configurar comportamiento de clic:', error);
  }
}

/**
 * Configura soporte para teclado en un dropdown
 * @param {HTMLElement} dropdown - Elemento dropdown
 * @param {Object} options - Opciones de configuración
 */
function setupKeyboardSupport(dropdown, options) {
  try {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');
    
    if (!toggle || !menu) return;
    
    // Abrir con Enter o Space
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        
        if (menu.classList.contains('show')) {
          hideDropdown(dropdown, menu, toggle);
        } else {
          showDropdown(dropdown, menu, toggle);
          
          // Enfocar primer elemento del menú
          const firstItem = menu.querySelector('.dropdown-item');
          if (firstItem) {
            setTimeout(() => firstItem.focus(), 100);
          }
        }
      }
    });
    
    // Navegación con teclado dentro del menú
    menu.addEventListener('keydown', (e) => {
      const items = Array.from(menu.querySelectorAll('.dropdown-item:not(.disabled)'));
      const currentIndex = items.indexOf(document.activeElement);
      
      switch (e.key) {
        case 'Escape':
          // Cerrar menú
          e.preventDefault();
          hideDropdown(dropdown, menu, toggle);
          toggle.focus();
          break;
          
        case 'ArrowDown':
          // Navegar hacia abajo
          e.preventDefault();
          if (currentIndex < items.length - 1) {
            items[currentIndex + 1].focus();
          }
          break;
          
        case 'ArrowUp':
          // Navegar hacia arriba
          e.preventDefault();
          if (currentIndex > 0) {
            items[currentIndex - 1].focus();
          } else {
            // Volver al toggle si estamos en el primer elemento
            toggle.focus();
          }
          break;
          
        case 'Tab':
          // Cerrar al salir del menú con Tab
          if (!e.shiftKey && currentIndex === items.length - 1) {
            setTimeout(() => {
              if (!menu.contains(document.activeElement)) {
                hideDropdown(dropdown, menu, toggle);
              }
            }, 10);
          } else if (e.shiftKey && currentIndex === 0) {
            setTimeout(() => {
              if (!menu.contains(document.activeElement)) {
                hideDropdown(dropdown, menu, toggle);
              }
            }, 10);
          }
          break;
      }
    });
  } catch (error) {
    console.error('Error al configurar soporte de teclado:', error);
  }
}

/**
 * Muestra un dropdown
 * @param {HTMLElement} dropdown - Elemento contenedor
 * @param {HTMLElement} menu - Elemento menú
 * @param {HTMLElement} toggle - Elemento toggle
 */
function showDropdown(dropdown, menu, toggle) {
  try {
    menu.classList.add('show');
    toggle.setAttribute('aria-expanded', 'true');
    dropdown.dispatchEvent(new CustomEvent('dropdown:shown'));
  } catch (error) {
    console.error('Error al mostrar dropdown:', error);
  }
}

/**
 * Oculta un dropdown
 * @param {HTMLElement} dropdown - Elemento contenedor
 * @param {HTMLElement} menu - Elemento menú
 * @param {HTMLElement} toggle - Elemento toggle
 */
function hideDropdown(dropdown, menu, toggle) {
  try {
    menu.classList.remove('show');
    toggle.setAttribute('aria-expanded', 'false');
    dropdown.dispatchEvent(new CustomEvent('dropdown:hidden'));
  } catch (error) {
    console.error('Error al ocultar dropdown:', error);
  }
}

/**
 * Crea un API para controlar los dropdowns
 * @param {Array} dropdowns - Lista de dropdowns configurados
 * @param {Object} options - Opciones de configuración
 * @returns {Object} API pública
 */
function createDropdownAPI(dropdowns, options) {
  return {
    /**
     * Muestra un dropdown específico por ID
     * @param {string} id - ID del dropdown
     */
    show: (id) => {
      const dropdown = dropdowns.find(d => d.id === id);
      if (dropdown) {
        const menu = dropdown.element.querySelector('.dropdown-menu');
        const toggle = dropdown.element.querySelector('.dropdown-toggle');
        if (menu && toggle) {
          showDropdown(dropdown.element, menu, toggle);
        }
      }
    },
    
    /**
     * Oculta un dropdown específico por ID
     * @param {string} id - ID del dropdown
     */
    hide: (id) => {
      const dropdown = dropdowns.find(d => d.id === id);
      if (dropdown) {
        const menu = dropdown.element.querySelector('.dropdown-menu');
        const toggle = dropdown.element.querySelector('.dropdown-toggle');
        if (menu && toggle) {
          hideDropdown(dropdown.element, menu, toggle);
        }
      }
    },
    
    /**
     * Oculta todos los dropdowns
     */
    hideAll: () => {
      dropdowns.forEach(dropdown => {
        const menu = dropdown.element.querySelector('.dropdown-menu');
        const toggle = dropdown.element.querySelector('.dropdown-toggle');
        if (menu && toggle && menu.classList.contains('show')) {
          hideDropdown(dropdown.element, menu, toggle);
        }
      });
    },
    
    /**
     * Obtiene la lista de dropdowns configurados
     * @returns {Array} Lista de dropdowns
     */
    getDropdowns: () => dropdowns.map(d => ({ id: d.id, isOpen: d.element.querySelector('.dropdown-menu').classList.contains('show') }))
  };
}