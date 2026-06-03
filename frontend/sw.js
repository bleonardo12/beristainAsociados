const CACHE = 'beristain-v1';
const PRECACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/overrides.css',
    '/img/logonuevoB.webp',
    '/img/logonuevoB.jpg',
    '/img/prisionero.webp',
    '/img/linea-de-sucesion.webp',
    '/img/house-door.svg',
    '/img/car-front.svg'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => k !== CACHE).map(k => caches.delete(k))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);

    // Solo cachear GET de mismo origen
    if (e.request.method !== 'GET' || url.origin !== location.origin) return;

    // HTML: network-first (siempre contenido fresco)
    if (e.request.headers.get('accept')?.includes('text/html')) {
        e.respondWith(
            fetch(e.request)
                .then(r => { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); return r; })
                .catch(() => caches.match(e.request) || caches.match('/index.html'))
        );
        return;
    }

    // Assets (CSS, JS, imágenes): cache-first
    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;
            return fetch(e.request).then(r => {
                const c = r.clone();
                caches.open(CACHE).then(ca => ca.put(e.request, c));
                return r;
            });
        })
    );
});
