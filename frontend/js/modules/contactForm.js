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
  scroll: true,
  successDelay: 8000,
  errorDelay: 8000,
};

export function initContactForm() {
  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const submitButton = form.querySelector("button[type=submit]");
    const feedback = form.querySelector(".form-feedback");
    const spinner = document.getElementById("spinner");

    // Verificar que EmailJS esté cargado
    if (typeof emailjs === 'undefined') {
      console.error('EmailJS no está cargado. Asegúrate de incluir el script en el HTML.');
      return;
    }

    // Inicializar EmailJS con la Public Key
    emailjs.init(window.emailJSConfig.publicKey);

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

      if (!validateForm()) {
        const firstErrorField = form.querySelector(".input-error");
        scrollToElement(firstErrorField);
        return;
      }

      // Verificar que las credenciales de EmailJS estén configuradas
      if (window.emailJSConfig.serviceID === "TU_SERVICE_ID" ||
          window.emailJSConfig.templateID === "TU_TEMPLATE_ID" ||
          window.emailJSConfig.publicKey === "TU_PUBLIC_KEY") {
        showFeedback("⚠️ Configuración pendiente: Por favor, configura las credenciales de EmailJS en contactForm.js", "error");
        return;
      }

      // Mostrar spinner y deshabilitar botón
      submitButton.disabled = true;
      submitButton.style.opacity = "0.6";
      if (spinner) {
        spinner.classList.remove("hidden");
      }

      // Preparar datos para EmailJS (nombres deben coincidir con el template)
      const templateParams = {
        nombre: form.elements["name"].value.trim(),
        email: form.elements["email"].value.trim(),
        asunto: form.elements["asunto"].value,
        mensaje: form.elements["message"].value.trim(),
      };

      try {
        await sendWithEmailJS(templateParams);
        showFeedback("¡Mensaje enviado correctamente! Te contactaremos pronto.");
        form.reset();

        // Scroll suave al mensaje de éxito
        setTimeout(() => {
          feedback.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      } catch (error) {
        console.error("Error al enviar el formulario:", error);
        let errorMessage = "Ocurrió un error al enviar tu mensaje. ";

        if (error.text) {
          errorMessage += `Detalles: ${error.text}`;
        } else {
          errorMessage += "Por favor, intentá nuevamente o contactanos directamente por WhatsApp.";
        }

        showFeedback(errorMessage, "error");
      } finally {
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

