// =====================================================
// GAUDÍ MOSAIC — Mode guiat "Completa el mosaic"
// L'usuari rep una silueta amb peces pre-col·locades
// i ha d'omplir la resta per completar el mosaic.
// =====================================================

import { getState, setState, subscribe, emit, addPiece } from '../state.js';
import { TEMPLATES } from '../data/templates.js';
import { PALETTES } from '../data/palettes.js';
import { generateCeramicPattern } from '../engine/ceramics.js';
import { generateFragments } from '../engine/fracture.js';
import { render } from '../engine/canvas.js';
import { t } from '../i18n/i18n.js';

// ---- Definició dels reptes ----
// Cada repte associa una plantilla amb una paleta i configuració
const CHALLENGES = [
  {
    id: 'drac-classic',
    templateId: 'drac',
    palette: 'parkGuell',
    name: 'El Drac del Parc Güell',
    difficulty: 1,   // 1=fàcil, 2=mitjà, 3=difícil
    preplacedRatio: 0.4,  // 40% de peces pre-col·locades
    fragmentCount: 25,
    ceramicType: 'glazed',
    fractureType: 'voronoi'
  },
  {
    id: 'salamandra-viva',
    templateId: 'salamandra',
    palette: 'parkGuell',
    name: 'La Salamandra',
    difficulty: 1,
    preplacedRatio: 0.35,
    fragmentCount: 30,
    ceramicType: 'iridescent',
    fractureType: 'organic'
  },
  {
    id: 'rosassa-llum',
    templateId: 'rosassa',
    palette: 'sagradaFamilia',
    name: 'Rosassa de Llum',
    difficulty: 2,
    preplacedRatio: 0.25,
    fragmentCount: 40,
    ceramicType: 'glazed',
    fractureType: 'radial'
  },
  {
    id: 'creu-daurada',
    templateId: 'creu',
    palette: 'sagradaFamilia',
    name: 'Creu Gaudiniana',
    difficulty: 2,
    preplacedRatio: 0.3,
    fragmentCount: 35,
    ceramicType: 'matte',
    fractureType: 'voronoi'
  },
  {
    id: 'sagrada-capvespre',
    templateId: 'sagradafamilia',
    palette: 'laManyana',
    name: 'Sagrada Família al Capvespre',
    difficulty: 3,
    preplacedRatio: 0.2,
    fragmentCount: 50,
    ceramicType: 'rustic',
    fractureType: 'organic'
  },
  {
    id: 'banc-mediterrani',
    templateId: 'banc',
    palette: 'mediterrani',
    name: 'El Banc Serpentí',
    difficulty: 3,
    preplacedRatio: 0.2,
    fragmentCount: 45,
    ceramicType: 'glazed',
    fractureType: 'voronoi'
  }
];

// ---- Estat del mode guiat ----
let guidedState = {
  active: false,
  challenge: null,
  allFragments: [],     // Tots els fragments generats
  preplacedCount: 0,    // Quants estan pre-col·locats
  totalCount: 0,        // Total
  startTime: null
};

// ---- Inicialització ----
export function initGuided() {
  // Afegir botó al splash
  addSplashButton();

  // Afegir botó a la capçalera
  addHeaderButton();

  // Subscriure's a events
  subscribe('guided:start', (challengeId) => startChallenge(challengeId));
  subscribe('guided:exit', exitGuidedMode);
}

/**
 * Afegeix el botó "Completa un mosaic" al splash screen
 */
function addSplashButton() {
  const enterBtn = document.getElementById('enterBtn');
  if (!enterBtn) return;

  const guidedBtn = document.createElement('button');
  guidedBtn.className = 'splash-enter splash-guided';
  guidedBtn.id = 'guidedBtn';
  guidedBtn.textContent = t('guided.splashBtn');
  guidedBtn.style.cssText = `
    background: transparent;
    border: 2px solid rgba(212,168,67,0.5);
    color: #D4A843;
    margin-top: 12px;
    font-size: 0.9em;
    cursor: pointer;
    padding: 12px 32px;
    border-radius: 50px;
    font-family: inherit;
    transition: all 0.3s ease;
  `;
  guidedBtn.addEventListener('mouseenter', () => {
    guidedBtn.style.background = 'rgba(212,168,67,0.15)';
    guidedBtn.style.borderColor = '#D4A843';
  });
  guidedBtn.addEventListener('mouseleave', () => {
    guidedBtn.style.background = 'transparent';
    guidedBtn.style.borderColor = 'rgba(212,168,67,0.5)';
  });

  guidedBtn.addEventListener('click', () => {
    showChallengeSelector();
  });

  enterBtn.parentNode.insertBefore(guidedBtn, enterBtn.nextSibling);
}

/**
 * Afegeix el botó de mode guiat a la capçalera
 */
