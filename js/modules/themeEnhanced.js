/**
 * themeEnhanced.js - Módulo mejorado para la gestión del sistema de temas claro/oscuro
 */

// Constantes para nombres de clases, localStorage, etc.
const DARK_CLASS = 'dark-theme';
const TRANSITION_CLASS = 'color-theme-in-transition';
const STORAGE_KEY = 'theme-preference';
const TRANSITION_DURATION = 750; // ms

/**
 * Inicializa el sistema de temas mejorado
 */
export function initThemeSystem() {
  console.log('Inicializando sistema de temas mejorado...');
  setupThemeToggle();
  loadSavedTheme();
}

/**
 * Configura el botón de cambio de tema
 */
function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) {
    console.warn('Elemento #theme-toggle no encontrado en el DOM');
    return;
  }
  
  // Añadir listener al botón de cambio de tema
  themeToggle.addEventListener('click', () => {
    toggleTheme();
  });
  
  // Mejorar accesibilidad con soporte para teclado
  themeToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTheme();
    }
  });
  
  console.log('Botón de cambio de tema configurado correctamente');
}

/**
 * Alterna entre tema claro y oscuro
 */
function toggleTheme() {
  try {
    // Prevenir transiciones rápidas
    applyTransitionClass();
    
    // Obtener el estado actual
    const isDarkMode = document.documentElement.classList.contains(DARK_CLASS);
    
    // Invertir el estado
    const newMode = !isDarkMode;
    
    // Aplicar o quitar clase al html
    if (newMode) {
      document.documentElement.classList.add(DARK_CLASS);
    } else {
      document.documentElement.classList.remove(DARK_CLASS);
    }
    
    // Aplicar el tema a los elementos específicos
    applyThemeToElements(newMode);
    
    // Actualizar atributos ARIA e iconos
    updateThemeAttributes(newMode);
    fixThemeIcons();
    
    // Guardar preferencia
    localStorage.setItem(STORAGE_KEY, newMode ? 'dark' : 'light');
    
    // Remover clase de transición después de completarse
    setTimeout(removeTransitionClass, TRANSITION_DURATION);
    
    console.log(`Tema cambiado a: ${newMode ? 'oscuro' : 'claro'}`);
  } catch (error) {
    console.error('Error al cambiar el tema:', error);
  }
}

/**
 * Aplica el tema a elementos específicos que podrían estar siendo anulados por Bootstrap
 */
function applyThemeToElements(isDark) {
  try {
    // Aplicar al body principal
    if (isDark) {
      document.body.classList.add(DARK_CLASS);
    } else {
      document.body.classList.remove(DARK_CLASS);
    }
    
    // Lista expandida de selectores para capturar todos los elementos principales
    const selectors = [
      'main',
      'main > section', // Secciones dentro de main
      '.container',
      '.container-fluid',
      '.row',
      '.section-padding',
      '.navbar', 
      '.modal-content', 
      '.modal-body', 
      '.modal-header', 
      '.card', 
      '.card-header', 
      '.card-body',
      '.comentario-card',
      'section',
      '.home',
      '.home-text',
      '.slider-area',
      '.comentarios-section',
      '.contact-form',
      '.chatbot-panel',
      '.chatbot-container',
      'footer'
    ];
    
    // Aplicar o quitar la clase a todos los elementos seleccionados
    selectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => {
          if (isDark) {
            el.classList.add(DARK_CLASS);
          } else {
            el.classList.remove(DARK_CLASS);
          }
        });
      } catch (e) {
        console.warn(`Error al aplicar tema a selector ${selector}:`, e);
      }
    });
    
    // Aplicar color de fondo y texto directamente al body y html
    if (isDark) {
      document.body.style.backgroundColor = '#121212';
      document.body.style.color = '#b0b0b0';
      document.documentElement.style.backgroundColor = '#121212';
    } else {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
      document.documentElement.style.backgroundColor = '';
    }
    
    // Actualizar variables CSS
    updateCSSVariables(isDark);
    
  } catch (error) {
    console.error('Error al aplicar tema a elementos:', error);
  }
}

