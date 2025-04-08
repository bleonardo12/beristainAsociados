
// Configuración global
const CONFIG = {
  DEBOUNCE_DELAY: 300, // ms para debounce en validaciones
  ERROR_TIMEOUT: 5000,  // ms para ocultar mensajes de error
  API_ENDPOINT: 'https://www.beristainyasociados.com.ar/api/contacto', // URL del endpoint del backend
  API_TIMEOUT: 15000 // Timeout para llamadas a la API (15 segundos)
};

// Función de debounce
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Función para mejorar accesibilidad
function enhanceAccessibility(form) {
  form.setAttribute('aria-label', 'Formulario de contacto');
  form.setAttribute('novalidate', 'true');
}

// Scroll suave 
function scrollSmoothly(element) {
  element.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'center' 
  });
}

/**
 * Crea una API simple para el formulario
 * @param {HTMLFormElement} form - Formulario a gestionar
 * @returns {Object} API del formulario
 */
function createFormAPI(form) {
  return {
    validate: () => {
      const fields = form.querySelectorAll('input, textarea, select');
      let isValid = true;
      fields.forEach(field => {
        if (!validateField(field, true)) {
          isValid = false;
        }
      });
      return isValid;
    },
    reset: () => {
      form.reset();
      const fields = form.querySelectorAll('input, textarea, select');
      fields.forEach(field => {
        field.classList.remove('is-valid', 'is-invalid');
        updateSubmitButton(form);
      });
    },
    submit: () => {
      form.dispatchEvent(new Event('submit'));
    }
  };
}

/**
 * Inicializa el formulario de contacto
 * @returns {Object|null} API del formulario o null si no se encuentra
 */
export function initContactForm() {
  try {
    const form = document.getElementById('formulario-contacto');
    if (!form) {
      console.warn('Formulario de contacto no encontrado en el DOM');
      return null;
    }
    
    // Configurar validación y envío
    setupFormValidation(form);
    setupFormSubmission(form);
    enhanceAccessibility(form);
    
    // Crear y retornar API pública
    return createFormAPI(form);
  } catch (error) {
    console.error('Error al inicializar formulario de contacto:', error);
    return null;
  }
}

/**
 * Configura la validación del formulario en tiempo real
 * @param {HTMLFormElement} form - Elemento del formulario
 */
function setupFormValidation(form) {
  try {
    const fields = form.querySelectorAll('input, textarea, select');
    
    // Preparar contenedores de error para todos los campos
    fields.forEach(field => {
      prepareErrorContainer(field);
      
      // Eventos de validación con optimización
      if (field.tagName.toLowerCase() === 'textarea') {
        // Usar debounce para campos grandes como textarea
        field.addEventListener('input', debounce(() => {
          validateField(field, false);
          updateSubmitButton(form);
        }, CONFIG.DEBOUNCE_DELAY));
      } else {
        // Validación inmediata para campos pequeños
        field.addEventListener('input', () => {
          validateField(field, false);
          updateSubmitButton(form);
        });
      }
      
      // Mostrar errores al perder el foco
      field.addEventListener('blur', () => {
        validateField(field, true);
        updateSubmitButton(form);
      });
      
      // Estilizar campos para mejor UX
      styleInputInteractions(field);
    });
    
    // Validar al cambiar entre campos usando Tab
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && document.activeElement) {
        const currentField = document.activeElement;
        if (fields.contains(currentField)) {
          setTimeout(() => validateField(currentField, true), 0);
        }
      }
    });
    
  } catch (error) {
    console.error('Error al configurar validación del formulario:', error);
  }
}

/**
 * Crea un contenedor para mensajes de error si no existe
 * @param {HTMLElement} field - Campo de formulario
 */
function prepareErrorContainer(field) {
  try {
    // Verificar si ya existe un contenedor de error
    let parent = field.closest('.form-floating') || field.parentNode;
    let errorContainer = parent.querySelector('.invalid-feedback');
    
    if (!errorContainer) {
      errorContainer = document.createElement('div');
      errorContainer.className = 'invalid-feedback';
      errorContainer.id = `${field.id}-error`;
      // Conectar con el campo para lectores de pantalla
      field.setAttribute('aria-describedby', errorContainer.id);
      parent.appendChild(errorContainer);
    }
  } catch (error) {
    console.error('Error al preparar contenedor de error:', error);
  }
}

