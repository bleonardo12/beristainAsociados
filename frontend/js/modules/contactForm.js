
// Configuración global
window.contactFormConfig = {
  scroll: true,
  successDelay: 8000,
  errorDelay: 8000,
};

// Debounce para limitar llamadas (ej: validación en tiempo real)
function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  const submitButton = form.querySelector("button[type=submit]");
  const feedback = form.querySelector(".form-feedback");

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

    if (!message.value.trim()) {
      showFieldError(message, "Por favor, ingresá un mensaje.");
      isValid = false;
    }

    return isValid;
  }

  async function sendFormData(data) {
    const endpoint = form.getAttribute("action") || "/contact";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error("Error al enviar el formulario.");
    }

    return response.json();
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorField = form.querySelector(".input-error");
      scrollToElement(firstErrorField);
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";

    const formData = {
      name: form.elements["name"].value.trim(),
      email: form.elements["email"].value.trim(),
      message: form.elements["message"].value.trim(),
    };

    try {
      const result = await sendFormData(formData);

      if (result.success) {
        showFeedback("¡Mensaje enviado correctamente!");
        form.reset();
      } else {
        showFeedback(result.error || "Hubo un problema al enviar tu mensaje.", "error");
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      showFeedback("Ocurrió un error inesperado. Intentá nuevamente más tarde.", "error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Enviar";
    }
  });
});
