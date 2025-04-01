/**
 * Módulo para la gestión del formulario de contacto
 * Implementa validación en tiempo real, animaciones,
 * accesibilidad y simulación de envío con feedback visual.
 */

// Configuración global
const CONFIG = {
  DEBOUNCE_DELAY: 300, // ms para debounce en validaciones
  ERROR_TIMEOUT: 5000,  // ms para ocultar mensajes de error
  SUBMIT_TIMEOUT: 1500  // ms para simular envío
};

/**
 * Inicializa el formulario de contacto
 * @returns {Object|null} API del formulario o null si no se encuentra el formulario
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
 * Configura el envío del formulario con feedback visual
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
        
        // Enviar datos (simulado o real)
        const result = await sendFormData(data);
        
        // Procesar respuesta exitosa
        announceFormStatus('¡Formulario enviado con éxito!');
        
        // Mostrar mensaje de éxito con animación
        formContainer.innerHTML = createSuccessMessage();
        
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
 * Envía los datos del formulario al servidor
 * @param {Object} data - Datos del formulario
 * @returns {Promise} Promesa con el resultado
 */
async function sendFormData(data) {
  // TODO: Reemplazar con implementación real de API
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulación: 90% éxito, 10% error
      if (Math.random() > 0.1) {
        console.log('Datos que se enviarían:', data);
        resolve({ success: true, message: 'Mensaje enviado correctamente' });
      } else {
        reject(new Error('Error en el servidor. Por favor, intente nuevamente.'));
      }
    }, CONFIG.SUBMIT_TIMEOUT);
  });
}

/**
 * Crea el mensaje de éxito tras envío exitoso
 * @returns {string} HTML del mensaje de éxito
 */
function createSuccessMessage() {
  return `
    <div class="success-animation text-center py-5" role="alert" aria-live="polite">
      <div class="checkmark-circle">
        <div class="checkmark draw"></div>
      </div>
      <h3 class="mt-4">¡Gracias por su mensaje!</h3>
      <p>Nos pondremos en contacto con usted a la brevedad.</p>
      <p class="mt-4">
        <a href="#" class="btn btn-outline-primary" onclick="window.location.reload()">
          Enviar otra consulta
        </a>
      </p>
    </div>
  `;
}

/**
 * Muestra un mensaje de error en el formulario
 * @param {HTMLFormElement} form - Formulario donde mostrar el error
 * @param {string} message - Mensaje de error
 */
function showErrorMessage(form, message) {
  try {
    // Verificar si ya existe un mensaje de error
    let errorAlert = form.querySelector('.alert-danger');
    
    if (!errorAlert) {
      // Crear alerta de error
      errorAlert = document.createElement('div');
      errorAlert.className = 'alert alert-danger alert-dismissible fade show mt-3';
      errorAlert.setAttribute('role', 'alert');
      errorAlert.setAttribute('aria-live', 'assertive');
      
      // Crear botón para cerrar
      const closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.className = 'btn-close';
      closeButton.setAttribute('data-bs-dismiss', 'alert');
      closeButton.setAttribute('aria-label', 'Cerrar');
      
      errorAlert.appendChild(closeButton);
      form.prepend(errorAlert);
    }
    
    // Actualizar mensaje
    errorAlert.innerHTML = `
      <strong>Error:</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    `;
    
    // Animar entrada
    errorAlert.style.animation = 'fadeInDown 0.5s forwards';
    
    // Enfocar mensaje para lectores de pantalla
    errorAlert.setAttribute('tabindex', '-1');
    errorAlert.focus();
    
    // Auto-ocultar después de un tiempo
    setTimeout(() => {
      if (errorAlert.parentNode) {
        errorAlert.classList.remove('show');
        setTimeout(() => errorAlert.remove(), 300);
      }
    }, CONFIG.ERROR_TIMEOUT);
  } catch (error) {
    console.error('Error al mostrar mensaje de error:', error);
  }
}

/**
 * Mejora la accesibilidad del formulario
 * @param {HTMLFormElement} form - Formulario a mejorar
 */
