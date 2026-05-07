// =====================================================
// GAUDÍ MOSAIC — Service Worker
// Estratègia cache-first per funcionar offline
// =====================================================

// Caches separades per propòsit: bumpear codi NO invalida textures (~80 MB).
//   - CODE_CACHE: HTML, CSS, JS, manifest, icones, og-image (bumpea sovint)
//   - TEXTURE_CACHE: rajoles ceràmiques (~80 MB, bumpea molt rarament)
//   - FONT_CACHE: Google Fonts (extern, stale-while-revalidate)
const CODE_CACHE = 'gm-code-v8';
const TEXTURE_CACHE = 'gm-textures-v1';
const FONT_CACHE = 'gm-fonts-v1';
const KEEP_CACHES = new Set([CODE_CACHE, TEXTURE_CACHE, FONT_CACHE]);

// Compatibilitat enrere amb el codi que encara fa servir CACHE_NAME
const CACHE_NAME = CODE_CACHE;

// Assets essencials per funcionar offline.
// Paths relatius a la ubicació del SW (arrel del site).
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',

  // Estils
  './css/styles.css',
  './css/splash.css',
  './css/panels.css',
  './css/modals.css',

  // JavaScript — entrada
  './js/app.js',
  './js/state.js',

  // Engine
  './js/engine/canvas.js',
  './js/engine/ceramics.js',
  './js/engine/fracture.js',

  // UI
  './js/ui/splash.js',
  './js/ui/panels.js',
  './js/ui/toolbar.js',
  './js/ui/breakzone.js',
  './js/ui/modals.js',
  './js/ui/tutorial.js',

  // Dades
  './js/data/palettes.js',
  './js/data/templates.js',
  './js/data/content.js',
  './js/data/textures.js',

  // Utilitats
  './js/utils/export.js',
  './js/utils/storage.js',
  './js/utils/helpers.js',
  './js/utils/premium.js',

  // i18n
  './js/i18n/i18n.js',
  './js/i18n/ca.js',
  './js/i18n/en.js',
  './js/i18n/es.js',
  './js/i18n/ja.js',

  // Icones
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/og-image.png'
];

// Textures — es cachegen quan l'usuari les demana (lazy)
const TEXTURE_PATTERN = /\/assets\/textures\//;

// Google Fonts — stale-while-revalidate
const FONT_PATTERN = /fonts\.(googleapis|gstatic)\.com/;

// ---- Instal·lació: cachegem els assets essencials ----
// Nota: NO fem servir cache.addAll() perquè és atòmic —
// si un sol asset falla (404, redirect, timeout), tota la instal·lació falla.
// En lloc d'això, cachegem cada asset individualment i ignorem els que fallin.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        CORE_ASSETS.map(url =>
          cache.add(url).catch(err => {
            console.warn(`[SW] No s'ha pogut cachejar: ${url}`, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// ---- Activació: netegem caches antigues, conservem les que volem ----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => !KEEP_CACHES.has(key))
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// ---- Intercepció de peticions ----
self.addEventListener('fetch', (event) => {
  // Ignorar peticions no-HTTP (chrome-extension://, etc.)
  if (!event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);

  // Google Analytics / GTM: deixar passar sense interceptar
  if (url.hostname.includes('googletagmanager.com') || url.hostname.includes('google-analytics.com')) {
    return;
  }

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
      return caches.match('./index.html');
    }
    return new Response('Offline', { status: 503 });
  }
}

// Cache-first lazy: textures, persisteixen al TEXTURE_CACHE (no s'invaliden amb bumps de codi)
async function cacheFirstLazy(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(TEXTURE_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 404 });
  }
}

// Stale-while-revalidate: Google Fonts, persisteix al FONT_CACHE
async function staleWhileRevalidate(request) {
  const cache = await caches.open(FONT_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}
