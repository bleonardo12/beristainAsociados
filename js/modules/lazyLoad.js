/**
 * Módulo para la carga diferida (lazy loading) de imágenes y otros recursos
 * Optimiza el rendimiento de carga inicial de la página implementando
 * carga bajo demanda de recursos cuando son necesarios.
 */

/**
 * Inicializa el sistema de carga diferida
 */
export function initLazyLoad() {
    // Primero detectar qué tipo de lazy loading usar
    if ('loading' in HTMLImageElement.prototype) {
      // El navegador soporta lazy loading nativo
      setupNativeLazyLoading();
    } else if ('IntersectionObserver' in window) {
      // Usar IntersectionObserver como polyfill
      setupIntersectionObserverLazyLoading();
    } else {
      // Fallback para navegadores antiguos
      setupFallbackLazyLoading();
    }
    
    // También configurar carga diferida para otros elementos como iframes y videos
    setupOtherLazyElements();
  }
  
  /**
   * Configura lazy loading nativo para navegadores modernos
   */
  function setupNativeLazyLoading() {
    // Seleccionar imágenes que no tengan ya loading="lazy"
    const images = document.querySelectorAll('img:not([loading])');
    
    images.forEach(img => {
      // Verificar si la imagen es candidata para lazy loading
      if (!isAboveTheFold(img)) {
        // Aplicar atributo loading="lazy"
        img.setAttribute('loading', 'lazy');
        
        // Migrar data-src a src si existe
        if (img.dataset.src) {
          img.src = img.dataset.src;
          delete img.dataset.src;
        }
        
        // Migrar data-srcset a srcset si existe
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
          delete img.dataset.srcset;
        }
      }
    });
  }
  
  /**
   * Configura lazy loading basado en IntersectionObserver
   */
  function setupIntersectionObserverLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src], img:not([loading])');
    const lazyBackgrounds = document.querySelectorAll('[data-background]');
    
    if (lazyImages.length === 0 && lazyBackgrounds.length === 0) return;
    
    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const lazyElement = entry.target;
          
          if (lazyElement.tagName.toLowerCase() === 'img') {
            // Cargar imágenes
            if (lazyElement.dataset.src) {
              lazyElement.src = lazyElement.dataset.src;
              lazyElement.removeAttribute('data-src');
            }
            
            if (lazyElement.dataset.srcset) {
              lazyElement.srcset = lazyElement.dataset.srcset;
              lazyElement.removeAttribute('data-srcset');
            }
            
            // Evento de carga completa
            lazyElement.classList.add('lazy-loaded');
            lazyElement.addEventListener('load', () => {
              lazyElement.classList.add('loaded');
            });
          } else {
            // Cargar fondos
            if (lazyElement.dataset.background) {
              lazyElement.style.backgroundImage = `url('${lazyElement.dataset.background}')`;
              lazyElement.classList.add('lazy-loaded');
              lazyElement.removeAttribute('data-background');
            }
          }
          
          observer.unobserve(lazyElement);
        }
      });
    }, {
      rootMargin: '200px 0px', // Cargar imágenes cuando están a 200px de aparecer
      threshold: 0.01
    });
    
    // Observar imágenes
    lazyImages.forEach(image => {
      if (!isAboveTheFold(image)) {
        lazyImageObserver.observe(image);
      } else {
        // Cargar inmediatamente si está por encima del pliegue
        if (image.dataset.src) {
          image.src = image.dataset.src;
          image.removeAttribute('data-src');
        }
        
        if (image.dataset.srcset) {
          image.srcset = image.dataset.srcset;
          image.removeAttribute('data-srcset');
        }
      }
    });
    
    // Observar fondos
    lazyBackgrounds.forEach(bg => {
      if (!isAboveTheFold(bg)) {
        lazyImageObserver.observe(bg);
      } else {
        // Cargar inmediatamente si está por encima del pliegue
        if (bg.dataset.background) {
          bg.style.backgroundImage = `url('${bg.dataset.background}')`;
          bg.removeAttribute('data-background');
        }
      }
    });
  }
  
  /**
   * Implementa un fallback básico para navegadores antiguos
   */
  function setupFallbackLazyLoading() {
    // Cargar todas las imágenes por encima del pliegue inmediatamente
    const allElements = document.querySelectorAll('img[data-src], [data-background]');
    
    allElements.forEach(element => {
      if (isAboveTheFold(element)) {
        if (element.tagName.toLowerCase() === 'img') {
          if (element.dataset.src) {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
          }
          
          if (element.dataset.srcset) {
            element.srcset = element.dataset.srcset;
            element.removeAttribute('data-srcset');
          }
        } else if (element.dataset.background) {
          element.style.backgroundImage = `url('${element.dataset.background}')`;
          element.removeAttribute('data-background');
        }
      }
    });
    
    // Función para cargar imágenes durante el scroll
    const lazyLoad = () => {
      const lazyElements = document.querySelectorAll('img[data-src], [data-background]');
      
      // Umbral para considerar un elemento visible
      const scrollTop = window.pageYOffset;
      const viewportHeight = window.innerHeight;
      const threshold = scrollTop + viewportHeight + 200; // 200px de margen
      
      lazyElements.forEach(element => {
        if (element.offsetTop < threshold) {
          if (element.tagName.toLowerCase() === 'img') {
            if (element.dataset.src) {
              element.src = element.dataset.src;
              element.removeAttribute('data-src');
            }
            
            if (element.dataset.srcset) {
              element.srcset = element.dataset.srcset;
              element.removeAttribute('data-srcset');
            }
          } else if (element.dataset.background) {
            element.style.backgroundImage = `url('${element.dataset.background}')`;
            element.removeAttribute('data-background');
          }
        }
      });
      
      // Dejar de escuchar cuando todas las imágenes están cargadas
      if (lazyElements.length === 0) {
        document.removeEventListener('scroll', lazyLoadThrottled);
        window.removeEventListener('resize', lazyLoadThrottled);
        window.removeEventListener('orientationchange', lazyLoadThrottled);
      }
    };
    
    // Throttle para mejorar rendimiento
    const lazyLoadThrottled = throttle(lazyLoad, 200);
    
    // Escuchar eventos
    document.addEventListener('scroll', lazyLoadThrottled);
    window.addEventListener('resize', lazyLoadThrottled);
    window.addEventListener('orientationchange', lazyLoadThrottled);
    
    // Ejecutar una vez inicialmente
    setTimeout(lazyLoad, 20);
  }
  
  /**
   * Configura lazy loading para otros elementos como iframes y videos
   */
  function setupOtherLazyElements() {
    // Iframes
    const lazyIframes = document.querySelectorAll('iframe[data-src]');
    
    if (lazyIframes.length > 0 && 'IntersectionObserver' in window) {
      const iframeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const iframe = entry.target;
            
            if (iframe.dataset.src) {
              iframe.src = iframe.dataset.src;
              iframe.removeAttribute('data-src');
            }
            
            observer.unobserve(iframe);
          }
        });
      }, {
        rootMargin: '200px 0px',
        threshold: 0.1
      });
      
      lazyIframes.forEach(iframe => {
        iframeObserver.observe(iframe);
      });
    } else {
      // Fallback para iframes
      lazyIframes.forEach(iframe => {
        if (iframe.dataset.src) {
          iframe.src = iframe.dataset.src;
          iframe.removeAttribute('data-src');
        }
      });
    }
    
    // Videos
    const lazyVideos = document.querySelectorAll('video[data-src]');
    
    if (lazyVideos.length > 0 && 'IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const video = entry.target;
            
            // Cargar el video cuando sea visible
            if (video.dataset.src) {
              video.src = video.dataset.src;
              video.load();
              video.removeAttribute('data-src');
            }
            
            // También procesar las sources del video
            Array.from(video.querySelectorAll('source[data-src]')).forEach(source => {
              source.src = source.dataset.src;
              source.removeAttribute('data-src');
            });
            
            observer.unobserve(video);
          }
        });
      }, {
        rootMargin: '200px 0px',
        threshold: 0.1
      });
      
      lazyVideos.forEach(video => {
        videoObserver.observe(video);
      });
    }
  }
  
  /**
   * Determina si un elemento está por encima del pliegue (above the fold)
   */
  function isAboveTheFold(element) {
    // Un elemento por encima del pliegue está en la parte visible inicial de la página
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Considerar visible si está a menos del 50% del viewport de altura
    return rect.top < viewportHeight * 0.5;
  }
  
  /**
   * Utilidad para limitar la frecuencia de ejecución de una función (throttle)
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
   * Precarga imágenes críticas para mejorar LCP (Largest Contentful Paint)
   * Esta función puede ser llamada para precargar recursos críticos
   */
  export function preloadCriticalImages() {
    const criticalImages = [
      'img/logo.webp',
      'img/Facultad_de_derecho_uba.webp'
    ];
    
    criticalImages.forEach(imgSrc => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imgSrc;
      link.type = imgSrc.endsWith('webp') ? 'image/webp' : 'image/jpeg';
      
      document.head.appendChild(link);
    });
  }