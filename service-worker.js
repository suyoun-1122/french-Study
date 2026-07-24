const CACHE = "yeonjae-french-v4-6-0";
const VERSION = "4.6.0";
const CORE = [
  "./", "./index.html", "./manifest.webmanifest",
  `./app.js?v=${VERSION}`, "./audio.js", "./review.js",
  `./data/words.json?v=${VERSION}`,
  `./data/lessons.json?v=${VERSION}`,
  `./data/recipes.json?v=${VERSION}`,
  "./assets/icons/icon-192.png", "./assets/icons/icon-512.png", "./assets/icons/icon-maskable-512.png",
  "./assets/characters/petit-vector.svg", "./assets/characters/fromage-vector.svg", "./assets/characters/lavande-vector.svg", "./assets/characters/trio-vector.svg",
  "./assets/characters/petit-happy.svg", "./assets/characters/petit-think.svg",
  "./assets/characters/fromage-happy.svg", "./assets/characters/fromage-think.svg",
  "./assets/characters/lavande-happy.svg", "./assets/characters/lavande-think.svg",
  "./assets/foods/recipes/croissant.svg", "./assets/foods/recipes/baguette.svg", "./assets/foods/recipes/crepe.svg",
  "./assets/foods/recipes/madeleine.svg", "./assets/foods/recipes/macaron.svg", "./assets/foods/recipes/quiche.svg",
  "./assets/foods/recipes/croquemonsieur.svg", "./assets/foods/recipes/ratatouille.svg", "./assets/foods/recipes/gratin.svg",
  "./assets/foods/recipes/soupe.svg", "./assets/foods/recipes/boeuf.svg", "./assets/foods/recipes/coq.svg",
  "./assets/foods/recipes/cassoulet.svg", "./assets/foods/recipes/bouillabaisse.svg", "./assets/foods/recipes/tarte.svg"
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isNavigation = event.request.mode === "navigate";
  const isFreshAsset =
    url.pathname.endsWith("index.html") ||
    url.pathname.endsWith("app.js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.includes("/data/") ||
    url.pathname.endsWith("manifest.webmanifest");

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) caches.open(CACHE).then(cache => cache.put("./index.html", response.clone()));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  if (isFreshAsset) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
      return response;
    }))
  );
});
