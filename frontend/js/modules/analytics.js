// analytics.js - Sistema de tracking para Google Analytics y Google Ads

/**
 * Módulo de Analytics para trackear todas las interacciones importantes
 * Integrado con Google Analytics (G-MLZ2VR5SYR) y Google Ads (AW-11107730225)
 */

export function initAnalytics() {
  console.log('📊 Inicializando módulo de Analytics...');

  // Verificar que gtag esté disponible
  if (typeof gtag === 'undefined') {
    console.warn('⚠️ gtag no disponible - Analytics deshabilitado');
    return;
  }

  console.log('✅ gtag disponible, configurando tracking...');

  // Trackear clicks en botones CTA
  trackCTAClicks();

  // Trackear scroll profundo
  trackScrollDepth();

  // Trackear tiempo en página
  trackTimeOnPage();

  // Trackear interacción con secciones
  trackSectionViews();

  // Trackear clicks en enlaces sociales
  trackSocialClicks();

  // Trackear clicks en WhatsApp
  trackWhatsAppClicks();

  // Trackear clicks en teléfono
  trackPhoneClicks();

  console.log('✅ Analytics inicializado correctamente');
}

/**
 * Trackear clicks en botones CTA (Call To Action)
 */
function trackCTAClicks() {
  // Botón "Contacto Inmediato" en navbar
  const contactoInmediatoBtn = document.querySelector('[data-bs-target="#contactoInmediatoModal"]');
  if (contactoInmediatoBtn) {
    contactoInmediatoBtn.addEventListener('click', () => {
      gtag('event', 'cta_click', {
        'event_category': 'Engagement',
        'event_label': 'Contacto Inmediato - Navbar',
        'value': 1
      });
      console.log('📊 Tracked: Contacto Inmediato clicked');
    });
  }

  // Botones de "Consulta Gratuita"
  const consultaBtns = document.querySelectorAll('a[href="#contact-form-section"], button[onclick*="contact"]');
  consultaBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      gtag('event', 'cta_click', {
        'event_category': 'Engagement',
        'event_label': 'Consulta Gratuita',
        'value': 1
      });
      console.log('📊 Tracked: Consulta Gratuita clicked');
    });
  });
}

/**
 * Trackear profundidad de scroll
 */
function trackScrollDepth() {
  const scrollMilestones = [25, 50, 75, 90, 100];
  const reached = new Set();

  window.addEventListener('scroll', () => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );

    scrollMilestones.forEach(milestone => {
      if (scrollPercent >= milestone && !reached.has(milestone)) {
        reached.add(milestone);
        gtag('event', 'scroll_depth', {
          'event_category': 'Engagement',
          'event_label': `${milestone}%`,
          'value': milestone
        });
        console.log(`📊 Tracked: Scroll depth ${milestone}%`);
      }
    });
  });
}

/**
 * Trackear tiempo en página (en intervalos)
 */
function trackTimeOnPage() {
  const intervals = [30, 60, 120, 300]; // segundos
  let timeSpent = 0;

  setInterval(() => {
    timeSpent += 10;
    if (intervals.includes(timeSpent)) {
      gtag('event', 'time_on_page', {
        'event_category': 'Engagement',
        'event_label': `${timeSpent}s`,
        'value': timeSpent
      });
      console.log(`📊 Tracked: Time on page ${timeSpent}s`);
    }
  }, 10000); // Cada 10 segundos
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
          'event_category': 'Engagement',
          'event_label': sectionId,
          'value': 1
        });
        console.log(`📊 Tracked: Section view - ${sectionId}`);
        observer.unobserve(entry.target); // Solo trackear una vez
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(section => observer.observe(section));
}

/**
 * Trackear clicks en redes sociales
 */
function trackSocialClicks() {
  const socialLinks = {
    'instagram': document.querySelector('a[href*="instagram.com"]'),
    'linkedin': document.querySelector('a[href*="linkedin.com"]'),
    'tiktok': document.querySelector('a[href*="tiktok.com"]'),
    'facebook': document.querySelector('a[href*="facebook.com"]')
  };

  Object.entries(socialLinks).forEach(([platform, link]) => {
    if (link) {
      link.addEventListener('click', () => {
        gtag('event', 'social_click', {
          'event_category': 'Social',
          'event_label': platform,
          'value': 1
        });
        console.log(`📊 Tracked: ${platform} click`);
      });
    }
  });
}

