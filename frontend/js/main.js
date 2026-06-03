// main.js - Archivo principal moderno usando ES Modules
import { initNavbar } from './modules/navbar.js';
import { initThemeSystem } from './modules/themeEnhanced.js';
import { initSliders } from './modules/sliders.js';
import { initTestimonials } from './modules/testimonials.js';
import { initContactForm } from './modules/contactForm.js';
import { initScrollAnimations } from './modules/animations.js';
import { initCookieConsent } from './modules/cookies.js';
import { initLazyLoad } from './modules/lazyLoad.js';
import { initModalLinks } from './modules/modalLinks.js';
import { initEmergencyBanner } from './modules/emergencyBanner.js';
import LogoManager from './modules/logoModule.js';
import { initSmoothScroll } from './modules/smoothScroll.js';
import { initAnalytics } from './modules/analytics.js';

/**
 * Inicialización de la aplicación con patrones modernos de rendimiento
 */
class App {
  constructor() {
    // Registro de componentes
    this.components = [
      { name: 'navbar', priority: 'critical', init: initNavbar, initialized: false },
      { name: 'smoothScroll', priority: 'critical', init: initSmoothScroll, initialized: false },
      { name: 'contactForm', priority: 'critical', init: initContactForm, initialized: false },
      { name: 'theme', priority: 'high', init: initThemeSystem, initialized: false },
      { name: 'analytics', priority: 'high', init: initAnalytics, initialized: false },
      { name: 'lazyLoad', priority: 'high', init: initLazyLoad, initialized: false },
      { name: 'cookies', priority: 'high', init: initCookieConsent, initialized: false },
      { name: 'sliders', priority: 'medium', init: initSliders, selector: '.slider-area', initialized: false },
      { name: 'testimonials', priority: 'medium', init: initTestimonials, selector: '#comentarios-clientes', initialized: false },
      { name: 'animations', priority: 'low', init: initScrollAnimations, initialized: false },
      { name: 'emergencyBanner', priority: 'critical', init: initEmergencyBanner, initialized: false },
      { name: 'modalLinks', priority: 'high', init: initModalLinks, initialized: false },
      {
        name: 'logo',
        priority: 'high',
        initialized: false,
        init: () => {
          this.logoManager = new LogoManager();
          return this.logoManager;
        }
      }
    ];
    
    this.metrics = { 
      startTime: performance.now(),
      componentsLoaded: 0
    };
    
    this.init();
  }
  
  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.metrics.domContentLoaded = performance.now() - this.metrics.startTime;

      this.waitForBootstrap().then(() => {
        console.log('[App] Bootstrap listo, inicializando componentes...');

        this.initCriticalComponents();

        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => this.initHighPriorityComponents(), { timeout: 500 });
        } else {
          setTimeout(() => this.initHighPriorityComponents(), 50);
        }

        this.initVisibilityBasedComponents();

        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => this.initLowPriorityComponents(), { timeout: 2000 });
        } else {
          setTimeout(() => this.initLowPriorityComponents(), 1000);
        }
      });

      window.addEventListener('load', () => {
        this.metrics.windowLoaded = performance.now() - this.metrics.startTime;
        this.logPerformance();
      });
    });
  }

  async waitForBootstrap() {
    return new Promise((resolve) => {
      if (typeof window.bootstrap !== 'undefined' && window.bootstrap.Collapse) {
        resolve();
        return;
      }

      let attempts = 0;
      const maxAttempts = 50; 
      const checkInterval = setInterval(() => {
        attempts++;

        if (typeof window.bootstrap !== 'undefined' && window.bootstrap.Collapse) {
          clearInterval(checkInterval);
          console.log(`[App] Bootstrap detectado después de ${attempts * 100}ms`);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.warn('[App] Bootstrap no detectado, continuando de todas formas...');
          resolve();
        }
      }, 100);
    });
  }
  
  initCriticalComponents() {
    this.components
      .filter(component => component.priority === 'critical')
      .forEach(component => this.safeInit(component));
  }
  
  initHighPriorityComponents() {
    this.components
      .filter(component => component.priority === 'high')
      .forEach(component => this.safeInit(component));
  }
  
  initVisibilityBasedComponents() {
    const componentsToObserve = this.components.filter(component => 
      component.priority === 'medium' && component.selector
    );
    
    if (componentsToObserve.length === 0) return;
    
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const component = componentsToObserve.find(comp => 
              entry.target.matches(comp.selector)
            );
            
            if (component) {
              // Modificación para evitar doble inicialización si hay múltiples selectores iguales
              if (!component.initialized) {
                this.safeInit(component);
              }
              observer.unobserve(entry.target);
            }
          }
        });
      }, { 
        threshold: 0,
        rootMargin: '200px 0px' 
      });
      
      componentsToObserve.forEach(component => {
        const elements = document.querySelectorAll(component.selector);
        elements.forEach(element => observer.observe(element));
      });
    } else {
      // Fallback
      setTimeout(() => {
        componentsToObserve.forEach(component => this.safeInit(component));
      }, 500);
    }
  }
  
  initLowPriorityComponents() {
    this.components
      .filter(component => component.priority === 'low')
      .forEach(component => this.safeInit(component));
  }

  /**
   * Encapsula la inicialización de forma segura evitando duplicados
   */
  safeInit(component) {
    if (component.initialized) return;
    try {
      component.init();
      component.initialized = true;
      this.metrics.componentsLoaded++;
    } catch (error) {
      console.error(`Error al inicializar componente "${component.name}":`, error);
    }
  }
  
  logPerformance() {
    console.log('Métricas de rendimiento:', {
      'DOM Content Loaded': `${Math.round(this.metrics.domContentLoaded)}ms`,
      'Window Loaded': `${Math.round(this.metrics.windowLoaded)}ms`,
      'Componentes inicializados': this.metrics.componentsLoaded
    });
  }
}

const app = new App();

const isDevelopment = 
  (typeof window !== 'undefined' && window.location && 
   (window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.includes('.local')));

if (isDevelopment) {
  window.app = app;
}