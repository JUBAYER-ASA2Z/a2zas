self.addEventListener('install', () => {
  self.skipWaiting();
});
self.addEventListener('activate', () => {
  self.registration.unregister();
  caches.keys().then(keys => {
    keys.forEach(key => caches.delete(key));
  });
  self.clients.matchAll().then(clients => {
    clients.forEach(client => client.navigate(client.url));
  });
});
