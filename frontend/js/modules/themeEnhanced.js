import { DEFAULT_CONFIG } from './config.js';

const DARK_CLASS = 'dark-theme';
const STORAGE_KEY = 'theme-preference';

export function initThemeSystem() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) {
        console.warn('[Theme] Botón #theme-toggle no encontrado en el DOM.');
        return;
    }

    // Carga el estado guardado
    if (localStorage.getItem(STORAGE_KEY) === 'dark') {
        document.documentElement.classList.add(DARK_CLASS);
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle(DARK_CLASS);
        localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
    });
}