/**
 * Actualiza las variables CSS según el tema
 */
function updateCSSVariables(isDark) {
  try {
    const root = document.documentElement;
    
    if (isDark) {
      // Variables para tema oscuro
      root.style.setProperty('--neutral-100', '#121212');
      root.style.setProperty('--neutral-200', '#1e1e1e');
      root.style.setProperty('--neutral-300', '#2d2d2d');
      root.style.setProperty('--neutral-400', '#353535');
      root.style.setProperty('--neutral-500', '#5c5c5c');
      root.style.setProperty('--neutral-600', '#b0b0b0');
      root.style.setProperty('--neutral-700', '#f0f0f0');
      
      root.style.setProperty('--neutral-100-rgb', '18, 18, 18');
      root.style.setProperty('--neutral-700-rgb', '240, 240, 240');
      
      root.style.setProperty('--primary', '#4a6fa5');
      root.style.setProperty('--primary-rgb', '74, 111, 165');
      root.style.setProperty('--secondary', '#d4bc45');
      root.style.setProperty('--secondary-rgb', '212, 188, 69');
      root.style.setProperty('--accent', '#6d93d1');
      
      root.style.setProperty('--shadow-sm', '0 2px 8px rgba(0, 0, 0, 0.2)');
      root.style.setProperty('--shadow-md', '0 4px 12px rgba(0, 0, 0, 0.25)');
      root.style.setProperty('--shadow-lg', '0 8px 24px rgba(0, 0, 0, 0.3)');
    } else {
      // Restablecer variables a valores por defecto (tema claro)
      root.style.setProperty('--neutral-100', '#ffffff');
      root.style.setProperty('--neutral-200', '#f8f9fa');
      root.style.setProperty('--neutral-300', '#e9ecef');
      root.style.setProperty('--neutral-400', '#ced4da');
      root.style.setProperty('--neutral-500', '#8d959e');
      root.style.setProperty('--neutral-600', '#495057');
      root.style.setProperty('--neutral-700', '#272b2f');
      
      root.style.setProperty('--neutral-100-rgb', '255, 255, 255');
      root.style.setProperty('--neutral-700-rgb', '39, 43, 47');
      
      root.style.setProperty('--primary', '#1a365d');
      root.style.setProperty('--primary-rgb', '26, 54, 93');
      root.style.setProperty('--secondary', '#c9b037');
      root.style.setProperty('--secondary-rgb', '201, 176, 55');
      root.style.setProperty('--accent', '#4a6fa5');
      
      root.style.setProperty('--shadow-sm', '0 2px 8px rgba(0, 0, 0, 0.04)');
      root.style.setProperty('--shadow-md', '0 4px 12px rgba(0, 0, 0, 0.06)');
      root.style.setProperty('--shadow-lg', '0 8px 24px rgba(0, 0, 0, 0.08)');
    }
    
    // Forzar un repintado para asegurar que los cambios se apliquen
    forceRepaint();
    
  } catch (error) {
    console.error('Error al actualizar variables CSS:', error);
  }
}

/**
 * Fuerza un repintado del DOM para asegurar que los cambios de CSS se apliquen
 */
function forceRepaint() {
  // Esta técnica fuerza un reflow/repaint sin causar un layout shift visible
  const tempDiv = document.createElement('div');
  document.body.appendChild(tempDiv);
  window.getComputedStyle(tempDiv).getPropertyValue('opacity');
  document.body.removeChild(tempDiv);
}

/**
 * Carga el tema guardado o usa preferencia del sistema
 */
