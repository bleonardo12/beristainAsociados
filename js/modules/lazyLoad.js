/**
 * Módulo para la carga diferida (lazy loading) de imágenes y otros recursos
 * Optimiza el rendimiento de carga inicial de la página implementando
 * carga bajo demanda de recursos cuando son necesarios.
 * 
 * @version 2.0
 */

// Configuración predeterminada
const DEFAULT_CONFIG = {
  rootMargin: '200px 0px',     // Margen para precargar antes de que sea visible
  threshold: 0.01,             // Umbral mínimo de visibilidad
  aboveTheFoldFactor: 0.5,     // Factor para determinar contenido por encima del pliegue
  throttleDelay: 200,          // ms para throttle en eventos de scroll
  loadDelay: 20,               // ms de retraso inicial para carga
  forceImageLoad: false,       // Forzar carga aunque el navegador soporte lazy loading
  enableMetrics: false,        // Habilitar recolección de métricas
  respectReducedMotion: true,  // Respetar preferencia de reducción de movimiento
  debug: false                 // Habilitar logs de depuración
};

// Contadores para métricas
const metrics = {
  totalElements: 0,
  loadedElements: 0,
  nativeLazy: 0,
  intersectionLazy: 0,
  fallbackLazy: 0,
  aboveTheFold: 0,
  errors: 0
};

// Estado global
let config = { ...DEFAULT_CONFIG };
let observers = [];
let eventListeners = [];

/**
 * Inicializa el sistema de carga diferida
 * @param {Object} options - Opciones de configuración
 * @returns {Object} API para controlar la carga diferida
 */
export function initLazyLoad(options = {}) {
  try {
    // Combinar opciones con valores predeterminados
    config = { ...DEFAULT_CONFIG, ...options };
    
    log('Inicializando sistema de carga diferida');
    
    // Detectar elementos lazyload
    const lazyImages = document.querySelectorAll('img[data-src], img:not([loading])');
    const lazyBackgrounds = document.querySelectorAll('[data-background]');
    const lazyIframes = document.querySelectorAll('iframe[data-src]');
    const lazyVideos = document.querySelectorAll('video[data-src], video source[data-src]');
    
    // Actualizar métricas
    metrics.totalElements = lazyImages.length + lazyBackgrounds.length + 
                          lazyIframes.length + lazyVideos.length;
    
    log(`Detectados ${metrics.totalElements} elementos para carga diferida`);
    
    // Detectar reducción de movimiento si está habilitado
    const prefersReducedMotion = 
      config.respectReducedMotion && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      log('Detectada preferencia de reducción de movimiento, cargando todos los recursos inmediatamente');
      loadAllResources();
      return createLazyLoadAPI();
    }
    
    // Primero detectar qué tipo de lazy loading usar
    if ('loading' in HTMLImageElement.prototype && !config.forceImageLoad) {
      log('Usando lazy loading nativo');
      setupNativeLazyLoading();
    } else if ('IntersectionObserver' in window) {
      log('Usando IntersectionObserver para lazy loading');
      setupIntersectionObserverLazyLoading();
    } else {
      log('Usando fallback para lazy loading');
      setupFallbackLazyLoading();
    }
    
    // También configurar carga diferida para otros elementos
    setupOtherLazyElements();
    
    // Retornar API pública
    return createLazyLoadAPI();
  } catch (error) {
    console.error('Error al inicializar lazy loading:', error);
    metrics.errors++;
    
    // Cargar todos los recursos como fallback
    loadAllResources();
    return createLazyLoadAPI();
  }
}

/**
 * Configura lazy loading nativo para navegadores modernos
 */
function setupNativeLazyLoading() {
  try {
    // Seleccionar imágenes que no tengan ya loading="lazy"
    const images = document.querySelectorAll('img:not([loading])');
    
    images.forEach(img => {
      try {
        // Verificar si la imagen es candidata para lazy loading
        if (!isAboveTheFold(img)) {
          // Aplicar atributo loading="lazy"
          img.setAttribute('loading', 'lazy');
          
          // Migrar data-src a src si existe
          if (img.dataset.src) {
            img.addEventListener('load', () => handleResourceLoaded(img), { once: true });
            img.addEventListener('error', () => handleResourceError(img), { once: true });
            
            img.src = img.dataset.src;
            delete img.dataset.src;
          }
          
          // Migrar data-srcset a srcset si existe
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            delete img.dataset.srcset;
          }
          
          metrics.nativeLazy++;
        } else {
          // Cargar inmediatamente imágenes por encima del pliegue
          loadElementImmediately(img);
        }
      } catch (elementError) {
        console.error('Error al procesar imagen con lazy loading nativo:', elementError);
        metrics.errors++;
        loadElementImmediately(img);
      }
    });
  } catch (error) {
    console.error('Error en setupNativeLazyLoading:', error);
    metrics.errors++;
  }
}

