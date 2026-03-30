// =====================================================
// GAUDÍ MOSAIC — Tutorial interactiu pas a pas
// Guia l'usuari pel flux real amb spotlight
// =====================================================

import { subscribe } from '../state.js';
import { t } from '../i18n/i18n.js';

const STORAGE_KEY = 'gaudi-tutorial-done';

// Passos del tutorial — targets adaptats desktop/mòbil
const STEPS = [
  { icon: '🎨', titleKey: 'tutorial.step1title', textKey: 'tutorial.step1text',
    target: '#panel-ceramics', mobileTarget: '.mobile-nav-btn[data-view="ceramics"]' },
  { icon: '⚡', titleKey: 'tutorial.step2title', textKey: 'tutorial.step2text',
    target: '#ceramicsGrid', mobileTarget: '#ceramicsGrid' },
  { icon: '✋', titleKey: 'tutorial.step3title', textKey: 'tutorial.step3text',
    target: '#canvasArea', mobileTarget: '.mobile-nav-btn[data-view="canvas"]' },
  { icon: '🧩', titleKey: 'tutorial.step4title', textKey: 'tutorial.step4text',
    target: '#toolbar', mobileTarget: '.mobile-nav-btn[data-view="tools"]' },
  { icon: '💾', titleKey: 'tutorial.step5title', textKey: 'tutorial.step5text',
    target: '#exportBtn', mobileTarget: '.mobile-nav-btn[data-view="canvas"]' }
];

let currentStep = 0;
let overlayEl = null;
let onKeyHandler = null;

// Detectar mòbil real: la nav inferior és visible (display !== none)
const isMobile = () => {
  const nav = document.getElementById('mobileNav');
  return nav && getComputedStyle(nav).display !== 'none';
};

export function initTutorial() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    subscribe('app:ready', () => setTimeout(showTutorial, 600));
  }
  subscribe('tutorial:repeat', showTutorial);
}

function showTutorial() {
  currentStep = 0;
  if (overlayEl) overlayEl.remove();

  overlayEl = document.createElement('div');
  overlayEl.className = 'tutorial-overlay';

  overlayEl.addEventListener('click', (e) => {
    if (e.target === overlayEl) dismiss();
  });

  document.body.appendChild(overlayEl);
  requestAnimationFrame(() => overlayEl.classList.add('active'));

  onKeyHandler = (e) => {
    if (e.key === 'Escape') dismiss();
    if (e.key === 'ArrowRight' || e.key === 'Enter') nextStep();
  };
  document.addEventListener('keydown', onKeyHandler);

  renderStep();
}

function renderStep() {
  if (!overlayEl) return;
  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  overlayEl.innerHTML = '';

  // Trobar el target (mòbil o desktop)
  const selector = isMobile() ? (step.mobileTarget || step.target) : step.target;
  const targetEl = document.querySelector(selector);

  // Spotlight
  if (targetEl) {
    const rect = targetEl.getBoundingClientRect();
    const pad = 6;
    const spot = document.createElement('div');
    spot.className = 'tutorial-spotlight';
    spot.style.left = `${rect.left - pad}px`;
    spot.style.top = `${rect.top - pad}px`;
    spot.style.width = `${rect.width + pad * 2}px`;
    spot.style.height = `${rect.height + pad * 2}px`;
    overlayEl.appendChild(spot);
  }

  // Tooltip
  const box = document.createElement('div');
  box.className = 'tutorial-box';

  // Punts de progrés
  const dots = document.createElement('div');
  dots.className = 'tutorial-dots';
  STEPS.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'tutorial-dot' + (i === currentStep ? ' active' : '') + (i < currentStep ? ' done' : '');
    dots.appendChild(dot);
  });
  box.appendChild(dots);

  // Contingut
  const content = document.createElement('div');
  content.className = 'tutorial-content';
  content.innerHTML = `
    <div class="tutorial-icon">${step.icon}</div>
    <div class="tutorial-title">${t(step.titleKey)}</div>
    <div class="tutorial-text">${t(step.textKey)}</div>
  `;
  box.appendChild(content);

  // Botons
  const actions = document.createElement('div');
  actions.className = 'tutorial-actions';

  const skipBtn = document.createElement('button');
  skipBtn.className = 'tutorial-skip';
  skipBtn.textContent = t('tutorial.skip');
  skipBtn.addEventListener('click', dismiss);
  actions.appendChild(skipBtn);

  const mainBtn = document.createElement('button');
  mainBtn.className = 'tutorial-next';
  mainBtn.textContent = isLast ? (t('tutorial.skip') + ' ✓') : (t('tutorial.next') + ' →');
  mainBtn.addEventListener('click', isLast ? dismiss : nextStep);
  actions.appendChild(mainBtn);
  box.appendChild(actions);

  // Afegir al DOM per poder mesurar dimensions
  box.style.visibility = 'hidden';
  box.style.position = 'fixed';
  box.style.top = '0';
  box.style.left = '0';
  overlayEl.appendChild(box);

  // Forçar reflow perquè getBoundingClientRect retorni dimensions reals
  box.offsetHeight; // eslint-disable-line no-unused-expressions

  // Posicionar amb clamping al viewport
  positionTooltip(box, targetEl);
  // Última verificació: forçar dins el viewport
  assegurarVisibilitat(box);
  box.style.visibility = '';
}