function enhanceAccessibility(form) {
  try {
    // Verificar que los campos tengan labels y atributos adecuados
    const fields = form.querySelectorAll('input, textarea, select');
    
    fields.forEach(field => {
      // Verificar si tiene id
      if (!field.id) {
        field.id = `field-${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Verificar label
      const label = form.querySelector(`label[for="${field.id}"]`);
      if (!label) {
        const parentLabel = field.closest('label');
        if (!parentLabel) {
          console.warn(`Campo sin etiqueta: ${field.name || field.id}`);
        }
      }
      
      // Añadir atributos de accesibilidad
      if (field.required && !field.hasAttribute('aria-required')) {
        field.setAttribute('aria-required', 'true');
      }
      
      if (!field.hasAttribute('aria-invalid')) {
        field.setAttribute('aria-invalid', 'false');
      }
    });
    
    // Asegurar que el formulario tenga un título descriptivo
    if (!form.hasAttribute('aria-labelledby')) {
      const formTitle = document.createElement('h2');
      formTitle.id = 'form-title';
      formTitle.className = 'sr-only';
      formTitle.textContent = 'Formulario de contacto';
      form.prepend(formTitle);
      form.setAttribute('aria-labelledby', 'form-title');
    }
  } catch (error) {
    console.error('Error al mejorar accesibilidad del formulario:', error);
  }
}

/**
 * Hace scroll suave hacia un elemento
 * @param {HTMLElement} element - Elemento destino
 */
function scrollSmoothly(element) {
  try {
    if ('scrollBehavior' in document.documentElement.style) {
      // Navegadores modernos
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // Fallback para navegadores antiguos
      const rect = element.getBoundingClientRect();
      const targetY = rect.top + window.pageYOffset - (window.innerHeight / 2);
      window.scrollTo(0, targetY);
    }
  } catch (error) {
    console.error('Error al realizar scroll:', error);
    // Fallback seguro
    window.scrollTo(0, element.offsetTop);
  }
}

/**
 * Crea una función con debounce
 * @param {Function} func - Función a aplicar debounce
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} Función con debounce
 */
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Crea una API pública para el formulario
 * @param {HTMLFormElement} form - Formulario
 * @returns {Object} API del formulario
 */
function createFormAPI(form) {
  return {
    /**
     * Valida el formulario completo
     * @param {boolean} showErrors - Indica si se deben mostrar errores
     * @returns {boolean} Indica si el formulario es válido
     */
    validate: (showErrors = true) => {
      const fields = form.querySelectorAll('input, textarea, select');
      let isValid = true;
      
      fields.forEach(field => {
        if (!validateField(field, showErrors)) {
          isValid = false;
        }
      });
      
      return isValid;
    },
    
    /**
     * Resetea el formulario a su estado inicial
     */
    reset: () => {
      form.reset();
      const fields = form.querySelectorAll('input, textarea, select');
      
      fields.forEach(field => {
        field.classList.remove('is-valid', 'is-invalid', 'has-content');
        field.setAttribute('aria-invalid', 'false');
        
        // Resetear mensajes de error
        const parent = field.closest('.form-floating') || field.parentNode;
        const errorContainer = parent.querySelector('.invalid-feedback');
        if (errorContainer) {
          errorContainer.style.display = 'none';
        }
      });
      
      // Actualizar botón
      updateSubmitButton(form);
    },
    
    /**
     * Rellena el formulario con datos
     * @param {Object} data - Datos para rellenar
     */
    fill: (data) => {
      Object.entries(data).forEach(([key, value]) => {
        const field = form.elements[key];
        if (field) {
          field.value = value;
          field.dispatchEvent(new Event('input'));
          field.classList.add('has-content');
        }
      });
      
      // Validar después de rellenar
      setTimeout(() => {
        const fields = form.querySelectorAll('input, textarea, select');
        fields.forEach(field => validateField(field, false));
        updateSubmitButton(form);
      }, 100);
    }
  };
}