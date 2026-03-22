// =====================================================
// GAUDÍ MOSAIC — Utilitats compartides
// =====================================================

/**
 * Converteix coordenades de pantalla a coordenades del món (llenç)
 */
export function screenToWorld(sx, sy, transform) {
  return {
    x: (sx - transform.offsetX) / transform.scale,
    y: (sy - transform.offsetY) / transform.scale
  };
}

/**
 * Converteix coordenades del món a coordenades de pantalla
 */
export function worldToScreen(wx, wy, transform) {
  return {
    x: wx * transform.scale + transform.offsetX,
    y: wy * transform.scale + transform.offsetY
  };
}

/**
 * Calcula la distància entre dos punts
 */
export function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Limita un valor entre un mínim i un màxim
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Interpola linealment entre dos valors
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Easing ease-out cubic
 */
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Easing ease-in-out cubic
 */
export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Genera un identificador únic senzill
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Crea un element DOM amb atributs
 */
export function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, val]) => {
    if (key === 'className') el.className = val;
    else if (key === 'textContent') el.textContent = val;
    else if (key === 'innerHTML') el.innerHTML = val;
    else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), val);
    else if (key === 'style' && typeof val === 'object') {
      Object.assign(el.style, val);
    } else {
      el.setAttribute(key, val);
    }
  });
  children.forEach(child => {
    if (typeof child === 'string') el.appendChild(document.createTextNode(child));
    else if (child) el.appendChild(child);
  });
  return el;
}

/**
 * Debounce: retarda l'execució fins que parin les crides
 */
export function debounce(fn, delay = 250) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle: limita la freqüència d'execució
 */
export function throttle(fn, limit = 16) {
  let lastTime = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastTime >= limit) {
      lastTime = now;
      fn(...args);
    }
  };
}

/**
 * Barreja un array (Fisher-Yates)
 */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Comprova si un punt està dins d'un polígon (ray casting)
 */
export function pointInPolygon(px, py, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Converteix graus a radians
 */
export function degToRad(deg) {
  return deg * Math.PI / 180;
}

/**
 * Converteix radians a graus
 */
export function radToDeg(rad) {
  return rad * 180 / Math.PI;
}
