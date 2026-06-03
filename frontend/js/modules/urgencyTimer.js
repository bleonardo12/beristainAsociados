export function initUrgencyTimer() {
    const el = document.getElementById('urgency-timer');
    if (!el) return;

    function update() {
        const now      = new Date();
        const response = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const h        = response.getHours().toString().padStart(2, '0');
        const m        = response.getMinutes().toString().padStart(2, '0');
        const cuando   = response.toDateString() === now.toDateString()
            ? `hoy a las ${h}:${m}hs`
            : `mañana a las ${h}:${m}hs`;

        el.innerHTML =
            `<i class="bi bi-clock-fill timer-icon"></i>` +
            `<span class="timer-label">Próxima respuesta:</span> ` +
            `<span class="timer-time">${cuando}</span>`;
    }

    update();
    setInterval(update, 60_000); // actualizar cada minuto
}
