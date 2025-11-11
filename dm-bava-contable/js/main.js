// ========== DM BAVA ESTUDIO CONTABLE - MAIN JS ==========

// Configuración de EmailJS
// IMPORTANTE: Reemplaza estos valores con tus credenciales de EmailJS
// Tutorial completo en README.md
const EMAILJS_CONFIG = {
    serviceID: 'TU_SERVICE_ID',      // Reemplazar con tu Service ID de EmailJS
    templateID: 'TU_TEMPLATE_ID',    // Reemplazar con tu Template ID de EmailJS
    publicKey: 'TU_PUBLIC_KEY'       // Reemplazar con tu Public Key de EmailJS
};

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_CONFIG.publicKey);
        console.log('✓ EmailJS inicializado correctamente');
    } else {
        console.error('✗ EmailJS no está cargado. Verifica que el script esté en el HTML.');
    }

    // Inicializar componentes
    initNavbar();
    initSmoothScroll();
    initContactForm();
    initAnimations();

    console.log('✓ DM Bava Estudio Contable - Sitio cargado exitosamente');
});

// ========== NAVBAR SCROLL EFFECT ==========
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    // Efecto de scroll en navbar
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active link según sección visible
        updateActiveLink();
    });

    // Cerrar menú móvil al hacer clic en un link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse.classList.contains('show')) {
                const navbarToggler = document.querySelector('.navbar-toggler');
                navbarToggler.click();
            }
        });
    });
}

// Actualizar link activo según la sección visible
function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            if (navLink) {
                navLink.classList.add('active');
            }
        }
    });
}

// ========== SMOOTH SCROLL ==========
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Verificar que no sea solo "#" y que el elemento exista
            if (href !== '#' && href.length > 1) {
                const target = document.querySelector(href);

                if (target) {
                    e.preventDefault();

                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = target.offsetTop - navbarHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ========== FORMULARIO DE CONTACTO ==========
function initContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');
    const formMessage = document.getElementById('formMessage');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Validar que EmailJS esté configurado
            if (EMAILJS_CONFIG.serviceID === 'TU_SERVICE_ID' ||
                EMAILJS_CONFIG.templateID === 'TU_TEMPLATE_ID' ||
                EMAILJS_CONFIG.publicKey === 'TU_PUBLIC_KEY') {

                showMessage('Por favor, configura EmailJS en el archivo js/main.js. Consulta README.md para instrucciones.', 'danger');
                return;
            }

            // Deshabilitar botón y mostrar loader
            submitBtn.disabled = true;
            btnText.classList.add('d-none');
            btnLoader.classList.remove('d-none');
            formMessage.innerHTML = '';
            formMessage.className = '';

            // Enviar email con EmailJS
            emailjs.sendForm(
                EMAILJS_CONFIG.serviceID,
                EMAILJS_CONFIG.templateID,
                form
            )
            .then(function(response) {
                console.log('✓ Email enviado exitosamente:', response);

                // Mensaje de éxito
                showMessage('¡Gracias por contactarme! Responderé tu consulta a la brevedad.', 'success');

                // Limpiar formulario
                form.reset();

                // Redireccionar a WhatsApp (opcional)
                setTimeout(() => {
                    const whatsappMsg = encodeURIComponent('Hola Daniela, acabo de enviar una consulta por el formulario web.');
                    window.open(`https://wa.me/5491128276362?text=${whatsappMsg}`, '_blank');
                }, 2000);

            })
            .catch(function(error) {
                console.error('✗ Error al enviar email:', error);
                showMessage('Hubo un error al enviar tu consulta. Por favor, intenta contactarme por WhatsApp.', 'danger');
            })
            .finally(function() {
                // Rehabilitar botón
                submitBtn.disabled = false;
                btnText.classList.remove('d-none');
                btnLoader.classList.add('d-none');
            });
        });
    }
}

// Mostrar mensaje de respuesta del formulario
function showMessage(message, type) {
    const formMessage = document.getElementById('formMessage');
    formMessage.innerHTML = `
        <div class="alert alert-${type}" role="alert">
            <i class="bi bi-${type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'} me-2"></i>
            ${message}
        </div>
    `;

    // Scroll suave al mensaje
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Auto-ocultar después de 8 segundos
    if (type === 'success') {
        setTimeout(() => {
            formMessage.innerHTML = '';
        }, 8000);
    }
}

// ========== ANIMACIONES ==========
function initAnimations() {
    // Intersection Observer para animaciones al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observar elementos para animar
    const animateElements = document.querySelectorAll('.service-card, .client-type-card, .contact-item');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// ========== UTILIDADES ==========

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validar teléfono argentino
function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]{8,}$/;
    return phoneRegex.test(phone);
}

// Logs informativos
console.log('%c DM Bava Estudio Contable ', 'background: #D4919F; color: white; font-size: 16px; font-weight: bold; padding: 10px;');
console.log('%c Desarrollado con ❤️ para profesionales contables ', 'color: #8B5A7A; font-size: 12px;');
console.log('%c Si necesitas ayuda con EmailJS, consulta el README.md ', 'color: #4A3642; font-size: 11px;');