/**
 * Valida un campo individual y muestra/oculta errores
 * @param {HTMLElement} field - Campo a validar
 * @param {boolean} showError - Indica si se deben mostrar errores
 * @returns {boolean} - Indica si el campo es válido
 */
function validateField(field, showError = false) {
  try {
    // Si el campo no es necesario y está vacío, considerarlo válido
    if (!field.required && !field.value.trim()) {
      field.classList.remove('is-invalid', 'is-valid');
      return true;
    }
    
    const isValid = field.checkValidity();
    
    // Buscar contenedor de error
    const parent = field.closest('.form-floating') || field.parentNode;
    const errorContainer = parent.querySelector('.invalid-feedback');
    
    if (!errorContainer) return isValid;
    
    // Actualizar clases y mensajes según validez
    if (!isValid && showError) {
      field.classList.add('is-invalid');
      field.classList.remove('is-valid');
      field.setAttribute('aria-invalid', 'true');
      
      // Mostrar mensaje de error personalizado
      const errorMessage = getErrorMessage(field);
      errorContainer.textContent = errorMessage;
      errorContainer.style.display = 'block';
      
      // Anunciar error para lectores de pantalla
      announceError(field.id, errorMessage);
    } else {
      field.classList.remove('is-invalid');
      field.setAttribute('aria-invalid', 'false');
      
      if (field.value && isValid) {
        field.classList.add('is-valid');
      } else {
        field.classList.remove('is-valid');
      }
      
      errorContainer.style.display = 'none';
    }
    
    return isValid;
  } catch (error) {
    console.error('Error al validar campo:', error);
    return false;
  }
}

/**
 * Anuncia un error para lectores de pantalla
 * @param {string} fieldId - ID del campo con error
 * @param {string} message - Mensaje de error
 */
function announceError(fieldId, message) {
  try {
    // Buscar o crear el elemento live region para lectores de pantalla
    let announcer = document.getElementById('form-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'form-announcer';
      announcer.className = 'sr-only';
      announcer.setAttribute('aria-live', 'assertive');
      announcer.setAttribute('role', 'status');
      document.body.appendChild(announcer);
    }
    
    // Anunciar el error
    announcer.textContent = '';
    setTimeout(() => {
      announcer.textContent = `Error en ${fieldId}: ${message}`;
    }, 100);
  } catch (error) {
    console.error('Error al anunciar mensaje para lector de pantalla:', error);
  }
}

/**
 * Genera un mensaje de error personalizado según el tipo de validación
 * @param {HTMLElement} field - Campo con error
 * @returns {string} Mensaje de error personalizado
 */
function getErrorMessage(field) {
  try {
    // Obtener tipo de error
    if (field.validity.valueMissing) {
      return field.dataset.errorRequired || 'Este campo es obligatorio';
    }
    
    if (field.validity.typeMismatch) {
      if (field.type === 'email') {
        return field.dataset.errorEmail || 'Por favor, ingrese un correo electrónico válido';
      }
      if (field.type === 'tel') {
        return field.dataset.errorTel || 'Por favor, ingrese un número de teléfono válido';
      }
      return field.dataset.errorFormat || 'Formato no válido';
    }
    
    if (field.validity.tooShort) {
      return field.dataset.errorMinLength || 
        `Debe contener al menos ${field.minLength} caracteres`;
    }
    
    if (field.validity.tooLong) {
      return field.dataset.errorMaxLength || 
        `No debe exceder ${field.maxLength} caracteres`;
    }
    
    if (field.validity.patternMismatch) {
      if (field.id === 'telefono') {
        return field.dataset.errorPattern || 'Ingrese un número de teléfono válido';
      }
      return field.dataset.errorPattern || 'El formato ingresado no es válido';
    }
    
    return field.dataset.errorGeneric || 'Por favor, complete este campo correctamente';
  } catch (error) {
    console.error('Error al generar mensaje de error:', error);
    return 'Error de validación';
  }
}

/**
 * Actualiza el estado del botón de envío según la validez del formulario
 * @param {HTMLFormElement} form - Formulario a validar
 */