/**
 * Posiciona el tooltip respecte al target, clampejat dins el viewport.
 * Funciona tant en desktop com en mòbil.
 */
function positionTooltip(box, targetEl) {
  const HEADER_H = 70;
  const MARGIN = 16;
  const boxRect = box.getBoundingClientRect();
  const bw = boxRect.width;
  const bh = boxRect.height;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let top, left;

  if (!targetEl) {
    // Centrat
    top = (vh - bh) / 2;
    left = (vw - bw) / 2;
  } else {
    const r = targetEl.getBoundingClientRect();

    // Decidir posició ideal segons on és el target
    const targetIsLeft = r.right < vw * 0.4;
    const targetIsBottom = r.top > vh * 0.6;
    const targetIsWide = r.width > vw * 0.5;

    if (targetIsLeft) {
      // Tooltip a la dreta del target, centrat verticalment
      left = r.right + 16;
      top = r.top + r.height / 2 - bh / 2;
    } else if (targetIsBottom) {
      // Tooltip a sobre del target
      left = r.left + r.width / 2 - bw / 2;
      top = r.top - bh - 12;
    } else if (targetIsWide) {
      // Target gran (canvas): centrar tooltip a la pantalla
      left = (vw - bw) / 2;
      top = (vh - bh) / 2;
    } else {
      // Default: a sota del target
      left = r.left + r.width / 2 - bw / 2;
      top = r.bottom + 12;
    }
  }

  // Clamp: mai fora del viewport
  top = Math.max(HEADER_H + MARGIN, Math.min(top, vh - bh - MARGIN));
  left = Math.max(MARGIN, Math.min(left, vw - bw - MARGIN));

  box.style.top = `${top}px`;
  box.style.left = `${left}px`;
  // Netejar bottom/transform que puguin interferir
  box.style.bottom = 'auto';
  box.style.transform = 'none';
}

/**
 * Última xarxa de seguretat: si el tooltip queda fora del viewport, corregir.
 */
function assegurarVisibilitat(el) {
  const rect = el.getBoundingClientRect();
  const minTop = 100;  // sota el header (~70px) + marge
  const minLeft = 16;
  const maxBottom = window.innerHeight - 16;
  const maxRight = window.innerWidth - 16;

  if (rect.top < minTop) {
    el.style.top = minTop + 'px';
    el.style.transform = 'none';
  }
  if (rect.bottom > maxBottom) {
    el.style.top = (maxBottom - rect.height) + 'px';
  }
  if (rect.left < minLeft) {
    el.style.left = minLeft + 'px';
  }
  if (rect.right > maxRight) {
    el.style.left = (maxRight - rect.width) + 'px';
  }
}

function nextStep() {
  if (currentStep < STEPS.length - 1) {
    currentStep++;
    renderStep();
  }
}

function dismiss() {
  localStorage.setItem(STORAGE_KEY, '1');
  if (overlayEl) {
    overlayEl.classList.remove('active');
    setTimeout(() => { if (overlayEl) { overlayEl.remove(); overlayEl = null; } }, 400);
  }
  if (onKeyHandler) {
    document.removeEventListener('keydown', onKeyHandler);
    onKeyHandler = null;
  }
}
