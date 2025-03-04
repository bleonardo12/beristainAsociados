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
  
  // Importante: observar cambios en el elemento HTML para aplicar estilos
  observeThemeChanges();
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
  // Prevenir transiciones rápidas
  applyTransitionClass();
  
  // Cambiar tema
  const isDarkMode = document.documentElement.classList.toggle(DARK_CLASS);
  
  // Aplicar el tema a los elementos específicos que Bootstrap podría estar anulando
  applyThemeToElements(isDarkMode);
  
  // Actualizar atributos ARIA e iconos
  updateThemeAttributes(isDarkMode);
  fixThemeIcons();
  
  // Guardar preferencia
  localStorage.setItem(STORAGE_KEY, isDarkMode ? 'dark' : 'light');
  
  // Remover clase de transición después de completarse
  setTimeout(removeTransitionClass, TRANSITION_DURATION);
  
  console.log(`Tema cambiado a: ${isDarkMode ? 'oscuro' : 'claro'}`);
}

/**
 * Aplica el tema a elementos específicos que podrían estar siendo anulados por Bootstrap
 */
function applyThemeToElements(isDark) {
  // Lista de selectores que necesitan ser actualizados manualmente
  const selectors = [
    'body', 
    '.navbar', 
    '.modal-content', 
    '.modal-body', 
    '.modal-header', 
    '.card', 
    '.card-header', 
    '.card-body',
    '.comentario-card',
    'section',
    'footer'
  ];
  
  // Aplicar o quitar la clase a todos los elementos seleccionados
  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      if (isDark) {
        el.classList.add(DARK_CLASS);
      } else {
        el.classList.remove(DARK_CLASS);
      }
    });
  });
  
  // Aplicar color de fondo directamente al body para asegurar que se aplique
  if (isDark) {
    document.body.style.backgroundColor = '#121212';
    document.body.style.color = '#b0b0b0';
  } else {
    document.body.style.backgroundColor = '';
    document.body.style.color = '';
  }
}

/**
 * Observa cambios en el elemento HTML para aplicar estilos
 */
function observeThemeChanges() {
  // Crear un MutationObserver para detectar cambios en las clases del elemento HTML
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        const isDark = document.documentElement.classList.contains(DARK_CLASS);
        applyThemeToElements(isDark);
        fixThemeIcons();
      }
    });
  });
  
  // Configurar el observer para observar cambios en el atributo class del elemento HTML
  observer.observe(document.documentElement, { attributes: true });
}

/**
 * Carga el tema guardado o usa preferencia del sistema
 */
function loadSavedTheme() {
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
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    // Solo cambiar automáticamente si el usuario no ha elegido un tema
    if (localStorage.getItem(STORAGE_KEY) === null) {
      applyTransitionClass();
      document.documentElement.classList.toggle(DARK_CLASS, e.matches);
      applyThemeToElements(e.matches);
      updateThemeAttributes(e.matches);
      fixThemeIcons();
      setTimeout(removeTransitionClass, TRANSITION_DURATION);
      console.log(`Tema actualizado según preferencia del sistema: ${e.matches ? 'oscuro' : 'claro'}`);
    }
  });
}

/**
 * Corrige los iconos del toggle de tema
 */
function fixThemeIcons() {
  const darkIcon = document.querySelector('.dark-icon');
  const lightIcon = document.querySelector('.light-icon');
  
  if (!darkIcon || !lightIcon) return;
  
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
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  
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
}