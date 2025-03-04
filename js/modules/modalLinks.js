/**
 * modalLinks.js - Módulo para manejar los enlaces en modales
 */

/**
 * Inicializa el comportamiento de los enlaces en modales
 */
export function initModalLinks() {
    console.log('Inicializando enlaces de modal...');
    
    // Encontrar todos los enlaces dentro de modales que apuntan a secciones de la página
    const modalLinks = document.querySelectorAll('.modal a[href^="#"], .modal button[data-bs-dismiss="modal"][href^="#"]');
    
    modalLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        // Obtener el ID de la sección a la que se quiere navegar
        const targetId = this.getAttribute('href');
        
        // Si es un enlace interno (comienza con #)
        if (targetId && targetId.startsWith('#')) {
          e.preventDefault(); // Prevenir comportamiento por defecto
          
          // Cerrar el modal
          const modal = bootstrap.Modal.getInstance(document.querySelector('.modal.show'));
          if (modal) {
            modal.hide();
            
            // Esperar a que se cierre el modal antes de desplazarse
            setTimeout(() => {
              // Navegar a la sección
              const targetElement = document.querySelector(targetId);
              if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Opcional: Destacar brevemente la sección
                targetElement.classList.add('highlight-section');
                setTimeout(() => {
                  targetElement.classList.remove('highlight-section');
                }, 2000);
              }
            }, 300); // Esperar 300ms para que termine la animación del modal
          }
        }
      });
    });
    
    console.log('Enlaces de modal configurados correctamente');
  }