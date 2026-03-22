// =====================================================
// GAUDÍ MOSAIC — Zona de trencament de ceràmiques
// L'atzar decideix la forma dels fragments, com en un trencadís real
// =====================================================

import { getState, setState, emit, subscribe } from '../state.js';
import { generateFragments, animateCrack } from '../engine/fracture.js';
import { easeOutCubic } from '../utils/helpers.js';
import { t } from '../i18n/i18n.js';

let breakCanvas = null;
let breakCtx = null;
let workSize = 300; // Resolució interna de treball (s'ajusta segons la font)

/**
 * Inicialitza la zona de trencament
 */
export function initBreakZone() {
  breakCanvas = document.getElementById('breakCanvas');
  if (!breakCanvas) return;
  breakCtx = breakCanvas.getContext('2d');

  setupBreakButtons();

  // Subscriure's a l'event d'obrir la zona
  subscribe('breakzone:open', openBreakZone);
}

/**
 * Obre la zona de trencament amb una ceràmica.
 * Accepta un objecte { canvas, sourceImage } o directament un canvas (compatibilitat).
 */
function openBreakZone(ceramicData) {
  const zone = document.getElementById('breakZone');
  if (!zone) return;

  const state = getState();

  // Determinar la font d'alta resolució
  let source;
  if (ceramicData && ceramicData.sourceImage) {
    // Textura Midjourney: usar la imatge original a resolució completa
    source = ceramicData.sourceImage;
    // Treballar a resolució alta (màx 512 per rendiment)
    workSize = Math.min(source.naturalWidth || source.width, 512);
  } else {
    // Patró procedural: usar el canvas (100×100)
    source = ceramicData.canvas || ceramicData;
    workSize = 300;
  }

  // Ajustar la mida interna del canvas de trencament
  breakCanvas.width = workSize;
  breakCanvas.height = workSize;

  // Dibuixar la ceràmica al canvas de trencament a resolució completa
  breakCtx.imageSmoothingEnabled = true;
  breakCtx.imageSmoothingQuality = 'high';
  breakCtx.clearRect(0, 0, workSize, workSize);
  breakCtx.drawImage(source, 0, 0, workSize, workSize);

  state.brokenFragments = [];
  zone.classList.add('active');

  // Sincronitzar controls del breakzone amb l'estat actual
  const breakFracture = document.getElementById('breakFractureType');
  if (breakFracture) breakFracture.value = state.fractureType;

  const breakGran = document.getElementById('breakGranularity');
  if (breakGran) breakGran.value = state.fractureGranularity * 100;

  const breakGranLabel = document.getElementById('breakGranularityLabel');
  if (breakGranLabel) {
    const v = state.fractureGranularity * 100;
    breakGranLabel.textContent = v < 40 ? t('breakzone.granularityFine') : v > 70 ? t('breakzone.granularityCoarse') : t('breakzone.granularityMedium');
  }

  // Amagar botó d'usar fins que es trenqui
  const useBtn = document.getElementById('useFragsBtn');
  if (useBtn) useBtn.style.display = 'none';
}

/**
 * Tanca la zona de trencament
 */
function closeBreakZone() {
  const zone = document.getElementById('breakZone');
  if (zone) zone.classList.remove('active');

  const state = getState();
  state.brokenFragments = [];
}

/**
 * Configura els botons i controls de la zona de trencament
 */
function setupBreakButtons() {
  // Botó de trencar
  const crackBtn = document.getElementById('crackBtn');
  if (crackBtn) {
    crackBtn.addEventListener('click', doCrack);
  }

  // Botó d'usar fragments
  const useBtn = document.getElementById('useFragsBtn');
  if (useBtn) {
    useBtn.addEventListener('click', useFragments);
  }

  // Botó de cancel·lar
  const cancelBtn = document.getElementById('cancelBreakBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeBreakZone);
  }

  // Selector d'algorisme dins el breakzone
  const breakFracture = document.getElementById('breakFractureType');
  if (breakFracture) {
    breakFracture.addEventListener('change', (e) => {
      setState('fractureType', e.target.value);
    });
  }

  // Lliscador de granularitat dins el breakzone
  const breakGran = document.getElementById('breakGranularity');
  if (breakGran) {
    breakGran.addEventListener('input', (e) => {
      setState('fractureGranularity', e.target.value / 100);
      const label = document.getElementById('breakGranularityLabel');
      if (label) label.textContent = e.target.value < 40 ? t('breakzone.granularityFine') : e.target.value > 70 ? t('breakzone.granularityCoarse') : t('breakzone.granularityMedium');
    });
  }
}

/**
 * Executa la fractura
 */
function doCrack() {
  const state = getState();
  if (!state.selectedCeramic) return;

  // Usar la imatge original d'alta resolució si està disponible
  const source = state.selectedCeramic.sourceImage || state.selectedCeramic.canvas;

  // Generar fragments a la resolució de treball
  const fragments = generateFragments(
    source,
    state.fractureType,
    state.fractureGranularity,
    workSize
  );

  state.brokenFragments = fragments;

  // Vibració hàptica (mòbil)
  if (navigator.vibrate) {
    navigator.vibrate([30, 40, 20]);
  }

  // Animar la fractura — 3 fases: flash, expansió, relaxació
  let startTime = null;
  const duration = 900;

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);

    animateCrack(breakCtx, fragments, workSize, progress);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);

  // Mostrar botó d'usar (amb delay per deixar veure l'animació)
  const useBtn = document.getElementById('useFragsBtn');
  if (useBtn) {
    useBtn.style.display = 'none';
    setTimeout(() => { useBtn.style.display = 'inline-block'; }, 500);
  }

  emit('notify', t('breakzone.fragmentsCreated', { count: fragments.length }));
}

/**
 * Usar els fragments trencats — afegir-los a la safata
 * Tant en mòbil com en escriptori, els fragments van a la safata.
 * En mòbil, el canvi de vista a canvas es fa via subscripció a panels.js.
 */
function useFragments() {
  const state = getState();

  state.brokenFragments.forEach(frag => {
    state.fragments.push({
      canvas: frag.canvas,
      w: frag.w,
      h: frag.h,
      polygon: frag.polygon || []
    });
  });

  emit('fragments:update');
  closeBreakZone();

  // Amagar pista del llenç
  const hint = document.getElementById('canvasHint');
  if (hint) hint.classList.add('hidden');

  emit('notify', t('breakzone.fragmentsAdded'));
}
