// =====================================================
// GAUDÍ MOSAIC — Generador de mosaic des de foto
// Port del Python `generate-mosaic-from-reference.py` a JS.
// Construeix un photomosaic amb fragments del catàleg de
// ceràmiques, seleccionats per coincidència de color en LAB.
// =====================================================

import { loadAllTextures } from '../data/textures.js';

// ----- Configuració (paral·lela al Python) -----
const GRID_COLS = 45;
const FRAGMENT_BASE_SIZE = 44;
const FRAGMENT_SIZE_VARIATION = 0.10;
const COLOR_BLEND_RATIO = 0.65;
const SUBJECT_SAT_THRESHOLD = 20;       // 0–255
const SUBJECT_VAL_MIN = 25;
const SUBJECT_VAL_MAX = 250;
const SUBJECT_FILL_THRESHOLD = 0.15;
const FRAGMENT_VERTICES_MIN = 5;
const FRAGMENT_VERTICES_MAX = 8;
const ROTATION_RANGE = 15;              // ±graus
const SUBDIVISIONS_PER_TEXTURE = 5;     // 5×5 = 25 fragments per textura

/**
 * Punt d'entrada. Genera un mosaic complet a partir d'una imatge.
 *
 * @param {HTMLImageElement} referenceImg - imatge de referència ja carregada
 * @param {Object} [opts]
 * @param {number} [opts.outputWidth=1000] amplada del mosaic generat
 * @param {function(number, string): void} [opts.onProgress] callback (0–1, missatge)
 * @returns {Promise<Array>} Array de peces { canvas, x, y, w, h, rotation, polygon } llestes per addPiece.
 */
export async function generatePhotoMosaic(referenceImg, opts = {}) {
  const { outputWidth = 1000, onProgress = () => {} } = opts;

  onProgress(0.02, 'Carregant catàleg de ceràmiques…');
  const textures = await loadAllTextures();
  if (textures.length === 0) {
    throw new Error('No s\'ha pogut carregar el catàleg de textures');
  }

  onProgress(0.10, 'Construint pool de fragments…');
  const pool = await buildFragmentPool(textures);

  onProgress(0.20, 'Analitzant la teva imatge…');

  // Redimensionar la referència al outputWidth
  const aspect = referenceImg.naturalHeight / referenceImg.naturalWidth;
  const outW = Math.round(outputWidth);
  const outH = Math.round(outW * aspect);

  const refCanvas = document.createElement('canvas');
  refCanvas.width = outW;
  refCanvas.height = outH;
  const refCtx = refCanvas.getContext('2d', { willReadFrequently: true });
  refCtx.imageSmoothingQuality = 'high';
  refCtx.drawImage(referenceImg, 0, 0, outW, outH);
  const refImageData = refCtx.getImageData(0, 0, outW, outH);

  // Màscara del subjecte (HSV thresholding sobre la pròpia imatge)
  const subjectMask = computeSubjectMask(refImageData);

  // Graella
  const gridCols = GRID_COLS;
  const gridRows = Math.max(1, Math.round(gridCols * aspect));
  const cellW = outW / gridCols;
  const cellH = outH / gridRows;

  onProgress(0.25, 'Componiendo mosaic…');

  const placements = [];
  const totalCells = gridCols * gridRows;
  let processed = 0;

  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const x0 = Math.floor(col * cellW);
      const y0 = Math.floor(row * cellH);
      const x1 = Math.min(Math.floor((col + 1) * cellW), outW);
      const y1 = Math.min(Math.floor((row + 1) * cellH), outH);
      processed++;

      if (x1 <= x0 || y1 <= y0) continue;

      // Comptar quants píxels del subject hi ha a la cel·la
      const fillRatio = countSubjectPixels(subjectMask, x0, y0, x1, y1, outW) / ((x1 - x0) * (y1 - y0));
      if (fillRatio < SUBJECT_FILL_THRESHOLD) continue;

      // Color dominant de la cel·la (només sobre píxels del subject si n'hi ha prou)
      const targetRgb = averageRgbInCell(refImageData, subjectMask, x0, y0, x1, y1, outW);
      const targetLab = rgbToLab(targetRgb);

      // Trobar el fragment del pool més proper en LAB
      const poolEntry = findBestFragment(pool, targetLab);

      // Mida del fragment
      const sizeNoise = 1 + (Math.random() * 2 - 1) * FRAGMENT_SIZE_VARIATION;
      let fragSize = Math.round(FRAGMENT_BASE_SIZE * sizeNoise);
      fragSize = Math.max(fragSize, Math.ceil(Math.max(cellW, cellH) * 1.05));

      // Generar el canvas de la peça (cropped + tinted + masked)
      const seed = row * gridCols + col;
      const { canvas: fragCanvas, polygon } = renderFragment(poolEntry, targetRgb, fragSize, seed);

      // Posició centre de la cel·la amb petit jitter
      const cx = (x0 + x1) / 2 + (Math.random() * 4 - 2);
      const cy = (y0 + y1) / 2 + (Math.random() * 4 - 2);

      // Rotació
      const rotation = (Math.random() * 2 - 1) * ROTATION_RANGE * Math.PI / 180;

      placements.push({
        canvas: fragCanvas,
        x: cx - fragSize / 2,
        y: cy - fragSize / 2,
        w: fragSize,
        h: fragSize,
        rotation,
        polygon
      });
    }

    // Yield al UI thread cada fila perquè no es congeli
    onProgress(0.25 + 0.70 * (row + 1) / gridRows, `Componiendo… ${Math.round(100 * (row + 1) / gridRows)}%`);
    await new Promise(r => requestAnimationFrame(r));
  }

  onProgress(1.0, 'Mosaic generat!');
  return {
    placements,
    bounds: { width: outW, height: outH }
  };
}