/**
 * Trackear clicks en WhatsApp
 * IMPORTANTE: WhatsApp es una conversión valiosa (contacto directo)
 */
function trackWhatsAppClicks() {
  const whatsappLinks = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]');

  whatsappLinks.forEach(link => {
    link.addEventListener('click', () => {
      // 📊 GOOGLE ADS: Conversión de WhatsApp
      // Conversión configurada: "WhatsApp - Contacto Directo"
      // Label obtenido de Google Ads: Yg24CK6u4LsbELGGyrAp
      if (typeof gtag !== 'undefined') {
        // Conversión de Google Ads para WhatsApp
        gtag('event', 'conversion', {
          'send_to': 'AW-11107730225/Yg24CK6u4LsbELGGyrAp', // ✅ CONFIGURADO
          'value': 75.0, // Valor mayor porque es contacto más directo
          'currency': 'ARS',
          'transaction_id': Date.now().toString()
        });
        console.log('📊 Google Ads WhatsApp conversion tracked');
      }

      // Evento de Analytics
      gtag('event', 'whatsapp_click', {
        'event_category': 'Contact',
        'event_label': 'WhatsApp',
        'value': 1
      });
      console.log('📊 Tracked: WhatsApp click');
    });
  });
}

/**
 * Trackear clicks en teléfono
 * IMPORTANTE: Llamadas telefónicas son conversiones de alto valor
 */
function trackPhoneClicks() {
  const phoneLinks = document.querySelectorAll('a[href^="tel:"]');

  phoneLinks.forEach(link => {
    link.addEventListener('click', () => {
      const phoneNumber = link.href.replace('tel:', '');

      // 📊 GOOGLE ADS: Conversión de clic en llamada
      // Conversión configurada: "Clic de llamada"
      // Label obtenido de Google Ads: 7dcGCM7ztrwbELGGyrAp
      if (typeof gtag !== 'undefined') {
        gtag('event', 'conversion', {
          'send_to': 'AW-11107730225/7dcGCM7ztrwbELGGyrAp', // ✅ ACTUALIZADO
          'value': 1.0,
          'currency': 'ARS',
          'transaction_id': Date.now().toString()
        });
        console.log('📊 Google Ads: Clic de llamada tracked -', phoneNumber);
      }

      // Evento de Analytics
      gtag('event', 'phone_click', {
        'event_category': 'Contact',
        'event_label': phoneNumber,
        'value': 1
      });
      console.log('📊 Tracked: Phone click');
    });
  });
}

/**
 * Función auxiliar para trackear eventos personalizados desde otros módulos
 * @param {string} eventName - Nombre del evento
 * @param {object} params - Parámetros del evento
 */
export function trackEvent(eventName, params = {}) {
  if (typeof gtag === 'undefined') {
    console.warn('⚠️ gtag no disponible');
    return;
  }

  gtag('event', eventName, params);
  console.log(`📊 Tracked custom event: ${eventName}`, params);
}

/**
 * Trackear conversión de Google Ads
 * @param {string} conversionLabel - Label de conversión de Google Ads
 * @param {number} value - Valor de la conversión
 * @param {string} currency - Moneda (default: ARS)
 */
export function trackConversion(conversionLabel, value = 1.0, currency = 'ARS') {
  if (typeof gtag === 'undefined') {
    console.warn('⚠️ gtag no disponible para conversión');
    return;
  }

  gtag('event', 'conversion', {
    'send_to': `AW-11107730225/${conversionLabel}`,
    'value': value,
    'currency': currency,
    'transaction_id': Date.now().toString()
  });

  console.log(`📊 Tracked conversion: ${conversionLabel}, value: ${value} ${currency}`);
}

/**
 * Trackear interacciones con el formulario
 * @param {string} fieldName - Nombre del campo
 * @param {string} action - Acción (focus, blur, input)
 */
export function trackFormInteraction(fieldName, action) {
  if (typeof gtag === 'undefined') return;

  gtag('event', 'form_interaction', {
    'event_category': 'Form',
    'event_label': `${fieldName} - ${action}`,
    'value': 1
  });

  console.log(`📊 Tracked form interaction: ${fieldName} - ${action}`);
}

