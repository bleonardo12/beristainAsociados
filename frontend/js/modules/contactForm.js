// contactForm.js

// ✅ CONFIGURACIÓN DE EMAILJS - CREDENCIALES CONFIGURADAS
// Dashboard: https://dashboard.emailjs.com/
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
  document.addEventListener("DOMContentLoaded", function () {
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
          console.error('❌ EmailJS no se cargó después de esperar. Verifica que el script esté en el HTML.');
        }
      }, 100); // Revisar cada 100ms
    }

    // Esperar a que EmailJS esté disponible antes de inicializar
    waitForEmailJS(() => {
      console.log('✅ EmailJS disponible, inicializando...');

      // Inicializar EmailJS con la Public Key
      try {
        emailjs.init(window.emailJSConfig.publicKey);
        console.log('✅ EmailJS inicializado correctamente');
        console.log('📋 Configuración:', {
          serviceID: window.emailJSConfig.serviceID,
          templateID: window.emailJSConfig.templateID,
          publicKey: window.emailJSConfig.publicKey.substring(0, 8) + '...'
        });
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

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      e.stopPropagation(); // Evitar que el evento suba y cause scrolls inesperados

      console.log('📤 Formulario enviado, iniciando validación...');

      if (!validateForm()) {
        console.log('❌ Validación fallida');
        const firstErrorField = form.querySelector(".input-error");
        scrollToElement(firstErrorField);
        return;
      }

      console.log('✅ Validación exitosa');

      // Verificar que las credenciales de EmailJS estén configuradas
      if (window.emailJSConfig.serviceID === "TU_SERVICE_ID" ||
          window.emailJSConfig.templateID === "TU_TEMPLATE_ID" ||
          window.emailJSConfig.publicKey === "TU_PUBLIC_KEY") {
        console.error('❌ Credenciales de EmailJS no configuradas');
        showFeedback("⚠️ Configuración pendiente: Por favor, configura las credenciales de EmailJS en contactForm.js", "error");
        return;
      }

      console.log('📧 Credenciales verificadas, preparando envío...');

      // Mostrar spinner y deshabilitar botón
      submitButton.disabled = true;
      submitButton.style.opacity = "0.6";
      if (spinner) {
        console.log('🔄 Mostrando spinner...');
        spinner.classList.remove("hidden");
      } else {
        console.error('❌ Spinner no encontrado');
      }

      // Preparar datos para EmailJS (nombres deben coincidir con el template)
      const templateParams = {
        nombre: form.elements["name"].value.trim(),
        email: form.elements["email"].value.trim(),
        asunto: form.elements["asunto"].value,
        mensaje: form.elements["message"].value.trim(),
      };

      console.log('📨 Enviando email con parámetros:', {
        ...templateParams,
        serviceID: window.emailJSConfig.serviceID,
        templateID: window.emailJSConfig.templateID
      });

      try {
        const result = await sendWithEmailJS(templateParams);
        console.log('✅ Email enviado exitosamente:', result);
        console.log('📧 Respuesta completa:', JSON.stringify(result, null, 2));
        showFeedback("¡Mensaje enviado correctamente! Te contactaremos pronto.");
        form.reset();
      } catch (error) {
        console.error("❌ Error al enviar el formulario:", error);
        console.error('📋 Error completo:', JSON.stringify(error, null, 2));
        console.error('📋 Error text:', error.text);
        console.error('📋 Error status:', error.status);

        let errorMessage = "Ocurrió un error al enviar tu mensaje. ";

        // Mensajes de error más específicos
        if (error.status === 412) {
          errorMessage = "⚠️ Error de configuración: La plantilla de EmailJS no está configurada correctamente.";
        } else if (error.status === 400) {
          errorMessage = "⚠️ Error: Los datos del formulario no son válidos.";
        } else if (error.status === 403) {
          errorMessage = "⚠️ Error de autenticación: Verifica las credenciales de EmailJS.";
        } else if (error.text) {
          errorMessage += `Detalles: ${error.text}`;
        } else if (error.message) {
          errorMessage += `Detalles: ${error.message}`;
        } else {
          errorMessage += "Por favor, intentá nuevamente o contactanos directamente por WhatsApp.";
        }

        showFeedback(errorMessage, "error");
      } finally {
        console.log('🔚 Finalizando envío, ocultando spinner...');
        // Ocultar spinner y habilitar botón
        submitButton.disabled = false;
        submitButton.style.opacity = "1";
        if (spinner) {
          spinner.classList.add("hidden");
        }
      }
    });
  });
}