// =====================================================
// POOL DE FRAGMENTS
// =====================================================

async function buildFragmentPool(textures) {
  const pool = [];

  for (const tex of textures) {
    const img = tex.img;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) continue;

    // Pre-renderitzar la textura completa a un canvas (per poder llegir-ne píxels)
    const cnv = document.createElement('canvas');
    cnv.width = w;
    cnv.height = h;
    const ctx = cnv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);

    const tw = Math.floor(w / SUBDIVISIONS_PER_TEXTURE);
    const th = Math.floor(h / SUBDIVISIONS_PER_TEXTURE);

    for (let row = 0; row < SUBDIVISIONS_PER_TEXTURE; row++) {
      for (let col = 0; col < SUBDIVISIONS_PER_TEXTURE; col++) {
        const sx = col * tw;
        const sy = row * th;
        const data = ctx.getImageData(sx, sy, tw, th);
        const avgRgb = averageImageDataRgb(data);
        pool.push({
          srcCanvas: cnv,
          sx, sy, sw: tw, sh: th,
          rgb: avgRgb,
          lab: rgbToLab(avgRgb)
        });
      }
    }
  }

  return pool;
}

function findBestFragment(pool, targetLab) {
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < pool.length; i++) {
    const lab = pool[i].lab;
    const dl = lab[0] - targetLab[0];
    const da = lab[1] - targetLab[1];
    const db = lab[2] - targetLab[2];
    const d = dl * dl + da * da + db * db;
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }
  return pool[bestIdx];
}

// =====================================================
// RENDERITZAT D'UNA PEÇA INDIVIDUAL
// =====================================================

function renderFragment(poolEntry, targetRgb, size, seed) {
  // 1. Canvas amb el fragment escalat al size
  const cnv = document.createElement('canvas');
  cnv.width = size;
  cnv.height = size;
  const ctx = cnv.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    poolEntry.srcCanvas,
    poolEntry.sx, poolEntry.sy, poolEntry.sw, poolEntry.sh,
    0, 0, size, size
  );

  // 2. Tenyit cap al color objectiu (preservant la luminositat de la textura)
  if (COLOR_BLEND_RATIO > 0) {
    tintCanvas(ctx, size, targetRgb, COLOR_BLEND_RATIO);
  }

  // 3. Generar polígon irregular (vèrtexs determinístics per seed)
  const polygon = generateIrregularPolygon(size, seed);

  // 4. Aplicar màscara de polígon (clip alpha)
  applyPolygonMask(ctx, size, polygon);

  return { canvas: cnv, polygon };
}

