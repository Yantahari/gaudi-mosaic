// =====================================================
// GAUDÍ MOSAIC — Service Worker
// Estratègia cache-first per funcionar offline
// =====================================================

const CACHE_NAME = 'gaudi-mosaic-v2';

// Assets essencials per funcionar offline
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',

  // Estils
  '/css/styles.css',
  '/css/splash.css',
  '/css/panels.css',
  '/css/modals.css',

  // JavaScript — entrada
  '/js/app.js',
  '/js/state.js',

  // Engine
  '/js/engine/canvas.js',
  '/js/engine/ceramics.js',
  '/js/engine/fracture.js',

  // UI
  '/js/ui/splash.js',
  '/js/ui/panels.js',
  '/js/ui/toolbar.js',
  '/js/ui/breakzone.js',
  '/js/ui/modals.js',
  '/js/ui/tutorial.js',
  '/js/ui/guided.js',

  // Dades
  '/js/data/palettes.js',
  '/js/data/templates.js',
  '/js/data/content.js',
  '/js/data/textures.js',

  // Utilitats
  '/js/utils/export.js',
  '/js/utils/storage.js',
  '/js/utils/helpers.js',

  // i18n
  '/js/i18n/i18n.js',
  '/js/i18n/ca.js',
  '/js/i18n/en.js',
  '/js/i18n/es.js',
  '/js/i18n/ja.js',

  // Icones
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/apple-touch-icon.png',
  '/assets/og-image.png'
];

// Textures — es cachegen quan l'usuari les demana (lazy)
const TEXTURE_PATTERN = /\/assets\/textures\//;

// Google Fonts — stale-while-revalidate
const FONT_PATTERN = /fonts\.(googleapis|gstatic)\.com/;

// ---- Instal·lació: cachegem els assets essencials ----
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ---- Activació: netegem caches antigues ----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// ---- Intercepció de peticions ----
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Fonts de Google: stale-while-revalidate
  if (FONT_PATTERN.test(url.href)) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // Textures: cache-first, guardar al primer accés
  if (TEXTURE_PATTERN.test(url.pathname)) {
    event.respondWith(cacheFirstLazy(event.request));
    return;
  }

  // Tot el reste: cache-first (assets ja pre-cachejats)
  event.respondWith(cacheFirst(event.request));
});

// ---- Estratègies de cache ----

// Cache-first: servir del cache, si no hi és anar a xarxa
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    // Guardar al cache si és una resposta vàlida del nostre domini
    if (response.ok && response.type === 'basic') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline i no al cache: retornar la pàgina principal
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    return new Response('Offline', { status: 503 });
  }
}

// Cache-first lazy: com cache-first, però guarda textures al primer ús
async function cacheFirstLazy(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 404 });
  }
}

// Stale-while-revalidate: servir del cache i actualitzar en segon pla
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}
