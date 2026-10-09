const CACHE_NAME = "asa2z-v4-offline-fixed";
const BASE = "/a2zas";
const FILES_TO_CACHE = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/manifest.json`,
  `${BASE}/icon-192.png`,
  `${BASE}/icon-512.png`,
  `${BASE}/islamic.html`,
  `${BASE}/naam.html`,
  `${BASE}/event.html`,
  `${BASE}/science_quiz.html`,
  `${BASE}/medical_final.html`,
  `${BASE}/calc.html`,
  `${BASE}/360.html`,
  `${BASE}/shop.html`,
  `${BASE}/volume_control.html`,
  `${BASE}/number.html`,
  `${BASE}/support.html`,
  `${BASE}/group-chat.html`,
  `${BASE}/notebook.html`
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE).catch(err => console.log("Cache fail", err));
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Google Script, ipapi, unsplash - এগুলো Cache করবে না, সরাসরি নেট থেকে আনবে
  if (url.hostname.includes("script.google.com") || url.hostname.includes("ipapi.co") || url.hostname.includes("images.unsplash.com")) {
    return;
  }

  // HTML পেজের জন্য: Network First, না পেলে Cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(`${BASE}/index.html`))
    );
    return;
  }

  // বাকি সব (CSS, JS, Image) এর জন্য: Cache First
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request).then((res) => {
        // নতুন ফাইল Cache এ Save করে রাখা
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, res.clone());
          return res;
        });
      }).catch(() => {
        // একদম অফলাইনে কিছু না পেলে
        if (request.destination === 'image') {
          return caches.match(`${BASE}/icon-192.png`);
        }
      });
    })
  );
});
