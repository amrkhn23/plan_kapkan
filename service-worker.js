self.addEventListener('install', event => {
  console.log('Service worker установлен');
});

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});