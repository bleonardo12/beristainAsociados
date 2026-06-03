/**
 * Módulo para la carga diferida (lazy loading) de imágenes y otros recursos
 * Optimiza el rendimiento de carga inicial de la página implementando
 * carga bajo demanda de recursos cuando son necesarios.
 * * @version 2.1.1
 */

const DEFAULT_CONFIG = {
  rootMargin: '200px 0px',     
  threshold: 0.01,             
  aboveTheFoldFactor: 0.5,     
  throttleDelay: 200,          
  loadDelay: 20,               
  forceImageLoad: false,       
  enableMetrics: false,        
  respectReducedMotion: true,  
  debug: false                 
};

const metrics = {
  totalElements: 0,
  loadedElements: 0,
  nativeLazy: 0,
  intersectionLazy: 0,
  fallbackLazy: 0,
  aboveTheFold: 0,
  errors: 0
};

let config = { ...DEFAULT_CONFIG };
let observers = [];
let eventListeners = [];

export function initLazyLoad(options = {}) {
  try {
    config = { ...DEFAULT_CONFIG, ...options };
    
    log('Inicializando sistema de carga diferida');
    
    const lazyImages = document.querySelectorAll('img[data-src], img:not([loading])');
    const lazyBackgrounds = document.querySelectorAll('[data-background]');
    const lazyIframes = document.querySelectorAll('iframe[data-src]');
    const lazyVideos = document.querySelectorAll('video[data-src], video source[data-src]');
    
    metrics.totalElements = lazyImages.length + lazyBackgrounds.length + lazyIframes.length + lazyVideos.length;
    
    log(`Detectados ${metrics.totalElements} elementos para carga diferida`);
    
    const prefersReducedMotion = 
      config.respectReducedMotion && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      log('Preferencia de reducción de movimiento activa: cargando todo inmediatamente');
      loadAllResources();
      return createLazyLoadAPI();
    }
    
    if ('loading' in HTMLImageElement.prototype && !config.forceImageLoad) {
      log('Usando lazy loading nativo optimizado');
      setupNativeLazyLoading(lazyImages);
    } else if ('IntersectionObserver' in window) {
      log('Usando IntersectionObserver');
      setupIntersectionObserverLazyLoading(lazyImages, lazyBackgrounds);
    } else {
      log('Usando fallback por eventos de scroll');
      setupFallbackLazyLoading(lazyImages, lazyBackgrounds);
    }
    
    setupOtherLazyElements(lazyIframes, lazyVideos);
    
    return createLazyLoadAPI();
  } catch (error) {
    console.error('Error crítico al inicializar lazy loading:', error);
    metrics.errors++;
    loadAllResources();
    return createLazyLoadAPI();
  }
}

function setupNativeLazyLoading(images) {
  images.forEach(img => {
    try {
      if (isAboveTheFold(img)) {
        loadElementImmediately(img);
        return;
      }

      img.setAttribute('loading', 'lazy');
      
      if (img.dataset.src) {
        img.addEventListener('load', () => handleResourceLoaded(img), { once: true });
        img.addEventListener('error', () => handleResourceError(img), { once: true });
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
      
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
        img.removeAttribute('data-srcset');
      }
      
      metrics.nativeLazy++;
    } catch (elementError) {
      metrics.errors++;
      loadElementImmediately(img);
    }
  });
}

function setupIntersectionObserverLazyLoading(images, backgrounds) {
  if (images.length === 0 && backgrounds.length === 0) return;
  
  const lazyImageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        loadElementImmediately(element);
        metrics.intersectionLazy++;
        observer.unobserve(element);
      }
    });
  }, {
    rootMargin: config.rootMargin,
    threshold: config.threshold
  });
  
  observers.push(lazyImageObserver);
  
  const processElement = (el) => {
    if (isAboveTheFold(el)) {
      loadElementImmediately(el);
    } else {
      lazyImageObserver.observe(el);
    }
  };

  images.forEach(processElement);
  backgrounds.forEach(processElement);
}

function setupFallbackLazyLoading(images, backgrounds) {
  const allElements = [...images, ...backgrounds];
  
  allElements.forEach(element => {
    if (isAboveTheFold(element)) {
      loadElementImmediately(element);
    }
  });
  
  const lazyLoad = () => {
    const remainingElements = document.querySelectorAll('img[data-src], [data-background]');
    if (remainingElements.length === 0) {
      cleanupEventListeners();
      return;
    }
    
    const scrollTop = window.pageYOffset;
    const viewportHeight = window.innerHeight;
    const scrollThreshold = scrollTop + viewportHeight + parseInt(config.rootMargin);
    
    remainingElements.forEach(element => {
      if (element.offsetTop < scrollThreshold && element.offsetParent !== null) {
        loadElementImmediately(element);
        metrics.fallbackLazy++;
      }
    });
  };
  
  const lazyLoadThrottled = throttle(lazyLoad, config.throttleDelay);
  
  document.addEventListener('scroll', lazyLoadThrottled, { passive: true });
  window.addEventListener('resize', lazyLoadThrottled);
  window.addEventListener('orientationchange', lazyLoadThrottled);
  
  eventListeners.push(
    { element: document, event: 'scroll', handler: lazyLoadThrottled },
    { element: window, event: 'resize', handler: lazyLoadThrottled },
    { element: window, event: 'orientationchange', handler: lazyLoadThrottled }
  );
  
  setTimeout(lazyLoad, config.loadDelay);
}

