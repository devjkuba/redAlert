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

  self.addEventListener("push", (event) => {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "icons/icon-96.webp",
      sound: "mp3/siren.mp3", 
      vibrate: [700, 200, 700, 200, 700] 
    });
  });