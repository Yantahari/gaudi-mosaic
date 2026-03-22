// =====================================================
// GAUDÍ MOSAIC — Catàleg de textures Midjourney
// Cada rajola té una col·lecció i un acabat assignat
// =====================================================

/**
 * Catàleg de textures.
 * Cada entrada defineix un grup de variants amb col·lecció i acabat.
 * finish: glazed | matte | iridescent | rustic (coincideix amb CERAMIC_TYPES)
 */
export const TEXTURE_CATALOG = [
  // Col·lecció Parc Güell
  { collection: 'Parc Güell', finish: 'glazed',     prefix: 'parcguell-vidriat',     count: 5 },
  { collection: 'Parc Güell', finish: 'matte',       prefix: 'parcguell-mat',         count: 4 },
  { collection: 'Parc Güell', finish: 'iridescent',  prefix: 'parcguell-iridiscent',  count: 4 },
  { collection: 'Parc Güell', finish: 'rustic',      prefix: 'parcguell-rustic',      count: 4 },

  // Col·lecció Mediterrani (acabat vidriat)
  { collection: 'Mediterrani',    finish: 'glazed', prefix: 'mediterrani',    count: 4 },

  // Col·lecció Jocs Florals (acabat vidriat)
  { collection: 'Jocs Florals',   finish: 'glazed', prefix: 'jocsflorals',    count: 4 },

  // Col·lecció Mosaic Clàssic
  { collection: 'Mosaic Clàssic', finish: 'iridescent', prefix: 'mosaic-iridiscent', count: 4 },
  { collection: 'Mosaic Clàssic', finish: 'matte',      prefix: 'mosaic-mat',        count: 4 },
  { collection: 'Mosaic Clàssic', finish: 'rustic',     prefix: 'mosaic-rustic',      count: 4 },
];

// Noms dels acabats en català (per a la UI)
export const FINISH_NAMES = {
  glazed: 'Vidriat',
  matte: 'Mat',
  iridescent: 'Iridiscent',
  rustic: 'Rústic'
};

// Cache d'imatges carregades
const imageCache = new Map();

/**
 * Carrega una imatge. Retorna null si no existeix.
 */
function loadImage(path) {
  if (imageCache.has(path)) {
    return Promise.resolve(imageCache.get(path));
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(path, img);
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = path;
  });
}

/**
 * Estructura d'una rajola carregada:
 * { img: HTMLImageElement, collection: string, finish: string, prefix: string, variant: number }
 */

/**
 * Carrega TOTES les textures del catàleg.
 * Retorna un array de rajoles amb metadades.
 * @returns {Promise<Array>}
 */
export async function loadAllTextures() {
  const promises = [];

  for (const entry of TEXTURE_CATALOG) {
    for (let i = 1; i <= entry.count; i++) {
      const path = `assets/textures/${entry.prefix}${i}.png`;
      promises.push(
        loadImage(path).then(img => {
          if (!img) return null;
          return {
            img,
            collection: entry.collection,
            finish: entry.finish,
            prefix: entry.prefix,
            variant: i
          };
        })
      );
    }
  }

  const results = await Promise.all(promises);
  return results.filter(r => r !== null);
}

/**
 * Filtra rajoles per acabat.
 * @param {Array} tiles - Totes les rajoles carregades
 * @param {string} finish - Acabat a filtrar (glazed, matte, iridescent, rustic)
 * @returns {Array} Rajoles filtrades
 */
export function filterByFinish(tiles, finish) {
  return tiles.filter(t => t.finish === finish);
}