/**
 * Configura lazy loading basado en IntersectionObserver
 */
function setupIntersectionObserverLazyLoading() {
  try {
    const lazyImages = document.querySelectorAll('img[data-src], img:not([loading])');
    const lazyBackgrounds = document.querySelectorAll('[data-background]');
    
    if (lazyImages.length === 0 && lazyBackgrounds.length === 0) return;
    
    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          try {
            const lazyElement = entry.target;
            
            if (lazyElement.tagName.toLowerCase() === 'img') {
              // Cargar imágenes
              if (lazyElement.dataset.src) {
                // Añadir detectores de eventos antes de cambiar src
                lazyElement.addEventListener('load', () => handleResourceLoaded(lazyElement), { once: true });
                lazyElement.addEventListener('error', () => handleResourceError(lazyElement), { once: true });
                
                lazyElement.src = lazyElement.dataset.src;
                lazyElement.removeAttribute('data-src');
              }
              
              if (lazyElement.dataset.srcset) {
                lazyElement.srcset = lazyElement.dataset.srcset;
                lazyElement.removeAttribute('data-srcset');
              }
              
              // Indicar carga iniciada
              lazyElement.classList.add('lazy-loading');
            } else {
              // Cargar fondos
              if (lazyElement.dataset.background) {
                const imgLoader = new Image();
                imgLoader.onload = () => {
                  lazyElement.style.backgroundImage = `url('${lazyElement.dataset.background}')`;
                  lazyElement.classList.add('lazy-loaded');
                  lazyElement.removeAttribute('data-background');
                  handleResourceLoaded(lazyElement);
                };
                
                imgLoader.onerror = () => {
                  lazyElement.removeAttribute('data-background');
                  handleResourceError(lazyElement);
                };
                
                imgLoader.src = lazyElement.dataset.background;
              }
            }
            
            observer.unobserve(lazyElement);
            metrics.intersectionLazy++;
          } catch (elementError) {
            console.error('Error al procesar elemento con IntersectionObserver:', elementError);
            metrics.errors++;
          }
        }
      });
    }, {
      rootMargin: config.rootMargin,
      threshold: config.threshold
    });
    
    // Mantener referencia para limpieza
    observers.push(lazyImageObserver);
    
    // Observar imágenes
    lazyImages.forEach(image => {
      try {
        if (!isAboveTheFold(image)) {
          lazyImageObserver.observe(image);
        } else {
          // Cargar inmediatamente si está por encima del pliegue
          loadElementImmediately(image);
        }
      } catch (elementError) {
        console.error('Error al observar imagen:', elementError);
        metrics.errors++;
        loadElementImmediately(image);
      }
    });
    
    // Observar fondos
    lazyBackgrounds.forEach(bg => {
      try {
        if (!isAboveTheFold(bg)) {
          lazyImageObserver.observe(bg);
        } else {
          // Cargar inmediatamente si está por encima del pliegue
          loadElementImmediately(bg);
        }
      } catch (elementError) {
        console.error('Error al observar fondo:', elementError);
        metrics.errors++;
        loadElementImmediately(bg);
      }
    });
  } catch (error) {
    console.error('Error en setupIntersectionObserverLazyLoading:', error);
    metrics.errors++;
    // Fallback si falla completamente
    setupFallbackLazyLoading();
  }
}

/**
 * Implementa un fallback basado en scroll para navegadores antiguos
 */
