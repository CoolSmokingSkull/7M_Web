const CACHE_NAME = '7m-studios-cache-v3';
const URLS_TO_CACHE = [
  'index.html',
  'pwas.html',
  'toolbox.html',
  'forum.html',
  'blog.html',
  'style.css',
  'script.js',
  'manifest.json',
  'icons/ship.png',
  'icons/shoot.png',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(response=>response||fetch(event.request))
  );
});
