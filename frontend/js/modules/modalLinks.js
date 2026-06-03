// modules/modalLinks.js
const enhanceLinkAccessibility = (element) => {
    element.setAttribute('role', 'button');
    element.setAttribute('tabindex', '0');
};

export function initModalLinks() {
    try {
        const links = document.querySelectorAll('[data-bs-toggle="modal"]');
        links.forEach(link => {
            enhanceLinkAccessibility(link);
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                }
            });
        });
    } catch (error) {
        console.error('Error al inicializar enlaces de modal:', error);
    }
}