var cacheName = 'weatherPWA-v2';
var dataCacheName = 'weatherData-v2';
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

var weatherAPIUrlBase = 'http://api.openweathermap.org/';

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
        if(k !== cacheName && k !== dataCacheName) {
          return caches.delete(k);
        }
      }));
    })
  );
});

self.addEventListener("fetch", function(e) {
  if (e.request.url.startsWith(weatherAPIUrlBase)) {
    e.respondWith(
      fetch(e.request)
      .then(function(response) {
        return caches.open(dataCacheName)
        .then(function(cache) {
          cache.put(e.request.url, response.clone());
          return response;
        })
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request)
      .then(function(response) {
        return response || fetch(e.request);
      })
    );
  }

});