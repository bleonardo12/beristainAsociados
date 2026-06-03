import { DEFAULT_CONFIG } from './config.js';

const DARK_CLASS = 'dark-theme';
const STORAGE_KEY = 'theme-preference';

export function initThemeSystem() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const applyTheme = (isDark) => {
        document.documentElement.classList.toggle(DARK_CLASS, isDark);
        localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
    };

    // Carga inicial
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme === 'dark') {
        applyTheme(true);
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains(DARK_CLASS);
        applyTheme(!isDark);
        console.log(`[Theme] Cambiado a: ${!isDark ? 'dark' : 'light'}`);
    });
}