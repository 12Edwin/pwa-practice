const CACHE_NAME = 'todo-app-v1';
const urlsToCache = [
    '/pwa-practice/',
    '/pwa-practice/index.html',
    '/pwa-practice/style.css',
    '/pwa-practice/app.js',
    '/pwa-practice/icon.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .catch(error => console.error("Error al abrir cache:", error))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});