function setupFallbackLazyLoading() {
  try {
    // Cargar todas las imágenes por encima del pliegue inmediatamente
    const allElements = document.querySelectorAll('img[data-src], [data-background]');
    
    allElements.forEach(element => {
      try {
        if (isAboveTheFold(element)) {
          loadElementImmediately(element);
        }
      } catch (elementError) {
        console.error('Error al procesar elemento por encima del pliegue:', elementError);
        metrics.errors++;
        loadElementImmediately(element);
      }
    });
    
    // Función para cargar imágenes durante el scroll
    const lazyLoad = () => {
      try {
        const lazyElements = document.querySelectorAll('img[data-src], [data-background]');
        
        // Umbral para considerar un elemento visible
        const scrollTop = window.pageYOffset;
        const viewportHeight = window.innerHeight;
        const threshold = scrollTop + viewportHeight + parseInt(config.rootMargin);
        
        lazyElements.forEach(element => {
          try {
            if (element.offsetTop < threshold) {
              loadElementImmediately(element);
              metrics.fallbackLazy++;
            }
          } catch (elementError) {
            console.error('Error al cargar elemento durante scroll:', elementError);
            metrics.errors++;
            loadElementImmediately(element);
          }
        });
        
        // Dejar de escuchar cuando todas las imágenes están cargadas
        if (document.querySelectorAll('img[data-src], [data-background]').length === 0) {
          cleanupEventListeners();
        }
      } catch (scrollError) {
        console.error('Error en evento de scroll:', scrollError);
        metrics.errors++;
      }
    };
    
    // Throttle para mejorar rendimiento
    const lazyLoadThrottled = throttle(lazyLoad, config.throttleDelay);
    
    // Escuchar eventos
    document.addEventListener('scroll', lazyLoadThrottled);
    window.addEventListener('resize', lazyLoadThrottled);
    window.addEventListener('orientationchange', lazyLoadThrottled);
    
    // Mantener referencia para limpieza
    eventListeners.push(
      { element: document, event: 'scroll', handler: lazyLoadThrottled },
      { element: window, event: 'resize', handler: lazyLoadThrottled },
      { element: window, event: 'orientationchange', handler: lazyLoadThrottled }
    );
    
    // Ejecutar una vez inicialmente
    setTimeout(lazyLoad, config.loadDelay);
  } catch (error) {
    console.error('Error en setupFallbackLazyLoading:', error);
    metrics.errors++;
    
    // Si falla todo, cargar todas las imágenes
    loadAllResources();
  }
}

/**
 * Configura lazy loading para otros elementos como iframes y videos
 */
function setupOtherLazyElements() {
  try {
    // Iframes
    const lazyIframes = document.querySelectorAll('iframe[data-src]');
    
    if (lazyIframes.length > 0 && 'IntersectionObserver' in window) {
      const iframeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            try {
              const iframe = entry.target;
              
              if (iframe.dataset.src) {
                iframe.addEventListener('load', () => handleResourceLoaded(iframe), { once: true });
                iframe.addEventListener('error', () => handleResourceError(iframe), { once: true });
                
                iframe.src = iframe.dataset.src;
                iframe.removeAttribute('data-src');
              }
              
              observer.unobserve(iframe);
            } catch (iframeError) {
              console.error('Error al cargar iframe:', iframeError);
              metrics.errors++;
            }
          }
        });
      }, {
        rootMargin: config.rootMargin,
        threshold: config.threshold
      });
      
      // Mantener referencia
      observers.push(iframeObserver);
      
      lazyIframes.forEach(iframe => {
        if (!isAboveTheFold(iframe)) {
          iframeObserver.observe(iframe);
        } else {
          loadElementImmediately(iframe);
        }
      });
    } else {
      // Fallback para iframes
      lazyIframes.forEach(iframe => {
        loadElementImmediately(iframe);
      });
    }
    
    // Videos
    const lazyVideos = document.querySelectorAll('video[data-src]');
    
    if (lazyVideos.length > 0 && 'IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            try {
              const video = entry.target;
              
              // Cargar el video cuando sea visible
              if (video.dataset.src) {
                video.addEventListener('loadeddata', () => handleResourceLoaded(video), { once: true });
                video.addEventListener('error', () => handleResourceError(video), { once: true });
                
                video.src = video.dataset.src;
                video.load();
                video.removeAttribute('data-src');
              }
              
              // También procesar las sources del video
              Array.from(video.querySelectorAll('source[data-src]')).forEach(source => {
                try {
                  source.src = source.dataset.src;
                  source.removeAttribute('data-src');
                } catch (sourceError) {
                  console.error('Error al procesar source de video:', sourceError);
                  metrics.errors++;
                }
              });
              
              observer.unobserve(video);
            } catch (videoError) {
              console.error('Error al cargar video:', videoError);
              metrics.errors++;
            }
          }
        });
      }, {
        rootMargin: config.rootMargin,
        threshold: config.threshold
      });
      
      // Mantener referencia
      observers.push(videoObserver);
      
      lazyVideos.forEach(video => {
        if (!isAboveTheFold(video)) {
          videoObserver.observe(video);
        } else {
          loadElementImmediately(video);
        }
      });
    } else {
      // Fallback para videos
      lazyVideos.forEach(video => {
        loadElementImmediately(video);
      });
    }
  } catch (error) {
    console.error('Error en setupOtherLazyElements:', error);
    metrics.errors++;
  }
}

