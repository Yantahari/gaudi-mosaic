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

  // Posicionar el tooltip
  box.style.position = 'fixed';
  box.style.zIndex = '10000';

  if (isMobile()) {
    // Mòbil: centrat a baix, sobre la nav
    box.style.bottom = '80px';
    box.style.left = '16px';
    box.style.right = '16px';
    box.style.width = 'auto';
  } else {
    // Desktop: centrat a la zona del canvas (a la dreta del panell)
    const panelW = 250;
    const availW = window.innerWidth - panelW;
    box.style.maxWidth = '380px';
    box.style.left = (panelW + (availW - 380) / 2) + 'px';
    box.style.top = '50%';
    box.style.transform = 'translateY(-50%)';
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
