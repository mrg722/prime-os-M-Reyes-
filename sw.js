// Service worker de Prime OS: guarda la app en el dispositivo para abrirla y usarla sin internet.
// Al publicar una versión nueva, sube CACHE_VERSION (debe coincidir con APP_VERSION en js/config.js).
const CACHE_VERSION = "8.0";
const CACHE_NAME = `prime-os-${CACHE_VERSION}`;

const ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "manifest.json",
  "icon.svg",
  "icon-192.png",
  "icon-512.png",
  "Plantilla_Prime_OS_V7.xlsx",
  "data/plan.json",
  "js/config.js",
  "js/util.js",
  "js/domain.js",
  "js/state.js",
  "js/training.js",
  "js/views.js",
  "js/io.js",
  "js/app.js",
  "vendor/chart.umd.js",
  "vendor/xlsx.full.min.js"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("prime-os-") && k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if(event.data === "skipWaiting") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if(req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  // Páginas: primero la red (para ver cambios); sin conexión o con señal lenta (>3 s), la copia guardada.
  if(req.mode === "navigate"){
    const cached = () => caches.match("index.html", {ignoreSearch: true});
    const net = fetch(req);
    const timeout = new Promise(resolve => setTimeout(resolve, 3000)).then(cached);
    event.respondWith(
      Promise.race([net, timeout])
        .then(res => res || net)
        .catch(() => cached().then(hit => hit || net))
    );
    return;
  }

  // Archivos: copia guardada de esta versión; si falta, red y se guarda.
  event.respondWith(
    caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).then(res => {
      if(res.ok){
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      }
      return res;
    }))
  );
});
