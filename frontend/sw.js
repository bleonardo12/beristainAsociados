// Service worker desactivado (kill-switch).
// El sitio nuevo no registra service worker. Este archivo existe sólo para que los
// navegadores que tienen registrado el SW anterior ('beristain-v1') borren sus cachés
// y se desregistren, y así no sigan viendo el sitio viejo desde caché.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        await self.registration.unregister();
        const clients = await self.clients.matchAll({ type: 'window' });
        clients.forEach(c => c.navigate(c.url));
    })());
});
