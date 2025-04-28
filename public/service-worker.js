self.addEventListener('install', () => {
    console.log('Service Worker installing.');
    self.skipWaiting();
  });
  
  self.addEventListener('activate', () => {
    console.log('Service Worker activating.');
  });
  
  self.addEventListener('fetch', event => {
    event.respondWith(fetch(event.request));
  });