/**
 * Determina si un elemento está por encima del pliegue (above the fold)
 * @param {HTMLElement} element - Elemento a verificar
 * @returns {boolean} - True si está por encima del pliegue
 */
function isAboveTheFold(element) {
  try {
    // Un elemento por encima del pliegue está en la parte visible inicial de la página
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Considerar visible si está a menos del factor configurado del viewport de altura
    const isAbove = rect.top < viewportHeight * config.aboveTheFoldFactor;
    
    if (isAbove) {
      metrics.aboveTheFold++;
    }
    
    return isAbove;
  } catch (error) {
    console.error('Error al verificar si elemento está por encima del pliegue:', error);
    metrics.errors++;
    return false;
  }
}

/**
 * Utilidad para limitar la frecuencia de ejecución de una función (throttle)
 * @param {Function} callback - Función a throttlear
 * @param {number} limit - Límite en ms
 * @returns {Function} - Función con throttle aplicado
 */
function throttle(callback, limit) {
  let waiting = false;
  return function() {
    if (!waiting) {
      callback.apply(this, arguments);
      waiting = true;
      setTimeout(() => {
        waiting = false;
      }, limit);
    }
  };
}

/**
 * Carga un elemento inmediatamente sin esperar
 * @param {HTMLElement} element - Elemento a cargar
 */
function loadElementImmediately(element) {
  try {
    if (element.tagName.toLowerCase() === 'img') {
      if (element.dataset.src) {
        element.addEventListener('load', () => handleResourceLoaded(element), { once: true });
        element.addEventListener('error', () => handleResourceError(element), { once: true });
        
        element.src = element.dataset.src;
        element.removeAttribute('data-src');
      }
      
      if (element.dataset.srcset) {
        element.srcset = element.dataset.srcset;
        element.removeAttribute('data-srcset');
      }
    } else if (element.tagName.toLowerCase() === 'iframe' && element.dataset.src) {
      element.addEventListener('load', () => handleResourceLoaded(element), { once: true });
      element.addEventListener('error', () => handleResourceError(element), { once: true });
      
      element.src = element.dataset.src;
      element.removeAttribute('data-src');
    } else if (element.tagName.toLowerCase() === 'video' && element.dataset.src) {
      element.addEventListener('loadeddata', () => handleResourceLoaded(element), { once: true });
      element.addEventListener('error', () => handleResourceError(element), { once: true });
      
      element.src = element.dataset.src;
      element.load();
      element.removeAttribute('data-src');
      
      // Procesar sources
      Array.from(element.querySelectorAll('source[data-src]')).forEach(source => {
        source.src = source.dataset.src;
        source.removeAttribute('data-src');
      });
    } else if (element.dataset.background) {
      const img = new Image();
      
      img.onload = () => {
        element.style.backgroundImage = `url('${element.dataset.background}')`;
        element.classList.add('lazy-loaded');
        element.removeAttribute('data-background');
        handleResourceLoaded(element);
      };
      
      img.onerror = () => {
        element.removeAttribute('data-background');
        handleResourceError(element);
      };
      
      img.src = element.dataset.background;
    }
  } catch (error) {
    console.error('Error al cargar elemento inmediatamente:', error);
    metrics.errors++;
  }
}

/**
 * Carga todos los recursos inmediatamente
 */
function loadAllResources() {
  try {
    const allLazyElements = document.querySelectorAll(
      'img[data-src], [data-background], iframe[data-src], video[data-src], source[data-src]'
    );
    
    allLazyElements.forEach(element => {
      loadElementImmediately(element);
    });
    
    log('Todos los recursos cargados inmediatamente');
  } catch (error) {
    console.error('Error al cargar todos los recursos:', error);
    metrics.errors++;
  }
}

/**
 * Maneja evento de carga exitosa
 * @param {HTMLElement} element - Elemento cargado
 */
