/*
   Obsition service worker — network-first, cache as an offline fallback
   only. This is deliberate: an earlier version of this app once got
   stuck showing a stale cached copy no matter how many times it was
   redeployed, which was a real, hard-to-diagnose problem. A service
   worker that prefers its own cache over the network would risk causing
   that exact failure mode again. So the rule here is strict — while
   there is any network connectivity, the live server always wins; the
   cache is only ever read when a fetch genuinely fails (offline).
*/

var CACHE_NAME = "obsition-cache-v1";

self.addEventListener("install", function (event) {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
            .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;

  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request).then(function (networkResponse) {
      var copy = networkResponse.clone();
      caches.open(CACHE_NAME).then(function (cache) { cache.put(request, copy); });
      return networkResponse;
    }).catch(function () {
      return caches.match(request).then(function (cached) {
        return cached || caches.match("./index.html");
      });
    })
  );
});