function updateSubmitButton(form) {
  try {
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) return;
    
    // Comprobar validez de todo el formulario
    const isFormValid = form.checkValidity();
    submitButton.disabled = !isFormValid;
    
    // Actualizar apariencia y aria del botón
    if (isFormValid) {
      submitButton.classList.add('pulse-animation');
      submitButton.setAttribute('aria-disabled', 'false');
    } else {
      submitButton.classList.remove('pulse-animation');
      submitButton.setAttribute('aria-disabled', 'true');
    }
    
    // Feedback visual para el usuario
    if (isFormValid && !submitButton._formValidFeedbackAdded) {
      // Agregar tooltip "Listo para enviar"
      submitButton.setAttribute('title', 'Formulario completo, listo para enviar');
      submitButton._formValidFeedbackAdded = true;
    }
  } catch (error) {
    console.error('Error al actualizar botón de envío:', error);
  }
}

/**
 * Añade estilos y efectos interactivos a los campos
 * @param {HTMLElement} field - Campo a estilizar
 */
function styleInputInteractions(field) {
  try {
    const parent = field.closest('.form-floating') || field.parentNode;
    
    // Efecto al enfocarse en el campo
    field.addEventListener('focus', () => {
      parent.classList.add('focused');
      // Mover etiqueta arriba en form-floating
      const label = parent.querySelector('label');
      if (label) {
        label.classList.add('active');
      }
    });
    
    field.addEventListener('blur', () => {
      parent.classList.remove('focused');
      // Mantener etiqueta arriba solo si hay valor
      const label = parent.querySelector('label');
      if (label && !field.value) {
        label.classList.remove('active');
      }
    });
    
    // Animación sutil al cambiar valor
    field.addEventListener('input', () => {
      if (field.value) {
        field.classList.add('has-content');
      } else {
        field.classList.remove('has-content');
      }
    });
    
    // Inicializar estado si ya tiene contenido
    if (field.value) {
      field.classList.add('has-content');
      const label = parent.querySelector('label');
      if (label) {
        label.classList.add('active');
      }
    }
  } catch (error) {
    console.error('Error al estilizar interacciones del campo:', error);
  }
}

/**
 * Configura el envío del formulario con conexión al backend
 * @param {HTMLFormElement} form - Formulario a configurar
 */
function setupFormSubmission(form) {
  try {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Eliminar errores anteriores
      const previousError = form.querySelector('.alert-danger');
      if (previousError) previousError.remove();
      
      // Validar todos los campos antes de enviar
      const fields = form.querySelectorAll('input, textarea, select');
      let isValid = true;
      
      fields.forEach(field => {
        if (!validateField(field, true)) {
          isValid = false;
          // Enfocar primer campo con error
          if (isValid === false) {
            setTimeout(() => field.focus(), 100);
            isValid = null; // evitar que se enfoque más de un campo
          }
        }
      });
      
      if (isValid !== true) return;
      
      // Recopilar datos del formulario
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      try {
        // Mostrar estado de envío
        const formContainer = form.closest('.col-lg-8') || form.parentElement;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        
        // Deshabilitar formulario durante envío
        disableForm(form, true);
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...';
        submitButton.setAttribute('aria-busy', 'true');
        
        // Anunciar estado para lectores de pantalla
        announceFormStatus('Enviando formulario, por favor espere...');
        
        // Enviar datos al backend
        const result = await sendFormDataToAPI(data);
        
        // Procesar respuesta exitosa
        announceFormStatus('¡Formulario enviado con éxito!');
        
        // Mostrar mensaje de éxito con animación
        formContainer.innerHTML = createSuccessMessage(result.message);
        
        // Aplicar animación de éxito
        const checkmark = formContainer.querySelector('.checkmark-circle');
        if (checkmark) {
          checkmark.classList.add('animate');
        }
        
        // Scroll suave hacia el mensaje
        scrollSmoothly(formContainer);
        
      } catch (error) {
        console.error('Error al enviar formulario:', error);
        
        // Restaurar formulario
        disableForm(form, false);
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.innerHTML = 'Enviar consulta';
        submitButton.setAttribute('aria-busy', 'false');
        
        // Mostrar mensaje de error
        const errorMessage = error.message || 'No se pudo enviar el formulario. Por favor, intente nuevamente.';
        showErrorMessage(form, errorMessage);
        announceFormStatus(`Error: ${errorMessage}`);
      }
    });
  } catch (error) {
    console.error('Error al configurar envío del formulario:', error);
  }
}

/**
 * Envía los datos del formulario a la API backend
 * @param {Object} data - Datos del formulario
 * @returns {Promise<Object>} Respuesta del servidor
 * @throws {Error} Si hay error en la comunicación
 */