function handleResourceLoaded(element) {
  try {
    element.classList.add('lazy-loaded');
    element.classList.remove('lazy-loading');
    metrics.loadedElements++;
    
    log(`Recurso cargado: ${getElementIdentifier(element)}`);
  } catch (error) {
    console.error('Error al manejar carga exitosa:', error);
    metrics.errors++;
  }
}

/**
 * Maneja evento de error en carga
 * @param {HTMLElement} element - Elemento con error
 */
function handleResourceError(element) {
  try {
    element.classList.add('lazy-error');
    element.classList.remove('lazy-loading');
    metrics.errors++;
    
    // Intentar cargar imagen de fallback si existe
    if (element.dataset.fallback) {
      element.src = element.dataset.fallback;
      element.removeAttribute('data-fallback');
    }
    
    console.error(`Error al cargar recurso: ${getElementIdentifier(element)}`);
  } catch (error) {
    console.error('Error al manejar error de carga:', error);
    metrics.errors++;
  }
}

/**
 * Obtiene un identificador para un elemento
 * @param {HTMLElement} element - Elemento a identificar
 * @returns {string} - Identificador del elemento
 */
function getElementIdentifier(element) {
  let identifier = element.tagName.toLowerCase();
  
  if (element.id) {
    identifier += `#${element.id}`;
  } else if (element.src) {
    identifier += ` [src="${element.src.substring(0, 50)}${element.src.length > 50 ? '...' : ''}"]`;
  } else if (element.dataset.src) {
    identifier += ` [data-src="${element.dataset.src.substring(0, 50)}${element.dataset.src.length > 50 ? '...' : ''}"]`;
  }
  
  return identifier;
}

/**
 * Limpia los event listeners registrados
 */
function cleanupEventListeners() {
  try {
    eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    
    eventListeners = [];
    log('Event listeners limpiados');
  } catch (error) {
    console.error('Error al limpiar event listeners:', error);
    metrics.errors++;
  }
}

/**
 * Limpia los observers
 */
function cleanupObservers() {
  try {
    observers.forEach(observer => {
      observer.disconnect();
    });
    
    observers = [];
    log('Observers limpiados');
  } catch (error) {
    console.error('Error al limpiar observers:', error);
    metrics.errors++;
  }
}

/**
 * Precarga imágenes críticas para mejorar LCP (Largest Contentful Paint)
 * Esta función puede ser llamada para precargar recursos críticos
 * @param {Array} imagePaths - Lista de rutas de imágenes a precargar
 */
export function preloadCriticalImages(imagePaths) {
  try {
    const criticalImages = imagePaths || [
      'img/logo.webp',
      'img/Facultad_de_derecho_uba.webp'
    ];
    
    criticalImages.forEach(imgSrc => {
      try {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = imgSrc;
        link.type = imgSrc.endsWith('webp') ? 'image/webp' : 'image/jpeg';
        
        document.head.appendChild(link);
        log(`Imagen crítica precargada: ${imgSrc}`);
      } catch (imgError) {
        console.error(`Error al precargar imagen crítica ${imgSrc}:`, imgError);
        metrics.errors++;
      }
    });
  } catch (error) {
    console.error('Error al precargar imágenes críticas:', error);
    metrics.errors++;
  }
}

/**
 * Crea una API pública para controlar el lazy loading
 * @returns {Object} - API de lazy loading
 */
function createLazyLoadAPI() {
  return {
    /**
     * Obtiene las métricas actuales
     * @returns {Object} - Métricas de lazy loading
     */
    getMetrics: () => ({ ...metrics }),
    
    /**
     * Carga todos los recursos restantes
     */
    loadAll: loadAllResources,
    
    /**
     * Limpia todos los recursos, event listeners y observers
     */
    cleanup: () => {
      cleanupEventListeners();
      cleanupObservers();
      return true;
    },
    
    /**
     * Precarga imágenes críticas
     * @param {Array} images - Lista de rutas de imágenes
     */
    preloadCritical: preloadCriticalImages,
    
    /**
     * Actualiza la configuración
     * @param {Object} newConfig - Nueva configuración
     */
    updateConfig: (newConfig) => {
      config = { ...config, ...newConfig };
      return true;
    }
  };
}

/**
 * Función de logging
 * @param {string} message - Mensaje a loggear
 */
function log(message) {
  if (config.debug) {
    console.log(`[LazyLoad] ${message}`);
  }
}