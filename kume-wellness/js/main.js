// ========== KÜME WELLNESS - MAIN JS ==========

// Configuración de EmailJS
// IMPORTANTE: Reemplaza estos valores con tus credenciales de EmailJS
// Tutorial completo: https://www.emailjs.com/docs/
const EMAILJS_CONFIG = {
    serviceID: 'TU_SERVICE_ID',      // Reemplazar con tu Service ID
    templateID: 'TU_TEMPLATE_ID',    // Reemplazar con tu Template ID
    publicKey: 'TU_PUBLIC_KEY'       // Reemplazar con tu Public Key
};

// Inicializar EmailJS cuando cargue el DOM
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_CONFIG.publicKey);
        console.log('EmailJS inicializado correctamente');
    } else {
        console.error('EmailJS no está cargado. Verifica que el script esté en el HTML.');
    }

    // Inicializar todos los módulos
    initNavbar();
    initSmoothScroll();
    initDateRestrictions();
    initReservationForm();
    initAnimations();
    updateCurrentYear();
});

// ========== NAVBAR SCROLL ==========
function initNavbar() {
    const navbar = document.querySelector('nav.navbar');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Cerrar navbar al hacer click en un link (móvil)
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 992) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                    toggle: false
                });
                bsCollapse.hide();
            }
        });
    });
}

// ========== SMOOTH SCROLL ==========
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Ignorar enlaces que son solo "#"
            if (href === '#') return;

            e.preventDefault();

            const target = document.querySelector(href);
            if (target) {
                const navbarHeight = document.querySelector('nav.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navbarHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========== RESTRICCIONES DE FECHA ==========
function initDateRestrictions() {
    const fechaInput = document.getElementById('fecha');

    if (fechaInput) {
        // Establecer fecha mínima (hoy)
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const minDate = tomorrow.toISOString().split('T')[0];
        fechaInput.setAttribute('min', minDate);

        // Establecer fecha máxima (3 meses desde hoy)
        const maxDate = new Date(today);
        maxDate.setMonth(maxDate.getMonth() + 3);
        fechaInput.setAttribute('max', maxDate.toISOString().split('T')[0]);

        // Validar que no sea domingo
        fechaInput.addEventListener('change', function() {
            const selectedDate = new Date(this.value + 'T00:00:00');
            const dayOfWeek = selectedDate.getDay();

            // Si es domingo (0), mostrar error
            if (dayOfWeek === 0) {
                this.setCustomValidity('Los domingos estamos cerrados. Por favor, elegí otro día.');
                this.reportValidity();
                this.value = '';
            } else {
                this.setCustomValidity('');
            }
        });
    }
}

// ========== FORMULARIO DE RESERVAS ==========
function initReservationForm() {
    const form = document.getElementById('reservation-form');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validar formulario
        if (!form.checkValidity()) {
            e.stopPropagation();
            form.classList.add('was-validated');

            // Mostrar mensajes de error
            const invalidFields = form.querySelectorAll(':invalid');
            invalidFields.forEach(field => {
                field.classList.add('is-invalid');
            });

            return;
        }

        // Obtener datos del formulario
        const formData = {
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            servicio: document.getElementById('servicio').value,
            fecha: document.getElementById('fecha').value,
            horario: document.getElementById('horario').value,
            comentarios: document.getElementById('comentarios').value || 'Sin comentarios adicionales'
        };

        // Formatear fecha para mejor legibilidad
        const fechaObj = new Date(formData.fecha + 'T00:00:00');
        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const fechaFormateada = fechaObj.toLocaleDateString('es-AR', opciones);

        // Obtener nombre del servicio formateado
        const servicioNombre = getServiceName(formData.servicio);

        // Preparar template params para EmailJS
        const templateParams = {
            to_email: formData.email,              // Email del cliente
            cliente_nombre: formData.nombre,
            cliente_email: formData.email,
            cliente_telefono: formData.telefono,
            servicio: servicioNombre,
            fecha: fechaFormateada,
            horario: formData.horario,
            comentarios: formData.comentarios,
            // Estos parámetros son para el email que te llega a vos (dueño del negocio)
            admin_email: 'tucorreo@gmail.com'      // REEMPLAZAR con tu email
        };

        // Mostrar spinner
        const spinner = document.getElementById('spinner');
        const submitButton = form.querySelector('button[type="submit"]');
        const feedback = document.getElementById('form-feedback');

        spinner.classList.remove('hidden');
        submitButton.disabled = true;
        feedback.textContent = '';
        feedback.className = 'form-feedback';

        try {
            // Enviar email usando EmailJS
            const response = await emailjs.send(
                EMAILJS_CONFIG.serviceID,
                EMAILJS_CONFIG.templateID,
                templateParams
            );

            console.log('Email enviado con éxito:', response);

            // Mostrar mensaje de éxito
            feedback.textContent = `¡Reserva confirmada! Te enviamos un email de confirmación a ${formData.email}. Nos vemos el ${fechaFormateada} a las ${formData.horario}hs.`;
            feedback.classList.add('success');

            // Limpiar formulario
            form.reset();
            form.classList.remove('was-validated');

            // Scroll al mensaje de éxito
            feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        } catch (error) {
            console.error('Error al enviar email:', error);

            // Mostrar mensaje de error
            feedback.textContent = 'Hubo un error al procesar tu reserva. Por favor, contactanos directamente por WhatsApp o intentá nuevamente.';
            feedback.classList.add('error');
        } finally {
            // Ocultar spinner y rehabilitar botón
            spinner.classList.add('hidden');
            submitButton.disabled = false;
        }
    });

    // Validación en tiempo real
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.checkValidity()) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else {
                this.classList.add('is-invalid');
                this.classList.remove('is-valid');
            }
        });

        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid')) {
                if (this.checkValidity()) {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                }
            }
        });
    });
}

// Helper function para obtener nombre del servicio formateado
function getServiceName(servicioValue) {
    const servicios = {
        'masajes': 'Masajes',
        'fototerapia': 'Fototerapia',
        'hilos-colageno': 'Hilos de Colágeno',
        'dermapen': 'Dermapen'
    };
    return servicios[servicioValue] || servicioValue;
}

// ========== ANIMACIONES AL SCROLL ==========
function initAnimations() {
    // Observer para animaciones al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observar todos los elementos con clase animate
    const animatedElements = document.querySelectorAll('.service-card, .benefit-card, .about-content, .about-image');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ========== ACTUALIZAR AÑO EN FOOTER ==========
function updateCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// ========== HELPER FUNCTIONS ==========

// Función para validar email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Función para validar teléfono argentino
function isValidPhone(phone) {
    // Acepta formatos: 1112345678, 11-1234-5678, +54 11 1234 5678, etc.
    const re = /^(\+?54)?[-\s]?(\d{2,4})[-\s]?(\d{3,4})[-\s]?(\d{4})$/;
    return re.test(phone.replace(/\s+/g, ''));
}

// Log para debug
console.log('Küme Wellness - Sistema de reservas cargado correctamente');
console.log('Recuerda configurar tus credenciales de EmailJS en la variable EMAILJS_CONFIG');