function setupOtherLazyElements(iframes, videos) {
  if (iframes.length === 0 && videos.length === 0) return;

  if ('IntersectionObserver' in window) {
    const mediaObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const mediaElement = entry.target;
          loadElementImmediately(mediaElement);
          observer.unobserve(mediaElement);
        }
      });
    }, { rootMargin: config.rootMargin });

    observers.push(mediaObserver);

    iframes.forEach(iframe => isAboveTheFold(iframe) ? loadElementImmediately(iframe) : mediaObserver.observe(iframe));
    videos.forEach(video => isAboveTheFold(video) ? loadElementImmediately(video) : mediaObserver.observe(video));
  } else {
    iframes.forEach(loadElementImmediately);
    videos.forEach(loadElementImmediately);
  }
}

function isAboveTheFold(element) {
  try {
    const rect = element.getBoundingClientRect();
    
    if (rect.width === 0 && rect.height === 0) {
      return false;
    }
    
    const viewportHeight = window.innerHeight;
    const isAbove = rect.top < (viewportHeight * config.aboveTheFoldFactor);
    
    if (isAbove) {
      metrics.aboveTheFold++;
    }
    
    return isAbove;
  } catch (error) {
    metrics.errors++;
    return false;
  }
}

function throttle(callback, limit) {
  let waiting = false;
  return function(...args) {
    if (!waiting) {
      callback.apply(this, args);
      waiting = true;
      setTimeout(() => { waiting = false; }, limit);
    }
  };
}

function loadElementImmediately(element) {
  try {
    if (!element) return;
    
    const tagName = element.tagName.toLowerCase();

    if (tagName === 'img') {
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
    } else if (tagName === 'iframe' && element.dataset.src) {
      element.src = element.dataset.src;
      element.removeAttribute('data-src');
    } else if (tagName === 'video' && element.dataset.src) {
      element.src = element.dataset.src;
      element.load();
      element.removeAttribute('data-src');
      
      Array.from(element.querySelectorAll('source[data-src]')).forEach(source => {
        source.src = source.dataset.src;
        source.removeAttribute('data-src');
      });
    } else if (element.dataset.background) {
      const img = new Image();
      img.onload = () => {
        element.style.backgroundImage = `url('${element.dataset.background}')`;
        element.removeAttribute('data-background');
        handleResourceLoaded(element);
      };
      img.src = element.dataset.background;
    }
  } catch (error) {
    metrics.errors++;
  }
}

function loadAllResources() {
  const allLazyElements = document.querySelectorAll(
    'img[data-src], [data-background], iframe[data-src], video[data-src]'
  );
  allLazyElements.forEach(loadElementImmediately);
}

function handleResourceLoaded(element) {
  element.classList.add('lazy-loaded');
  element.classList.remove('lazy-loading');
  metrics.loadedElements++;
  log(`Recurso cargado: ${getElementIdentifier(element)}`);
}

function handleResourceError(element) {
  element.classList.add('lazy-error');
  element.classList.remove('lazy-loading');
  metrics.errors++;
  
  if (element.dataset.fallback) {
    element.src = element.dataset.fallback;
    element.removeAttribute('data-fallback');
  }
}

function getElementIdentifier(element) {
  return element.id ? `${element.tagName.toLowerCase()}#${element.id}` : element.tagName.toLowerCase();
}

function cleanupEventListeners() {
  eventListeners.forEach(({ element, event, handler }) => {
    element.removeEventListener(event, handler);
  });
  eventListeners = [];
}

function cleanupObservers() {
  observers.forEach(obs => obs.disconnect());
  observers = [];
}

export function preloadCriticalImages(imagePaths) {
  try {
    const criticalImages = imagePaths || ['img/logo.webp', 'img/Facultad_de_derecho_uba.webp'];
    
    criticalImages.forEach(imgSrc => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imgSrc;
      link.type = imgSrc.endsWith('webp') ? 'image/webp' : 'image/jpeg';
      document.head.appendChild(link);
    });
  } catch (error) {
    metrics.errors++;
  }
}

function createLazyLoadAPI() {
  return {
    getMetrics: () => ({ ...metrics }),
    loadAll: loadAllResources,
    cleanup: () => {
      cleanupEventListeners();
      cleanupObservers();
      return true;
    },
    preloadCritical: preloadCriticalImages,
    updateConfig: (newConfig) => {
      config = { ...config, ...newConfig };
      return true;
    }
  };
}

function log(message) {
  if (config.debug) {
    console.log(`[LazyLoad] ${message}`);
  }
}