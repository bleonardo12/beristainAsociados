import { DEFAULT_CONFIG, createNavbarAPI } from './config.js';

export function initNavbar(options = {}) {
    try {
        const config = { ...DEFAULT_CONFIG, ...options };
        const navbar = document.querySelector('nav.navbar');
        if (!navbar) return;

        // Lógica de Scroll (Cambia el estilo al bajar)
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        });

        // Lógica de Menú (Cierre al hacer click en un link)
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        const collapse = document.querySelector('.navbar-collapse');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (collapse.classList.contains('show')) {
                    const bsCollapse = new bootstrap.Collapse(collapse);
                    bsCollapse.hide();
                }
            });
        });

        return createNavbarAPI();
    } catch (error) {
        console.error('[Navbar] Error:', error);
    }
}