function tintCanvas(ctx, size, targetRgb, ratio) {
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  const tr = targetRgb[0] / 255;
  const tg = targetRgb[1] / 255;
  const tb = targetRgb[2] / 255;
  const len = data.length;

  // Primera passada: calcular mitjana de luminositat
  let sumLum = 0;
  let n = 0;
  for (let i = 0; i < len; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    sumLum += lum;
    n++;
  }
  const meanLum = n > 0 ? sumLum / n : 1;
  if (meanLum < 0.01) return;

  // Segona passada: tenyir
  const oneMinusRatio = 1 - ratio;
  for (let i = 0; i < len; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    let lumNorm = lum / meanLum;
    if (lumNorm < 0.35) lumNorm = 0.35;
    else if (lumNorm > 1.6) lumNorm = 1.6;

    const cr = tr * lumNorm;
    const cg = tg * lumNorm;
    const cb = tb * lumNorm;

    const rr = cr * ratio + r * oneMinusRatio;
    const gg = cg * ratio + g * oneMinusRatio;
    const bb = cb * ratio + b * oneMinusRatio;

    data[i] = Math.min(255, Math.max(0, rr * 255));
    data[i + 1] = Math.min(255, Math.max(0, gg * 255));
    data[i + 2] = Math.min(255, Math.max(0, bb * 255));
    // alpha intacte
  }

  ctx.putImageData(imageData, 0, 0);
}

function generateIrregularPolygon(size, seed) {
  const rng = mulberry32(seed >>> 0);
  const w = size;
  const h = size;
  const n = FRAGMENT_VERTICES_MIN + Math.floor(rng() * (FRAGMENT_VERTICES_MAX - FRAGMENT_VERTICES_MIN + 1));
  const angles = [];
  for (let i = 0; i < n; i++) angles.push(rng() * Math.PI * 2);
  angles.sort((a, b) => a - b);

  const cx = w / 2;
  const cy = h / 2;
  const baseR = Math.min(w, h) / 2 * 0.92;

  const pts = [];
  for (const a of angles) {
    const r = baseR * (0.75 + rng() * 0.25);
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

function applyPolygonMask(ctx, size, polygon) {
  // Tècnica: pintar el polígon amb destination-in per conservar només l'interior
  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  for (let i = 0; i < polygon.length; i++) {
    const p = polygon[i];
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.restore();
}

// =====================================================
// HELPERS DE COLOR
// =====================================================

function averageImageDataRgb(imageData) {
  const data = imageData.data;
  const len = data.length;
  let r = 0, g = 0, b = 0;
  let n = 0;
  for (let i = 0; i < len; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    n++;
  }
  return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
}

function averageRgbInCell(refImageData, subjectMask, x0, y0, x1, y1, w) {
  const data = refImageData.data;
  let r = 0, g = 0, b = 0;
  let nSubject = 0;
  let rAll = 0, gAll = 0, bAll = 0;
  let nAll = 0;

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const idx = (y * w + x);
      const pixIdx = idx * 4;
      const pr = data[pixIdx];
      const pg = data[pixIdx + 1];
      const pb = data[pixIdx + 2];
      rAll += pr; gAll += pg; bAll += pb; nAll++;
      if (subjectMask[idx]) {
        r += pr; g += pg; b += pb; nSubject++;
      }
    }
  }

  if (nSubject > 0) {
    return [Math.round(r / nSubject), Math.round(g / nSubject), Math.round(b / nSubject)];
  }
  return [Math.round(rAll / nAll), Math.round(gAll / nAll), Math.round(bAll / nAll)];
}

function computeSubjectMask(imageData) {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const mask = new Uint8Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const pixIdx = idx * 4;
      const r = data[pixIdx];
      const g = data[pixIdx + 1];
      const b = data[pixIdx + 2];
      const { s, v } = rgbToHsv(r, g, b);
      mask[idx] = (s > SUBJECT_SAT_THRESHOLD && v > SUBJECT_VAL_MIN && v < SUBJECT_VAL_MAX) ? 1 : 0;
    }
  }
  return mask;
}

function countSubjectPixels(mask, x0, y0, x1, y1, w) {
  let c = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      if (mask[y * w + x]) c++;
    }
  }
  return c;
}

function rgbToHsv(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const v = max;
  const s = max === 0 ? 0 : Math.round((max - min) / max * 255);
  return { s, v };
}

function rgbToLab(rgb) {
  let [r, g, b] = rgb.map(x => x / 255);
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  let x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  let y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
  let z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;

  x /= 0.95047;
  y /= 1.00000;
  z /= 1.08883;

  const f = (t) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  const fx = f(x), fy = f(y), fz = f(z);

  return [
    116 * fy - 16,
    500 * (fx - fy),
    200 * (fy - fz)
  ];
}

// =====================================================
// PRNG determinista (Mulberry32) — usat per polígons
// =====================================================

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
