/* Cross-origin isolation for GitHub Pages.
   SharedArrayBuffer (needed so the Python worker can pause for input() and be stopped cleanly)
   is only available on pages served with COOP/COEP headers. GitHub Pages cannot set headers,
   so this service worker adds them to every response for this folder. First visit: the page
   registers the worker and reloads once; after that it is transparent.
   Same-origin embeds (the Computing Hub tools) are unaffected. Cross-origin scripts are loaded
   with CORS (the CDN sends Access-Control-Allow-Origin: *). */
if (typeof window === 'undefined') {
  // ---- service worker context ----
  self.addEventListener('install', function () { self.skipWaiting(); });
  self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
  self.addEventListener('fetch', function (e) {
    var req = e.request;
    if (req.cache === 'only-if-cached' && req.mode !== 'same-origin') return;
    e.respondWith(fetch(req).then(function (res) {
      if (res.status === 0) return res;
      var h = new Headers(res.headers);
      h.set('Cross-Origin-Embedder-Policy', 'credentialless');
      h.set('Cross-Origin-Opener-Policy', 'same-origin');
      h.set('Cross-Origin-Resource-Policy', 'cross-origin');
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
    }).catch(function () { return fetch(req); }));
  });
} else {
  // ---- page context: register once, reload once ----
  (function () {
    if (window.crossOriginIsolated || !('serviceWorker' in navigator)) return;
    if (!window.isSecureContext) return;
    var key = 'coi-reloaded';
    navigator.serviceWorker.register(document.currentScript.src, { scope: document.currentScript.src.replace(/[^\/]*$/, '') })
      .then(function (reg) {
        if (reg.active && !navigator.serviceWorker.controller) {
          // registered but not yet controlling this page: reload once to pick up the headers
          if (!sessionStorage.getItem(key)) { sessionStorage.setItem(key, '1'); location.reload(); }
        }
        reg.addEventListener('updatefound', function () {
          var w = reg.installing;
          w && w.addEventListener('statechange', function () {
            if (w.state === 'activated' && !navigator.serviceWorker.controller && !sessionStorage.getItem(key)) { sessionStorage.setItem(key, '1'); location.reload(); }
          });
        });
      })
      .catch(function () { /* no isolation: the runner falls back to main-thread mode */ });
    navigator.serviceWorker.ready.then(function () {
      if (!window.crossOriginIsolated && !sessionStorage.getItem(key)) { sessionStorage.setItem(key, '1'); location.reload(); }
    });
  })();
}