function addHeaderButton() {
  const actions = document.querySelector('.header-actions');
  if (!actions) return;

  const btn = document.createElement('button');
  btn.className = 'header-btn';
  btn.id = 'guidedHeaderBtn';
  btn.textContent = t('guided.headerBtn');
  btn.title = t('guided.headerTitle');
  btn.addEventListener('click', () => {
    if (guidedState.active) {
      showGuidedProgress();
    } else {
      showChallengeSelector();
    }
  });

  // Inserir després del botó educatiu
  const eduBtn = document.getElementById('eduBtn');
  if (eduBtn && eduBtn.nextSibling) {
    actions.insertBefore(btn, eduBtn.nextSibling);
  } else {
    actions.prepend(btn);
  }
}

/**
 * Mostra el selector de reptes (modal)
 */
function showChallengeSelector() {
  // Amagar splash si és visible
  const splash = document.getElementById('splash');
  if (splash && !splash.classList.contains('hidden')) {
    splash.classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
  }

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay guided-modal';
  overlay.id = 'guidedModal';

  const modal = document.createElement('div');
  modal.className = 'modal-content';
  modal.style.maxWidth = '600px';

  // Títol
  const title = document.createElement('h2');
  title.className = 'modal-title';
  title.textContent = t('guided.modalTitle');
  title.style.cssText = 'color: #D4A843; margin-bottom: 8px;';

  const subtitle = document.createElement('p');
  subtitle.textContent = t('guided.modalSubtitle');
  subtitle.style.cssText = 'color: #B5A898; margin-bottom: 24px; font-size: 0.9em;';

  // Graella de reptes
  const grid = document.createElement('div');
  grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px;';

  CHALLENGES.forEach(challenge => {
    const template = TEMPLATES.find(t => t.id === challenge.templateId);
    if (!template) return;

    const card = document.createElement('div');
    card.className = 'guided-challenge-card';
    card.style.cssText = `
      background: rgba(212,168,67,0.08);
      border: 1px solid rgba(212,168,67,0.2);
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
    `;
    card.addEventListener('mouseenter', () => {
      card.style.borderColor = '#D4A843';
      card.style.background = 'rgba(212,168,67,0.15)';
      card.style.transform = 'translateY(-2px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.borderColor = 'rgba(212,168,67,0.2)';
      card.style.background = 'rgba(212,168,67,0.08)';
      card.style.transform = 'none';
    });

    // Miniatura SVG de la plantilla
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', template.viewBox);
    svg.setAttribute('width', '80');
    svg.setAttribute('height', '80');
    svg.style.cssText = 'fill: none; stroke: rgba(212,168,67,0.6); stroke-width: 2; margin-bottom: 12px;';
    template.paths.forEach(pathStr => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathStr);
      svg.appendChild(path);
    });

    // Nom del repte
    const name = document.createElement('div');
    name.textContent = challenge.name;
    name.style.cssText = 'color: #E8DCC8; font-weight: 600; margin-bottom: 6px; font-size: 0.95em;';

    // Dificultat (estrelles)
    const diff = document.createElement('div');
    const stars = '★'.repeat(challenge.difficulty) + '☆'.repeat(3 - challenge.difficulty);
    diff.textContent = stars;
    diff.style.cssText = 'color: #D4A843; font-size: 0.85em; letter-spacing: 2px;';

    // Info breu
    const info = document.createElement('div');
    info.textContent = `${challenge.fragmentCount} ${t('guided.fragments')}`;
    info.style.cssText = 'color: #B5A898; font-size: 0.8em; margin-top: 4px;';

    card.appendChild(svg);
    card.appendChild(name);
    card.appendChild(diff);
    card.appendChild(info);

    card.addEventListener('click', () => {
      overlay.remove();
      emit('guided:start', challenge.id);
    });

    grid.appendChild(card);
  });

  // Botó tancar
  const closeBtn = document.createElement('button');
  closeBtn.textContent = t('dialogs.close');
  closeBtn.className = 'header-btn';
  closeBtn.style.cssText = 'margin-top: 20px; display: block; margin-left: auto; margin-right: auto;';
  closeBtn.addEventListener('click', () => overlay.remove());

  modal.appendChild(title);
  modal.appendChild(subtitle);
  modal.appendChild(grid);
  modal.appendChild(closeBtn);
  overlay.appendChild(modal);

  // Tancar amb clic al fons
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  document.body.appendChild(overlay);
}

/**
 * Inicia un repte: genera fragments, pre-col·loca alguns, envia la resta a la safata
 */
