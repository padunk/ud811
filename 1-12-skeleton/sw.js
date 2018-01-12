var cacheName = 'weatherPWA-v1';
var swFiles = [
  'index.html',
  '/styles/ud811.css',
  '/scripts/app.js',
  '/scripts/localforage.js',
  '/images/clear.png',
  '/images/clody.png',
  '/images/fog.png',
  '/images/rain.png',
  '/images/snow.png',
  '/images/thunderstorm.png',
];

self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(cacheName)
    .then(function(cache){
      return cache.addAll(swFiles);
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys()
    .then(function(key) {
      return Promise.all(key.map(function(k) {
        if(k !== cacheName) {
          return caches.delete(k);
        }
      }));
    })
  );
});

self.addEventListener("fetch", function(e) {
  e.respondWith(
    caches.match(e.request)
    .then(function(response) {
      return response || fetch(e.request).then(function(resp) {
        return caches.open(cacheName)
        .then(function(cache) {
          cache.put(e.request, resp.clone());
          return resp;
        })
      })
      .catch(function(err) {
        return err;
      })
    })
  );
});