const CACHE_NAME = "a-s-a2z-final-v12";
const FILES_TO_CACHE = [
  "/a2zas/",
  "/a2zas/index.html",
  "/a2zas/memo.html",
  "/a2zas/islamic.html",
  "/a2zas/event.html",
  "/a2zas/manifest.json",
  "/a2zas/icon-192.png",
  "/a2zas/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching A-S A2Z v12");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("script.google.com")) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});