async function startChallenge(challengeId) {
  const challenge = CHALLENGES.find(c => c.id === challengeId);
  if (!challenge) return;

  const template = TEMPLATES.find(t => t.id === challenge.templateId);
  const palette = PALETTES[challenge.palette];
  if (!template || !palette) return;

  emit('notify', t('guided.loading'));

  // Netejar el canvas
  const state = getState();
  state.placedPieces.length = 0;
  state.fragments.length = 0;

  // Activar la plantilla
  setState('activeTemplate', template);
  setState('templateOpacity', 0.12);
  setState('templateScale', 1);

  // Generar fragments a partir de múltiples rajoles de la paleta
  const allFragments = [];
  const colorsPerBatch = 3;
  const batchCount = Math.ceil(challenge.fragmentCount / 8);

  for (let b = 0; b < batchCount; b++) {
    // Crear una rajola procedural amb colors de la paleta
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = 256;
    tileCanvas.height = 256;

    // Seleccionar colors aleatoris de la paleta per a cada rajola
    const startIdx = (b * colorsPerBatch) % palette.colors.length;
    generateCeramicPattern(tileCanvas, challenge.palette, b % 10, challenge.ceramicType);

    // Fracturar la rajola
    const frags = generateFragments(
      tileCanvas,
      challenge.fractureType,
      0.4 + Math.random() * 0.3,
      256
    );

    allFragments.push(...frags);
  }

  // Limitar al nombre desitjat
  const shuffled = allFragments.sort(() => Math.random() - 0.5).slice(0, challenge.fragmentCount);
  const preplacedCount = Math.floor(shuffled.length * challenge.preplacedRatio);

  // Calcular posicions al voltant de la plantilla
  // Parsejar viewBox per saber la mida de la plantilla
  const canvas = document.getElementById('mosaicCanvas');
  const cw = canvas.width;
  const ch = canvas.height;
  const centerX = cw / 2;
  const centerY = ch / 2;
  const spreadRadius = Math.min(cw, ch) * 0.3;

  // Pre-col·locar alguns fragments (distribuïts dins la silueta)
  for (let i = 0; i < preplacedCount; i++) {
    const frag = shuffled[i];
    const angle = (i / preplacedCount) * Math.PI * 2;
    const r = spreadRadius * (0.2 + Math.random() * 0.6);
    const scale = 0.6;

    addPiece({
      canvas: frag.canvas,
      x: centerX + Math.cos(angle) * r - (frag.w * scale) / 2,
      y: centerY + Math.sin(angle) * r - (frag.h * scale) / 2,
      w: frag.w * scale,
      h: frag.h * scale,
      polygon: frag.polygon || [],
      guided: true  // Marcar com a peça del mode guiat
    });
  }

  // Enviar la resta a la safata
  const remainingFrags = shuffled.slice(preplacedCount);
  setState('fragments', remainingFrags);

  // Actualitzar estat guiat
  guidedState = {
    active: true,
    challenge,
    allFragments: shuffled,
    preplacedCount,
    totalCount: shuffled.length,
    startTime: Date.now()
  };

  // Actualitzar la safata
  emit('fragments:update');

  // Activar el rejunt per defecte (queda més bonic)
  setState('grout', { enabled: true, color: '#B5A898', width: 2 });
  const groutToggle = document.getElementById('groutToggle');
  if (groutToggle) groutToggle.checked = true;

  // Renderitzar
  render();

  // Actualitzar botó de capçalera
  const headerBtn = document.getElementById('guidedHeaderBtn');
  if (headerBtn) {
    headerBtn.textContent = t('guided.progressBtn');
    headerBtn.classList.add('primary');
  }

  emit('notify', t('guided.started', { name: challenge.name }));
}

/**
 * Mostra el progrés del repte actual
 */
function showGuidedProgress() {
  if (!guidedState.active) return;

  const state = getState();
  const placedCount = state.placedPieces.length;
  const remaining = guidedState.totalCount - placedCount;
  const elapsed = Math.floor((Date.now() - guidedState.startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  const msg = t('guided.progress', {
    placed: placedCount,
    total: guidedState.totalCount,
    remaining: Math.max(0, remaining),
    time: `${minutes}:${seconds.toString().padStart(2, '0')}`
  });

  emit('notify', msg);
}

/**
 * Surt del mode guiat
 */
function exitGuidedMode() {
  guidedState = {
    active: false,
    challenge: null,
    allFragments: [],
    preplacedCount: 0,
    totalCount: 0,
    startTime: null
  };

  // Restaurar botó de capçalera
  const headerBtn = document.getElementById('guidedHeaderBtn');
  if (headerBtn) {
    headerBtn.textContent = t('guided.headerBtn');
    headerBtn.classList.remove('primary');
  }
}

/**
 * Retorna si el mode guiat està actiu
 */
export function isGuidedActive() {
  return guidedState.active;
}

/**
 * Retorna l'estat del mode guiat (per a serialització, etc.)
 */
export function getGuidedState() {
  return { ...guidedState };
}
