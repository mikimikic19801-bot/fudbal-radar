const cacheName = 'fudbal-radar-v3';
const assets = [
  './',
  'index.html',
  'manifest.json'
];

// Instalacija keša i čuvanje osnovnih fajlova za offline rad
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
  self.skipWaiting();
});

// Aktivacija i čišćenje starih verzija keša radi oslobađanja memorije
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== cacheName) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Strategija: Mreža ima prioritet (jer nam trebaju živi rezultati), a keš je tu kao rezerva
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// Kada klikneš na notifikaciju na telefonu, ovaj kod otvara aplikaciju i stavlja je u prvi plan
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
            break;
          }
        }
        return client.focus();
      }
      return clients.openWindow('./');
    })
  );
});
