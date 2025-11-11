// ========== PULSE MARKETING - MAIN JS ==========

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
    initContactForm();
    initAOS();
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

// ========== FORMULARIO DE CONTACTO ==========
function initContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    const formMessage = document.getElementById('formMessage');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Verificar configuración de EmailJS
        if (EMAILJS_CONFIG.serviceID === 'TU_SERVICE_ID') {
            showMessage('error', '⚠️ EmailJS no está configurado. Por favor, actualiza las credenciales en js/main.js');
            return;
        }

        // Deshabilitar botón y mostrar spinner
        submitBtn.disabled = true;
        btnText.classList.add('d-none');
        btnSpinner.classList.remove('d-none');

        // Recopilar datos del formulario
        const formData = {
            nombre: document.getElementById('nombre').value,
            telefono: document.getElementById('telefono').value,
            email: document.getElementById('email').value,
            empresa: document.getElementById('empresa').value || 'No especificada',
            servicio: document.getElementById('servicio').value,
            mensaje: document.getElementById('mensaje').value,
            to_email: 'Mktberistainestudio@gmail.com'  // Email donde se recibirán las consultas
        };

        try {
            // Enviar email usando EmailJS
            const response = await emailjs.send(
                EMAILJS_CONFIG.serviceID,
                EMAILJS_CONFIG.templateID,
                formData
            );

            console.log('Email enviado exitosamente:', response);

            // Mostrar mensaje de éxito
            showMessage('success', '¡Mensaje enviado correctamente! Nos pondremos en contacto pronto.');

            // Limpiar formulario
            form.reset();

        } catch (error) {
            console.error('Error al enviar email:', error);
            showMessage('error', 'Hubo un error al enviar el mensaje. Por favor, intenta contactarnos por WhatsApp.');
        } finally {
            // Rehabilitar botón y ocultar spinner
            submitBtn.disabled = false;
            btnText.classList.remove('d-none');
            btnSpinner.classList.add('d-none');
        }
    });

    function showMessage(type, text) {
        formMessage.className = 'alert mt-3';
        formMessage.classList.add(type === 'success' ? 'alert-success' : 'alert-danger');
        formMessage.textContent = text;
        formMessage.classList.remove('d-none');

        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
            formMessage.classList.add('d-none');
        }, 5000);

        // Scroll al mensaje
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// ========== AOS (ANIMACIONES ON SCROLL) ==========
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    }
}

// ========== AÑO ACTUAL EN FOOTER ==========
function updateCurrentYear() {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// ========== VALIDACIÓN DE TELÉFONO ==========
document.getElementById('telefono')?.addEventListener('input', function(e) {
    // Permitir solo números y algunos caracteres especiales
    this.value = this.value.replace(/[^0-9+\-() ]/g, '');
});

// ========== LOADING DE IMÁGENES ==========
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
});

// ========== UTILIDADES ==========

// Detectar si el usuario está en móvil
function isMobile() {
    return window.innerWidth <= 768;
}

// Scroll to top suave
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Log de eventos de conversión (para Google Analytics o similar)
function logConversion(eventName, eventParams = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventParams);
        console.log('Conversión registrada:', eventName, eventParams);
    }
}

// Ejemplo de uso: logConversion('formulario_enviado', { servicio: 'Community Manager' });
