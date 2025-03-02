// 1. Función para el Navbar
function setupNavbar() {
    const navbar = document.querySelector('nav.navbar');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// 2. Función para el Slider-area (carrusel de imágenes)
function setupSliderArea() {
    const slides = document.querySelectorAll('.slider-area .single-slider');
    const prevButton = document.createElement('button');
    const nextButton = document.createElement('button');
    let currentSlide = 0;

    // Agrega los controles al DOM
    const sliderControls = document.createElement('div');
    sliderControls.classList.add('slider-controls');
    sliderControls.appendChild(prevButton);
    sliderControls.appendChild(nextButton);
    document.querySelector('.slider-area').appendChild(sliderControls);

    // Configura los botones
    prevButton.innerHTML = '&#10094;'; // Ícono de flecha izquierda
    nextButton.innerHTML = '&#10095;'; // Ícono de flecha derecha

    // Función para mostrar un slide específico
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active'); // Oculta todos los slides
            if (i === index) {
                slide.classList.add('active'); // Muestra el slide activo
            }
        });
    }

    // Función para avanzar al siguiente slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    // Función para retroceder al slide anterior
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    // Event listeners para los controles
    prevButton.addEventListener('click', prevSlide);
    nextButton.addEventListener('click', nextSlide);

    // Muestra el primer slide al cargar la página
    showSlide(currentSlide);
}

// 3. Función para la Sección de Comentarios (carrusel de grupos de 3)
function setupComentariosCarrusel() {
    const grupos = document.querySelectorAll('.comentarios-group');
    const prevButton = document.createElement('button');
    const nextButton = document.createElement('button');
    let currentGroup = 0;

    // Agrega los controles al DOM
    const comentariosControls = document.createElement('div');
    comentariosControls.classList.add('comentarios-controls');
    comentariosControls.appendChild(prevButton);
    comentariosControls.appendChild(nextButton);
    document.querySelector('.comentarios-section').appendChild(comentariosControls);

    // Configura los botones
    prevButton.innerHTML = '&#10094;'; // Ícono de flecha izquierda
    nextButton.innerHTML = '&#10095;'; // Ícono de flecha derecha

    // Función para mostrar un grupo específico
    function showGroup(index) {
        grupos.forEach((grupo, i) => {
            grupo.classList.remove('active'); // Oculta todos los grupos
            if (i === index) {
                grupo.classList.add('active'); // Muestra el grupo activo
            }
        });
    }

    // Función para avanzar al siguiente grupo
    function nextGroup() {
        currentGroup = (currentGroup + 1) % grupos.length;
        showGroup(currentGroup);
    }

    // Función para retroceder al grupo anterior
    function prevGroup() {
        currentGroup = (currentGroup - 1 + grupos.length) % grupos.length;
        showGroup(currentGroup);
    }

    // Event listeners para los controles
    prevButton.addEventListener('click', prevGroup);
    nextButton.addEventListener('click', nextGroup);

    // Muestra el primer grupo al cargar la página
    showGroup(currentGroup);
}

// Inicializar todas las funcionalidades cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    setupNavbar(); // Configura el Navbar
    setupSliderArea(); // Configura el Slider-area
    setupComentariosCarrusel(); // Configura la sección de comentarios
});