function loadSavedTheme() {
  try {
    // Cargar tema guardado si existe
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    
    // Obtener preferencia del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Determinar si se debe usar tema oscuro
    const shouldBeDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
    
    // Aplicar tema inicial sin transición
    if (shouldBeDark) {
      document.documentElement.classList.add(DARK_CLASS);
      applyThemeToElements(true);
    } else {
      document.documentElement.classList.remove(DARK_CLASS);
      applyThemeToElements(false);
    }
    
    // Actualizar atributos ARIA e iconos
    updateThemeAttributes(shouldBeDark);
    fixThemeIcons();
    
    console.log(`Tema inicial cargado: ${shouldBeDark ? 'oscuro' : 'claro'} (guardado: ${savedTheme}, sistema: ${prefersDark ? 'oscuro' : 'claro'})`);
    
    // Escuchar cambios en la preferencia del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Usar addEventListener para navegadores modernos o deprecated handler para compatibilidad
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemPreferenceChange);
    } else if (mediaQuery.addListener) {
      // Para Safari más antiguo
      mediaQuery.addListener(handleSystemPreferenceChange);
    }
    
  } catch (error) {
    console.error('Error al cargar tema guardado:', error);
  }
}

/**
 * Maneja cambios en la preferencia del sistema
 */
function handleSystemPreferenceChange(e) {
  // Solo cambiar automáticamente si el usuario no ha elegido un tema
  if (localStorage.getItem(STORAGE_KEY) === null) {
    applyTransitionClass();
    
    const isDarkMode = e.matches;
    
    // Actualizar clase en html
    if (isDarkMode) {
      document.documentElement.classList.add(DARK_CLASS);
    } else {
      document.documentElement.classList.remove(DARK_CLASS);
    }
    
    applyThemeToElements(isDarkMode);
    updateThemeAttributes(isDarkMode);
    fixThemeIcons();
    
    setTimeout(removeTransitionClass, TRANSITION_DURATION);
    console.log(`Tema actualizado según preferencia del sistema: ${isDarkMode ? 'oscuro' : 'claro'}`);
  }
}

/**
 * Corrige los iconos del toggle de tema
 */
function fixThemeIcons() {
  try {
    const darkIcon = document.querySelector('.dark-icon');
    const lightIcon = document.querySelector('.light-icon');
    
    if (!darkIcon || !lightIcon) {
      console.warn('Iconos de tema no encontrados en el DOM');
      return;
    }
    
    const isDarkTheme = document.documentElement.classList.contains(DARK_CLASS);
    
    if (isDarkTheme) {
      // Modo oscuro: ocultar luna, mostrar sol
      darkIcon.style.opacity = '0';
      darkIcon.style.transform = 'rotate(-90deg)';
      lightIcon.style.opacity = '1';
      lightIcon.style.transform = 'rotate(0)';
    } else {
      // Modo claro: mostrar luna, ocultar sol
      darkIcon.style.opacity = '1';
      darkIcon.style.transform = 'rotate(0)';
      lightIcon.style.opacity = '0';
      lightIcon.style.transform = 'rotate(90deg)';
    }
  } catch (error) {
    console.error('Error al fijar iconos de tema:', error);
  }
}

/**
 * Aplica la clase de transición para suavizar cambios
 */
function applyTransitionClass() {
  document.documentElement.classList.add(TRANSITION_CLASS);
}

/**
 * Remueve la clase de transición
 */
function removeTransitionClass() {
  document.documentElement.classList.remove(TRANSITION_CLASS);
}

/**
 * Actualiza atributos ARIA y textos para accesibilidad
 */
function updateThemeAttributes(isDark) {
  try {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) {
      console.warn('Botón de tema no encontrado para actualizar atributos');
      return;
    }
    
    // Actualizar aria-label según el tema actual
    const newActionText = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
    themeToggle.setAttribute('aria-label', newActionText);
    
    // Actualizar aria-pressed para indicar estado
    themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    
    // Poner o quitar el atributo de color-scheme en <meta>
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#121212' : '#1a365d');
    }
  } catch (error) {
    console.error('Error al actualizar atributos de tema:', error);
  }
}