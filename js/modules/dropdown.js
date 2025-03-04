/**
 * dropdown.js - Módulo para habilitar el menú desplegable al pasar el cursor
 */

/**
 * Inicializa el comportamiento del menú desplegable
 */
export function initDropdownHover() {
    console.log('Inicializando menús desplegables automáticos...');
    
    // Encontrar todos los dropdowns en la barra de navegación
    const dropdowns = document.querySelectorAll('.navbar-nav .dropdown');
    
    // Agregar listeners para mostrar/ocultar al pasar el cursor
    dropdowns.forEach(dropdown => {
      // Al entrar con el cursor
      dropdown.addEventListener('mouseenter', () => {
        const menu = dropdown.querySelector('.dropdown-menu');
        if (menu) {
          menu.classList.add('show');
        }
      });
      
      // Al salir con el cursor
      dropdown.addEventListener('mouseleave', () => {
        const menu = dropdown.querySelector('.dropdown-menu');
        if (menu) {
          menu.classList.remove('show');
        }
      });
    });
    
    console.log('Menús desplegables configurados correctamente');
  }