/**
 * Trackear abandono de formulario
 * @param {string} lastField - Último campo interactuado
 */
export function trackFormAbandonment(lastField) {
  if (typeof gtag === 'undefined') return;

  gtag('event', 'form_abandonment', {
    'event_category': 'Form',
    'event_label': lastField,
    'value': 1
  });

  console.log(`📊 Tracked form abandonment at: ${lastField}`);
}

/**
 * Trackear errores de validación
 * @param {string} fieldName - Campo con error
 * @param {string} errorType - Tipo de error
 */
export function trackFormError(fieldName, errorType) {
  if (typeof gtag === 'undefined') return;

  gtag('event', 'form_error', {
    'event_category': 'Form',
    'event_label': `${fieldName} - ${errorType}`,
    'value': 1
  });

  console.log(`📊 Tracked form error: ${fieldName} - ${errorType}`);
}

// ========== GOOGLE ADS REMARKETING ==========

/**
 * Inicializar remarketing avanzado
 * Crea audiencias personalizadas para campañas de retargeting
 */
export function initRemarketing() {
  if (typeof gtag === 'undefined') {
    console.warn('⚠️ gtag no disponible - Remarketing deshabilitado');
    return;
  }

  console.log('🎯 Inicializando Google Ads Remarketing...');

  // Track página vista con valor para remarketing
  trackRemarketingPageView();

  // Track visualización de servicios específicos
  trackServiceViews();

  // Track engagement (usuarios altamente interesados)
  trackHighEngagement();

  console.log('✅ Remarketing inicializado correctamente');
}

/**
 * Trackear página vista para remarketing
 */
function trackRemarketingPageView() {
  gtag('event', 'page_view', {
    'send_to': 'AW-11107730225',
    'value': 1.0,
    'currency': 'ARS'
  });

  console.log('🎯 Remarketing: Page view tracked');
}

/**
 * Trackear visualización de servicios específicos
 * Permite crear audiencias por área de interés
 */
function trackServiceViews() {
  // Observar cuando usuario ve secciones de servicios
  const servicesSections = document.querySelectorAll('[id*="practica"], [id*="servicios"]');

  if (servicesSections.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id || 'unknown';

        gtag('event', 'view_item', {
          'send_to': 'AW-11107730225',
          'items': [{
            'id': sectionId,
            'name': entry.target.querySelector('h2, h3')?.textContent || sectionId,
            'category': 'Servicios Legales'
          }],
          'value': 1.0,
          'currency': 'ARS'
        });

        console.log(`🎯 Remarketing: Servicio visto - ${sectionId}`);

        // Dejar de observar después de trackear
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  servicesSections.forEach(section => observer.observe(section));
}

/**
 * Trackear alto engagement (usuarios muy interesados)
 * Crea audiencia premium para remarketing
 */
function trackHighEngagement() {
  let engagementScore = 0;
  let tracked = false;

  // +1 por cada 30 segundos en el sitio
  setInterval(() => {
    engagementScore += 1;

    // Si pasa 90 segundos (engagement score 3+) y no lo trackeamos aún
    if (engagementScore >= 3 && !tracked) {
      gtag('event', 'high_engagement', {
        'send_to': 'AW-11107730225',
        'event_category': 'Engagement',
        'event_label': 'Usuario altamente interesado',
        'value': 5.0,
        'currency': 'ARS'
      });

      console.log('🎯 Remarketing: High engagement tracked (90+ segundos)');
      tracked = true;
    }
  }, 30000); // Cada 30 segundos

  // +1 por scroll profundo (más de 75%)
  window.addEventListener('scroll', () => {
    const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;

    if (scrollPercent > 75 && engagementScore < 10) {
      engagementScore += 2;
    }
  }, { passive: true });

  // +2 por abrir modal de contacto
  const modalButtons = document.querySelectorAll('[data-bs-toggle="modal"]');
  modalButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      engagementScore += 2;

      gtag('event', 'contact_intent', {
        'send_to': 'AW-11107730225',
        'event_category': 'Engagement',
        'event_label': 'Abrió modal de contacto',
        'value': 3.0,
        'currency': 'ARS'
      });

      console.log('🎯 Remarketing: Contact intent tracked');
    });
  });
}
