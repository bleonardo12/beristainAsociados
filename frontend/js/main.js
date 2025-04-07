// main.js - Archivo principal moderno usando ES Modules
import { initNavbar } from './modules/navbar.js';
import { initThemeSystem } from './modules/themeEnhanced.js'; // Usa la versión mejorada
import { initSliders } from './modules/sliders.js';
import { initTestimonials } from './modules/testimonials.js';
import { initContactForm } from './modules/contactForm.js';
import { initScrollAnimations } from './modules/animations.js';
import { initCookieConsent } from './modules/cookies.js';
import { initLazyLoad } from './modules/lazyLoad.js';
import { initChatbot } from './modules/chatbot.js';
import { initDropdown } from './modules/dropdown.js'; // Nuevo módulo para el dropdown
import { initModalLinks } from './modules/modalLinks.js';
import { initEmergencyBanner } from './modules/emergencyBanner.js';
import LogoManager from './modules/logoModule.js'; // Importar la clase LogoManager


/**
 * Inicialización de la aplicación con patrones modernos de rendimiento
 */
class App {
  constructor() {
    // Registro de componentes
    this.components = [
      { name: 'navbar', priority: 'critical', init: initNavbar },
      { name: 'theme', priority: 'high', init: initThemeSystem },
      { name: 'dropdown', priority: 'high', init: initDropdown }, // Nuevo componente
      { name: 'lazyLoad', priority: 'high', init: initLazyLoad },
      { name: 'cookies', priority: 'high', init: initCookieConsent },
      { name: 'sliders', priority: 'medium', init: initSliders, selector: '.slider-area' },
      { name: 'testimonials', priority: 'medium', init: initTestimonials, selector: '#comentarios-clientes' },
      { name: 'contactForm', priority: 'medium', init: initContactForm, selector: '#contacto-rapido' },
      { name: 'animations', priority: 'low', init: initScrollAnimations },
      { name: 'chatbot', priority: 'low', init: initChatbot, selector: '#chatbot-container' },
      { name: 'emergencyBanner', priority: 'critical', init: initEmergencyBanner },
      { name: 'modalLinks', priority: 'high', init: initModalLinks },
      { 
        name: 'logo', 
        priority: 'high', 
        init: () => { 
          // Inicializar LogoManager con constructor
          this.logoManager = new LogoManager(); 
          return this.logoManager;
        }
      }
    ];
    
    // Métricas de rendimiento
    this.metrics = { 
      startTime: performance.now(),
      componentsLoaded: 0
    };
    
    // Iniciar aplicación
    this.init();
  }
  
  /**
   * Inicialización optimizada para rendimiento
   */
  init() {
    // Registrar tiempo de carga
    document.addEventListener('DOMContentLoaded', () => {
      this.metrics.domContentLoaded = performance.now() - this.metrics.startTime;
      
      // Iniciar componentes críticos inmediatamente
      this.initCriticalComponents();
      
      // Iniciar componentes de alta prioridad
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => this.initHighPriorityComponents(), { timeout: 500 });
      } else {
        setTimeout(() => this.initHighPriorityComponents(), 50);
      }
      
      // Iniciar componentes basados en visibilidad (bajo el pliegue)
      this.initVisibilityBasedComponents();
      
      // Iniciar componentes de baja prioridad
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => this.initLowPriorityComponents(), { timeout: 2000 });
      } else {
        setTimeout(() => this.initLowPriorityComponents(), 1000);
      }
      
      // Registrar tiempo de carga completa
      window.addEventListener('load', () => {
        this.metrics.windowLoaded = performance.now() - this.metrics.startTime;
        this.logPerformance();
      });
    });
  }
  
  /**
   * Inicializar componentes críticos para la experiencia inicial
   */
  initCriticalComponents() {
    this.components
      .filter(component => component.priority === 'critical')
      .forEach(component => {
        try {
          component.init();
          this.metrics.componentsLoaded++;
        } catch (error) {
          console.error(`Error al inicializar componente crítico "${component.name}":`, error);
        }
      });
  }
  
  /**
   * Inicializar componentes de alta prioridad
   */
  initHighPriorityComponents() {
    this.components
      .filter(component => component.priority === 'high')
      .forEach(component => {
        try {
          component.init();
          this.metrics.componentsLoaded++;
        } catch (error) {
          console.error(`Error al inicializar componente "${component.name}":`, error);
        }
      });
  }
  
  /**
   * Inicializar componentes basados en visibilidad
   */
  initVisibilityBasedComponents() {
    // Crear un IntersectionObserver para componentes que se cargan cuando son visibles
    const componentsToObserve = this.components.filter(component => 
      component.priority === 'medium' && component.selector
    );
    
    if (componentsToObserve.length === 0) return;
    
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Encontrar el componente correspondiente
            const component = componentsToObserve.find(comp => 
              entry.target.matches(comp.selector)
            );
            
            if (component) {
              try {
                component.init();
                this.metrics.componentsLoaded++;
              } catch (error) {
                console.error(`Error al inicializar componente "${component.name}":`, error);
              }
              observer.unobserve(entry.target);
            }
          }
        });
      }, { 
        threshold: 0,
        rootMargin: '200px 0px' // Carga anticipada
      });
      
      // Observar elementos para cada componente
      componentsToObserve.forEach(component => {
        const elements = document.querySelectorAll(component.selector);
        elements.forEach(element => observer.observe(element));
      });
    } else {
      // Fallback para navegadores sin IntersectionObserver
      setTimeout(() => {
        componentsToObserve.forEach(component => {
          try {
            component.init();
            this.metrics.componentsLoaded++;
          } catch (error) {
            console.error(`Error al inicializar componente "${component.name}":`, error);
          }
        });
      }, 500);
    }
  }
  
  /**
   * Inicializar componentes de baja prioridad
   */
  initLowPriorityComponents() {
    this.components
      .filter(component => component.priority === 'low')
      .forEach(component => {
        try {
          component.init();
          this.metrics.componentsLoaded++;
        } catch (error) {
          console.error(`Error al inicializar componente "${component.name}":`, error);
        }
      });
  }
  
  /**
   * Registrar métricas de rendimiento
   */
  logPerformance() {
    console.log('Métricas de rendimiento:', {
      'DOM Content Loaded': `${Math.round(this.metrics.domContentLoaded)}ms`,
      'Window Loaded': `${Math.round(this.metrics.windowLoaded)}ms`,
      'Componentes inicializados': this.metrics.componentsLoaded
    });
  }
}

// Iniciar la aplicación
const app = new App();

// Exponer app en window para debugging en desarrollo
// Comprobación de entorno segura para navegador
const isDevelopment = 
  (typeof window !== 'undefined' && window.location && 
   (window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.includes('.local')));

if (isDevelopment) {
  window.app = app;
}
