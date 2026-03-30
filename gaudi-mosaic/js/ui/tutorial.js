// =====================================================
// GAUDÍ MOSAIC — Tutorial interactiu pas a pas
// Guia l'usuari pel flux real de l'app amb spotlights
// =====================================================

import { subscribe } from '../state.js';
import { t } from '../i18n/i18n.js';

const STORAGE_KEY = 'gaudi-tutorial-done';

// Definició dels passos: element a destacar + text
const STEPS = [
  { icon: '🎨', titleKey: 'tutorial.step1title', textKey: 'tutorial.step1text', target: '#panel-ceramics' },
  { icon: '⚡', titleKey: 'tutorial.step2title', textKey: 'tutorial.step2text', target: '.break-actions' },
  { icon: '✋', titleKey: 'tutorial.step3title', textKey: 'tutorial.step3text', target: '#canvasArea' },
  { icon: '🧩', titleKey: 'tutorial.step4title', textKey: 'tutorial.step4text', target: '#toolbar' },
  { icon: '💾', titleKey: 'tutorial.step5title', textKey: 'tutorial.step5text', target: '#exportBtn' }
];

let currentStep = 0;
let overlayEl = null;
let onKeyHandler = null;

/**
 * Inicialitza el tutorial — es mostra la primera vegada o quan es demana
 */
export function initTutorial() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    subscribe('app:ready', () => setTimeout(showTutorial, 600));
  }
  // Permetre repetir el tutorial des del modal d'ajuda
  subscribe('tutorial:repeat', showTutorial);
}

/**
 * Mostra el tutorial des del pas 1
 */
function showTutorial() {
  currentStep = 0;
  if (overlayEl) overlayEl.remove();

  overlayEl = document.createElement('div');
  overlayEl.className = 'tutorial-overlay';
  overlayEl.id = 'tutorialOverlay';

  // Tancar amb clic al fons fosc (no al spotlight ni a la caixa)
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

/**
 * Renderitza el pas actual
 */
function renderStep() {
  if (!overlayEl) return;
  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  overlayEl.innerHTML = '';

  // Spotlight sobre l'element objectiu
  const targetEl = document.querySelector(step.target);
  if (targetEl) {
    const rect = targetEl.getBoundingClientRect();
    const pad = 8;
    const spot = document.createElement('div');
    spot.className = 'tutorial-spotlight';
    spot.style.cssText = `
      left: ${rect.left - pad}px;
      top: ${rect.top - pad}px;
      width: ${rect.width + pad * 2}px;
      height: ${rect.height + pad * 2}px;
    `;
    overlayEl.appendChild(spot);
  }

  // Caixa de contingut
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
  if (isLast) {
    mainBtn.textContent = t('tutorial.skip') + ' ✓';
    mainBtn.addEventListener('click', dismiss);
  } else {
    mainBtn.textContent = t('tutorial.next') + ' →';
    mainBtn.addEventListener('click', nextStep);
  }
  actions.appendChild(mainBtn);
  box.appendChild(actions);

  // Posicionar respecte al target
  if (targetEl) {
    const rect = targetEl.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow > 200) {
      box.style.top = `${rect.bottom + 16}px`;
    } else {
      box.style.bottom = `${window.innerHeight - rect.top + 16}px`;
    }
    const cx = rect.left + rect.width / 2;
    box.style.left = `${Math.max(16, Math.min(cx - 160, window.innerWidth - 336))}px`;
  }

  overlayEl.appendChild(box);
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
