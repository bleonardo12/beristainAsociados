// contactForm.js

// Importar funciones utilitarias de analytics unificadas
import { trackFormInteraction, trackFormAbandonment, trackFormError, trackEvent } from './analytics.js';

// ✅ CONFIGURACIÓN DE EMAILJS - CREDENCIALES CONFIGURADAS
window.emailJSConfig = {
  serviceID: "service_fvgq98a",      // Gmail conectado
  templateID: "template_8jxmper",    // Template: contacto_beristain
  publicKey: "ysGIjFOIzbT7azpma"     // Public Key de la cuenta
};

// Configuración global del formulario
window.contactFormConfig = {
  scroll: false,  // Deshabilitado para evitar scroll inesperado
  successDelay: 8000,
  errorDelay: 8000,
};

export function initContactForm() {
  console.log('🔄 Inicializando formulario de contacto...');

  const form = document.getElementById("contact-form");
  if (!form) {
    console.error('❌ Formulario no encontrado');
    return;
  }

  const submitButton = form.querySelector("button[type=submit]");
  const feedback = form.querySelector(".form-feedback");
  const spinner = document.getElementById("spinner");

  console.log('✅ Elementos del formulario encontrados:', {
    form: !!form,
    submitButton: !!submitButton,
    feedback: !!feedback,
    spinner: !!spinner
  });

  // 📊 ANALYTICS: Trackear interacciones con campos del formulario
  let lastInteractedField = null;
  const formFields = form.querySelectorAll('input, textarea, select');

  formFields.forEach(field => {
    const fieldName = field.name || field.id || 'unnamed_field';

    // Track focus en campos
    field.addEventListener('focus', () => {
      lastInteractedField = fieldName;
      trackFormInteraction(lastInteractedField, 'focus');
    });

    // Track cuando el usuario empieza a escribir
    field.addEventListener('input', () => {
      trackFormInteraction(fieldName, 'input');
    }, { once: true });
  });

  // Track abandono del formulario (usuario sale sin enviar)
  let formStarted = false;
  formFields.forEach(field => {
    field.addEventListener('input', () => {
      formStarted = true;
    }, { once: true });
  });

  window.addEventListener('beforeunload', () => {
    if (formStarted && !form.classList.contains('submitted')) {
      trackFormAbandonment(lastInteractedField || 'unknown');
    }
  });

  // Función para esperar a que EmailJS esté disponible
  function waitForEmailJS(callback, maxAttempts = 50) {
    let attempts = 0;
    const checkInterval = setInterval(() => {
      attempts++;
      if (typeof emailjs !== 'undefined') {
        clearInterval(checkInterval);
        console.log(`✅ EmailJS detectado después de ${attempts} intentos`);
        callback();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.error('❌ EmailJS no se cargó después de esperar.');
      }
    }, 100);
  }

  // Esperar a que EmailJS esté disponible antes de inicializar
  waitForEmailJS(() => {
    console.log('✅ EmailJS disponible, inicializando...');
    try {
      emailjs.init(window.emailJSConfig.publicKey);
      console.log('✅ EmailJS inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar EmailJS:', error);
    }
  });

  function showFeedback(message, type = "success") {
    feedback.textContent = message;
    feedback.className = `form-feedback ${type}`;
    feedback.setAttribute("aria-live", "polite");

    setTimeout(() => {
      feedback.textContent = "";
      feedback.className = "form-feedback";
    }, window.contactFormConfig[`${type}Delay`] || 5000);
  }

  function scrollToElement(element) {
    if (!element || !window.contactFormConfig.scroll) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    element.focus({ preventScroll: true });
  }

  function clearErrors() {
    const errorElements = form.querySelectorAll(".error-message");
    errorElements.forEach(el => el.remove());
    const errorInputs = form.querySelectorAll(".input-error");
    errorInputs.forEach(el => el.classList.remove("input-error"));
  }

  function prepareErrorContainer(input) {
    let errorContainer = input.parentElement.querySelector(".error-message");
    if (!errorContainer) {
      errorContainer = document.createElement("div");
      errorContainer.classList.add("error-message");
      input.parentElement.appendChild(errorContainer);
    }
    return errorContainer;
  }

  function showFieldError(input, message) {
    input.classList.add("input-error");
    const errorContainer = prepareErrorContainer(input);
    errorContainer.textContent = message;
    errorContainer.setAttribute("role", "alert");

    const fieldName = input.name || input.id || 'unknown';
    const errorType = message.includes('válido') ? 'invalid_format' :
                      message.includes('ingresá') || message.includes('selecciona') ? 'required' : 'validation_error';
    
    trackFormError(fieldName, errorType);
  }

  function validateForm() {
    clearErrors();
    let isValid = true;

    const name = form.elements["name"];
    const email = form.elements["email"];
    const asunto = form.elements["asunto"];
    const message = form.elements["message"];

    if (!name.value.trim()) {
      showFieldError(name, "Por favor, ingresá tu nombre.");
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      showFieldError(email, "Por favor, ingresá tu correo electrónico.");
      isValid = false;
    } else if (!emailRegex.test(email.value)) {
      showFieldError(email, "El correo electrónico no es válido.");
      isValid = false;
    }

    if (!asunto.value) {
      showFieldError(asunto, "Por favor, selecciona un área legal.");
      isValid = false;
    }

    if (!message.value.trim()) {
      showFieldError(message, "Por favor, ingresá un mensaje.");
      isValid = false;
    }

    return isValid;
  }

  async function sendWithEmailJS(templateParams) {
    try {
      const response = await emailjs.send(
        window.emailJSConfig.serviceID,
        window.emailJSConfig.templateID,
        templateParams
      );
      return { success: true, response };
    } catch (error) {
      console.error('EmailJS Error:', error);
      throw error;
    }
  }

  // Pre-selección automática desde parámetro URL (?area=penal, ?area=accidentes, etc.)
  const urlArea = new URLSearchParams(window.location.search).get('area');
  if (urlArea) {
    const asunto = form.elements['asunto'];
    if (asunto) {
      const match = Array.from(asunto.options).find(o =>
        o.value.toLowerCase().includes(urlArea.toLowerCase())
      );
      if (match) asunto.value = match.value;
    }
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    e.stopPropagation();

    // Verificación honeypot anti-spam
    const honeypot = form.elements['hp_website'];
    if (honeypot && honeypot.value.trim() !== '') {
      form.classList.add('submitted');
      showFeedback("¡Mensaje enviado correctamente! Te contactaremos pronto.");
      form.reset();
      return;
    }

    console.log('📤 Formulario enviado, iniciando validación...');

    if (!validateForm()) {
      console.log('❌ Validación fallida');
      const firstErrorField = form.querySelector(".input-error");
      scrollToElement(firstErrorField);
      return;
    }

    console.log('✅ Validación exitosa');

    // Deshabilitar UI e iniciar spinner
    submitButton.disabled = true;
    submitButton.style.opacity = "0.6";
    if (spinner) spinner.classList.remove("hidden");

    const templateParams = {
      nombre: form.elements["name"].value.trim(),
      email: form.elements["email"].value.trim(),
      asunto: form.elements["asunto"].value,
      gclid: window.getGclid ? window.getGclid() : '',
      mensaje: form.elements["message"].value.trim(),
    };

    try {
      const result = await sendWithEmailJS(templateParams);
      console.log('✅ Email enviado exitosamente:', result);

      // GA4: evento informativo (no conversión de Google Ads)
      trackEvent('form_submission_success', { 'lead_legal_area': templateParams.asunto });

      // GTM maneja la conversión de Google Ads al recibir este evento
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'form_submit_exitoso', gclid: window.getGclid ? window.getGclid() : '' });

      form.classList.add('submitted');
      showFeedback("¡Mensaje enviado correctamente! Te contactaremos pronto.");
      form.reset();

    } catch (error) {
      console.error("❌ Error al enviar el formulario:", error);

      // Trackear error en analíticas
      trackEvent('form_submission_fail', {
        'error_status': error.status || 'unknown',
        'error_text': error.text || 'network_error'
      });

      let errorMessage = "Ocurrió un error al enviar tu mensaje. ";
      if (error.status === 412) {
        errorMessage = "⚠️ Error de configuración: La plantilla de EmailJS es incorrecta.";
      } else if (error.status === 403) {
        errorMessage = "⚠️ Error de autenticación: Verifica las credenciales de EmailJS.";
      } else {
        errorMessage += "Por favor, intentá nuevamente o contactanos directamente por WhatsApp.";
      }

      showFeedback(errorMessage, "error");
    } finally {
      submitButton.disabled = false;
      submitButton.style.opacity = "1";
      if (spinner) spinner.classList.add("hidden");
    }
  });
}