async function sendFormDataToAPI(data) {
  try {
    // Crear controlador para el timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);
    
    // Realizar la solicitud
    const response = await fetch(CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });
    
    // Limpiar timeout
    clearTimeout(timeoutId);
    
    // Procesar respuesta
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Error en el servidor');
    }
    
    if (!responseData.success) {
      throw new Error(responseData.message || 'No se pudo procesar la solicitud');
    }
    
    return responseData;
  } catch (error) {
    // Manejar errores específicos
    if (error.name === 'AbortError') {
      throw new Error('La solicitud ha excedido el tiempo máximo de espera. Por favor, intente nuevamente.');
    }
    
    if (error.message === 'Failed to fetch') {
      throw new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.');
    }
    
    throw error;
  }
}

/**
 * Anuncia un cambio de estado del formulario para lectores de pantalla
 * @param {string} message - Mensaje a anunciar
 */
function announceFormStatus(message) {
  try {
    let statusAnnouncer = document.getElementById('form-status-announcer');
    if (!statusAnnouncer) {
      statusAnnouncer = document.createElement('div');
      statusAnnouncer.id = 'form-status-announcer';
      statusAnnouncer.className = 'sr-only';
      statusAnnouncer.setAttribute('aria-live', 'assertive');
      statusAnnouncer.setAttribute('role', 'status');
      document.body.appendChild(statusAnnouncer);
    }
    
    statusAnnouncer.textContent = '';
    setTimeout(() => {
      statusAnnouncer.textContent = message;
    }, 100);
  } catch (error) {
    console.error('Error al anunciar estado del formulario:', error);
  }
}

/**
 * Habilita o deshabilita todos los campos del formulario
 * @param {HTMLFormElement} form - Formulario a modificar
 * @param {boolean} disabled - Estado de deshabilitación
 */
function disableForm(form, disabled) {
  try {
    const fields = form.querySelectorAll('input, textarea, select, button');
    fields.forEach(field => {
      field.disabled = disabled;
      if (disabled) {
        field.setAttribute('aria-disabled', 'true');
      } else {
        field.setAttribute('aria-disabled', 'false');
      }
    });
  } catch (error) {
    console.error('Error al cambiar estado del formulario:', error);
  }
}

/**
 * Crea el mensaje de éxito tras envío exitoso
 * @param {string} message - Mensaje personalizado de éxito
 * @returns {string} HTML del mensaje de éxito
 */
function createSuccessMessage(message = null) {
  const successMessage = message || '¡Gracias por su mensaje! Nos pondremos en contacto con usted a la brevedad.';
  
  return `
    <div class="success-animation text-center py-5" role="alert" aria-live="polite">
      <div class="checkmark-circle">
        <div class="checkmark draw"></div>
      </div>
      <h3 class="mt-4">¡Envío exitoso!</h3>
      <p>${successMessage}</p>
      <p class="mt-4">
        <a href="#" class="btn btn-outline-primary" onclick="window.location.reload()">
          Enviar otra consulta
        </a>
      </p>
    </div>
  `;
}

const form = document.getElementById('contactForm');
const campos = form.querySelectorAll('input, textarea');
const spinner = document.getElementById('spinner');
const feedback = document.getElementById('formFeedback');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  let hayErrores = false;

  campos.forEach(campo => {
    const errorDiv = document.getElementById(`error-${campo.name}`);

    if (!campo.checkValidity()) {
      hayErrores = true;
      campo.classList.add('error');
      errorDiv.textContent = campo.validationMessage;
      errorDiv.classList.add('visible');
    } else {
      campo.classList.remove('error');
      errorDiv.textContent = '';
      errorDiv.classList.remove('visible');
    }
  });

  if (!hayErrores) {
    spinner.classList.remove('hidden');
    feedback.textContent = '';

    // Simulación de envío
    fetch('/tu-endpoint', {
      method: 'POST',
      body: new FormData(form)
    })
    .then(response => {
      spinner.classList.add('hidden');
      if (response.ok) {
        form.reset();
        feedback.textContent = 'Formulario enviado con éxito.';
      } else {
        feedback.textContent = 'Ocurrió un error al enviar el formulario.';
      }
    })
    .catch(() => {
      spinner.classList.add('hidden');
      feedback.textContent = 'Error de red. Intentalo de nuevo.';
    });
  }
});
