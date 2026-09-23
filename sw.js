// Service worker de Prime OS: guarda la app en el dispositivo para abrirla y usarla sin internet.
// Al publicar una versión nueva, sube CACHE_VERSION (debe coincidir con APP_VERSION en js/config.js).
const CACHE_VERSION = "9.0";
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
  "data/v9/manifest.json",
  "data/v9/routine3_1.json",
  "data/v9/routine3_2.json",
  "data/v9/routine3_3.json",
  "data/v9/routine3_4.json",
  "data/v9/routine3_5.json",
  "data/v9/routine3_6.json",
  "data/v9/routine3_7.json",
  "data/v9/routine3_8.json",
  "data/v9/routine3_9.json",
  "data/v9/routine3_10.json",
  "data/v9/routine3_11.json",
  "data/v9/routine3_12.json",
  "data/v9/routine4_1.json",
  "data/v9/routine4_2.json",
  "data/v9/routine4_3.json",
  "data/v9/routine4_4.json",
  "data/v9/routine4_5.json",
  "data/v9/routine4_6.json",
  "data/v9/routine4_7.json",
  "data/v9/routine4_8.json",
  "data/v9/routine4_9.json",
  "data/v9/routine4_10.json",
  "data/v9/routine4_11.json",
  "data/v9/routine4_12.json",
  "data/v9/adaptiveFullBody_1.json",
  "data/v9/adaptiveFullBody_2.json",
  "data/v9/adaptiveFullBody_3.json",
  "data/v9/adaptiveFullBody_4.json",
  "data/v9/adaptiveFullBody_5.json",
  "data/v9/adaptiveFullBody_6.json",
  "data/v9/adaptiveFullBody_7.json",
  "data/v9/adaptiveFullBody_8.json",
  "data/v9/adaptiveFullBody_9.json",
  "data/v9/adaptiveFullBody_10.json",
  "data/v9/adaptiveFullBody_11.json",
  "data/v9/adaptiveFullBody_12.json",
  "js/config.js",
  "js/util.js",
  "js/domain.js",
  "js/state.js",
  "js/training.js",
  "js/timer.js",
  "js/views.js",
  "js/io.js",
  "js/app.js",
  "vendor/chart.umd.js",
  "vendor/xlsx.full.min.js"
];

// La versión nueva se activa sola apenas se descarga (la app recarga una vez para no mezclar versiones).
self.addEventListener("install", event => {
  // CSS, JS y JSON se guardan con el mismo ?v= que pide la página.
  const urls = ASSETS.map(a => /\.(css|js|json)$/.test(a) && a !== "manifest.json" ? `${a}?v=${CACHE_VERSION}` : a);
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urls)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("prime-os-") && k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
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

  // Archivos: la copia exacta (con su ?v=) de la caché de esta versión; si no está, la red.
  // Sin conexión y sin copia exacta, se usa la copia de cualquier versión como último recurso.
  event.respondWith(
    caches.open(CACHE_NAME)
      .then(cache => cache.match(req).then(hit => hit || fetch(req).then(res => {
        if(res.ok) cache.put(req, res.clone());
        return res;
      })))
      .catch(() => caches.match(req, {ignoreSearch: true}))
  );
});
