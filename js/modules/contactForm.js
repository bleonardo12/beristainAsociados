/**
 * Módulo para la gestión del formulario de contacto
 * Implementa validación en tiempo real, animaciones,
 * y simulación de envío con feedback visual.
 */

/**
 * Inicializa el formulario de contacto
 */
export function initContactForm() {
    const form = document.getElementById('formulario-contacto');
    if (!form) return;
    
    setupFormValidation(form);
    setupFormSubmission(form);
  }
  
  /**
   * Configura la validación del formulario en tiempo real
   */
  function setupFormValidation(form) {
    const fields = form.querySelectorAll('input, textarea, select');
    
    // Preparar mensajes de error personalizados
    fields.forEach(field => {
      // No mostrar errores mientras el usuario está escribiendo
      field.addEventListener('input', () => {
        validateField(field, false);
        updateSubmitButton(form);
      });
      
      // Mostrar errores cuando el campo pierde el foco
      field.addEventListener('blur', () => {
        validateField(field, true);
        updateSubmitButton(form);
      });
      
      // Estilizar campos para una mejor experiencia de usuario
      styleInputInteractions(field);
    });
  }
  
  /**
   * Valida un campo individual y muestra/oculta errores
   */
  function validateField(field, showError = false) {
    const isValid = field.checkValidity();
    
    // Buscar o crear contenedor de error
    let errorContainer = field.nextElementSibling;
    if (!errorContainer || !errorContainer.classList.contains('invalid-feedback')) {
      errorContainer = document.createElement('div');
      errorContainer.className = 'invalid-feedback';
      field.parentNode.appendChild(errorContainer);
    }
    
    // Actualizar clases y mensajes según validez
    if (!isValid && showError) {
      field.classList.add('is-invalid');
      field.classList.remove('is-valid');
      
      // Mostrar mensaje de error personalizado
      errorContainer.textContent = getErrorMessage(field);
      errorContainer.style.display = 'block';
    } else {
      field.classList.remove('is-invalid');
      if (field.value && isValid) {
        field.classList.add('is-valid');
      } else {
        field.classList.remove('is-valid');
      }
      
      errorContainer.style.display = 'none';
    }
    
    return isValid;
  }
  
  /**
   * Genera un mensaje de error personalizado según el tipo de validación
   */
  function getErrorMessage(field) {
    // Obtener tipo de error
    if (field.validity.valueMissing) {
      return 'Este campo es obligatorio';
    }
    
    if (field.validity.typeMismatch) {
      if (field.type === 'email') {
        return 'Por favor, ingrese un correo electrónico válido';
      }
      if (field.type === 'tel') {
        return 'Por favor, ingrese un número de teléfono válido';
      }
      return 'Formato no válido';
    }
    
    if (field.validity.tooShort) {
      return `Debe contener al menos ${field.minLength} caracteres`;
    }
    
    if (field.validity.tooLong) {
      return `No debe exceder ${field.maxLength} caracteres`;
    }
    
    if (field.validity.patternMismatch) {
      if (field.id === 'telefono') {
        return 'Ingrese un número de teléfono válido';
      }
      return 'El formato ingresado no es válido';
    }
    
    return 'Por favor, complete este campo correctamente';
  }
  
  /**
   * Actualiza el estado del botón de envío según la validez del formulario
   */
  function updateSubmitButton(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) return;
    
    // Deshabilitar el botón si el formulario no es válido
    const isFormValid = form.checkValidity();
    submitButton.disabled = !isFormValid;
    
    // Actualizar apariencia del botón
    if (isFormValid) {
      submitButton.classList.add('pulse-animation');
    } else {
      submitButton.classList.remove('pulse-animation');
    }
  }
  
  /**
   * Añade estilos y efectos interactivos a los campos
   */
  function styleInputInteractions(field) {
    // Efecto al enfocarse en el campo
    field.addEventListener('focus', () => {
      field.parentElement.classList.add('focused');
    });
    
    field.addEventListener('blur', () => {
      field.parentElement.classList.remove('focused');
    });
  }
  
  /**
   * Configura el envío del formulario con feedback visual
   */
  function setupFormSubmission(form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Validar todos los campos antes de enviar
      const fields = form.querySelectorAll('input, textarea, select');
      let isValid = true;
      
      fields.forEach(field => {
        if (!validateField(field, true)) {
          isValid = false;
        }
      });
      
      if (!isValid) return;
      
      // Recopilar datos del formulario
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      try {
        // Mostrar estado de envío
        const formContainer = form.closest('.col-lg-8') || form.parentElement;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...';
        
        // Simular envío (reemplazar con llamada API real)
        await simulateFormSubmission(data);
        
        // Mostrar mensaje de éxito con animación
        formContainer.innerHTML = createSuccessMessage();
        
        // Aplicar animación de éxito
        const checkmark = formContainer.querySelector('.checkmark-circle');
        if (checkmark) {
          checkmark.classList.add('animate');
        }
        
        // Scroll suave hacia el mensaje
        formContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
      } catch (error) {
        console.error('Error al enviar formulario:', error);
        
        // Mostrar mensaje de error
        showErrorMessage(form, error.message || 'No se pudo enviar el formulario. Por favor, intente nuevamente.');
        
        // Restaurar botón
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.innerHTML = 'Enviar consulta';
      }
    });
  }
  
  /**
   * Simula el envío del formulario (reemplazar con API real)
   */
  async function simulateFormSubmission(data) {
    return new Promise((resolve, reject) => {
      // Simular tiempo de procesamiento
      setTimeout(() => {
        // Simular éxito (90%) o error (10%)
        if (Math.random() > 0.1) {
          console.log('Datos que se enviarían:', data);
          resolve({ success: true });
        } else {
          reject(new Error('Error en el servidor'));
        }
      }, 1500);
    });
  }
  
  /**
   * Crea el mensaje de éxito tras envío exitoso
   */
  function createSuccessMessage() {
    return `
      <div class="success-animation text-center py-5">
        <div class="checkmark-circle">
          <div class="checkmark draw"></div>
        </div>
        <h3 class="mt-4">¡Gracias por su mensaje!</h3>
        <p>Nos pondremos en contacto con usted a la brevedad.</p>
        <p class="mt-4">
          <a href="#" class="btn btn-outline-primary" onclick="window.location.reload()">Enviar otra consulta</a>
        </p>
      </div>
    `;
  }
  
  /**
   * Muestra un mensaje de error en el formulario
   */
  function showErrorMessage(form, message) {
    // Verificar si ya existe un mensaje de error
    let errorAlert = form.querySelector('.alert-danger');
    
    if (!errorAlert) {
      // Crear alerta de error
      errorAlert = document.createElement('div');
      errorAlert.className = 'alert alert-danger alert-dismissible fade show mt-3';
      errorAlert.setAttribute('role', 'alert');
      
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
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      if (errorAlert.parentNode) {
        errorAlert.classList.remove('show');
        setTimeout(() => errorAlert.remove(), 300);
      }
    }, 5000);
  }