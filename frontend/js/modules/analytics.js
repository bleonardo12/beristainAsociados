// analytics.js - Sistema de tracking para Google Analytics y Google Ads

/**
 * Módulo de Analytics para trackear todas las interacciones importantes
 * Integrado con Google Analytics (G-MLZ2VR5SYR) y Google Ads (AW-11107730225)
 */

export function initAnalytics() {
  console.log('📊 Inicializando módulo de Analytics...');

  if (typeof gtag === 'undefined') {
    console.warn('⚠️ gtag no disponible - Analytics deshabilitado');
    return;
  }

  console.log('✅ gtag disponible, configurando tracking...');

  trackCTAClicks();
  trackScrollDepth();
  trackTimeOnPage();
  trackSectionViews();
  trackSocialClicks();
  trackWhatsAppClicks();
  trackPhoneClicks();

  console.log('✅ Analytics inicializado correctamente');
}

/**
 * Trackear clicks en botones CTA (Call To Action)
 */
function trackCTAClicks() {
  const contactoInmediatoBtn = document.querySelector('[data-bs-target="#staticBackdrop"]');
  if (contactoInmediatoBtn) {
    contactoInmediatoBtn.addEventListener('click', () => {
      gtag('event', 'cta_click', {
        'cta_location': 'navbar_modal_trigger',
        'cta_name': 'Contacto Inmediato'
      });
      console.log('📊 Tracked: Contacto Inmediato clicked');
    });
  }

  const consultaBtns = document.querySelectorAll('a[href="#contact-form-section"], button[onclick*="contact"]');
  consultaBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      gtag('event', 'cta_click', {
        'cta_location': 'body_section',
        'cta_name': 'Consulta Gratuita'
      });
      console.log('📊 Tracked: Consulta Gratuita clicked');
    });
  });
}

/**
 * Trackear profundidad de scroll utilizando nombres estándar de GA4
 */
function trackScrollDepth() {
  const scrollMilestones = [25, 50, 75, 90, 100];
  const reached = new Set();

  window.addEventListener('scroll', () => {
    const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (totalScrollable <= 0) return;

    const scrollPercent = Math.round((window.scrollY / totalScrollable) * 100);

    scrollMilestones.forEach(milestone => {
      if (scrollPercent >= milestone && !reached.has(milestone)) {
        reached.add(milestone);
        // GA4 estándar utiliza el parámetro 'percent' para el evento 'scroll'
        gtag('event', 'scroll_depth_milestone', {
          'percent': milestone
        });
        console.log(`📊 Tracked: Scroll depth ${milestone}%`);
      }
    });
  }, { passive: true }); // Mejora el rendimiento del scroll
}

/**
 * Trackear tiempo en página limpiando el intervalo al finalizar
 */
function trackTimeOnPage() {
  const intervals = [30, 60, 120, 300]; // segundos
  const maxInterval = Math.max(...intervals);
  let timeSpent = 0;

  const timer = setInterval(() => {
    timeSpent += 10;
    
    if (intervals.includes(timeSpent)) {
      gtag('event', 'time_on_page_milestone', {
        'duration_seconds': timeSpent
      });
      console.log(`📊 Tracked: Time on page ${timeSpent}s`);
    }

    if (timeSpent >= maxInterval) {
      clearInterval(timer);
    }
  }, 10000);
}

/**
 * Trackear visualización de secciones importantes
 */
function trackSectionViews() {
  const sections = document.querySelectorAll('section[id]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
        const sectionId = entry.target.id;
        gtag('event', 'section_view', {
          'section_id': sectionId
        });
        console.log(`📊 Tracked: Section view - ${sectionId}`);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(section => observer.observe(section));
}

/**
 * Trackear clicks en redes sociales
 */
function trackSocialClicks() {
  const platforms = ['instagram', 'linkedin', 'tiktok', 'facebook'];
  
  platforms.forEach(platform => {
    const link = document.querySelector(`a[href*="${platform}.com"]`);
    if (link) {
      link.addEventListener('click', () => {
        gtag('event', 'social_click', {
          'social_platform': platform
        });
        console.log(`📊 Tracked: ${platform} click`);
      });
    }
  });
}

/**
 * Trackear clicks en WhatsApp protegido contra selectores duplicados
 */
function trackWhatsAppClicks() {
  // Combinamos los selectores separados por coma para que querySelectorAll devuelva elementos únicos
  const whatsappLinks = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]');

  whatsappLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (typeof gtag !== 'undefined') {
        // Conversión de Google Ads para WhatsApp
        gtag('event', 'conversion', {
          'send_to': 'AW-11107730225/Yg24CK6u4LsbELGGyrAp',
          'value': 75.0,
          'currency': 'ARS',
          'transaction_id': `wa_${Date.now()}`
        });
        console.log('📊 Google Ads WhatsApp conversion tracked');
      }

      gtag('event', 'contact_click', {
        'contact_method': 'whatsapp'
      });
      console.log('📊 Tracked: WhatsApp click');
    });
  });
}

/**
 * Trackear clicks en teléfono
 */
function trackPhoneClicks() {
  const phoneLinks = document.querySelectorAll('a[href^="tel:"]');

  phoneLinks.forEach(link => {
    link.addEventListener('click', () => {
      const phoneNumber = link.href.replace('tel:', '');

      if (typeof gtag !== 'undefined') {
        // Conversión de Google Ads para Llamada Directa
        gtag('event', 'conversion', {
          'send_to': 'AW-11107730225/MjxGCJ-v6bsbELGGyrAp',
          'value': 100.0,
          'currency': 'ARS',
          'transaction_id': `tel_${Date.now()}`
        });
        console.log('📊 Google Ads Phone conversion tracked');
      }

      gtag('event', 'contact_click', {
        'contact_method': 'phone',
        'phone_number': phoneNumber
      });
      console.log('📊 Tracked: Phone click');
    });
  });
}

/**
 * Funciones auxiliares globales exportadas para el resto del sistema modular
 */
export function trackEvent(eventName, params = {}) {
  if (typeof gtag === 'undefined') return;
  gtag('event', eventName, params);
  console.log(`📊 Tracked custom event: ${eventName}`, params);
}

export function trackConversion(conversionLabel, value = 1.0, currency = 'ARS') {
  if (typeof gtag === 'undefined') return;
  gtag('event', 'conversion', {
    'send_to': `AW-11107730225/${conversionLabel}`,
    'value': value,
    'currency': currency,
    'transaction_id': `conv_${Date.now()}`
  });
  console.log(`📊 Tracked conversion: ${conversionLabel}, value: ${value} ${currency}`);
}

export function trackFormInteraction(fieldName, action) {
  if (typeof gtag === 'undefined') return;
  gtag('event', 'form_interaction', {
    'form_field': fieldName,
    'form_action': action
  });
}

export function trackFormAbandonment(lastField) {
  if (typeof gtag === 'undefined') return;
  gtag('event', 'form_abandonment', {
    'last_active_field': lastField
  });
}

export function trackFormError(fieldName, errorType) {
  if (typeof gtag === 'undefined') return;
  gtag('event', 'form_error', {
    'invalid_field': fieldName,
    'error_type': errorType
  });
}