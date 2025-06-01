self.addEventListener("install", () => {
  console.log("Service Worker installing.");
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  console.log("Service Worker activating.");
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith("/socket.io/")) {
    return;
  }

  event.respondWith(fetch(event.request));
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (err) {
    console.error("Push data is not valid JSON", err);
    data = {
      title: "Nová notifikace",
      body: event.data.text(),
    };
  }

  const options = {
    body: data.body,
    icon: "/icons/icon-96.webp",
    badge: "/icons/icon-96.webp",
    vibrate: [700, 200, 700, 200, 700],
    requireInteraction: true,
    actions: [
      { action: "view", title: "Zobrazit" },
      { action: "dismiss", title: "Zavřít" },
    ],
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url ?? "/";
  event.waitUntil(clients.openWindow(urlToOpen));
});
