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

  self.addEventListener('push', event => {
    if (!event.data) return;
  
    const data = event.data.json();
  
    const options = {
      body: data.body,
      icon: '/icons/icon-96.webp',
      badge: '/icons/icon-96.webp',
      vibrate: [700, 200, 700, 200, 700],
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'Zobrazit' },
        { action: 'dismiss', title: 'Zavřít' }
      ],
      data: {
        url: data.url || '/'
      }
    };
  
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  });

  self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    const urlToOpen = event.notification.data?.url ?? '/';
    event.waitUntil(clients.openWindow(urlToOpen));
  });