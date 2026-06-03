export const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};
export const registerObserver = (obs) => { /* lógica de registro */ };
export const warn = (msg) => console.warn(msg);