// =====================================================
// GAUDÍ MOSAIC — Tutorial de primera vegada
// 3 passos visuals que apareixen un sol cop
// =====================================================

import { subscribe } from '../state.js';
import { t } from '../i18n/i18n.js';

const STORAGE_KEY = 'gaudi-tutorial-done';

/**
 * Inicialitza el tutorial — es mostra després d'app:ready si és la primera vegada
 */
export function initTutorial() {
  if (localStorage.getItem(STORAGE_KEY)) return;
  subscribe('app:ready', () => setTimeout(showTutorial, 600));
}

/**
 * Mostra l'overlay del tutorial amb 3 passos
 */
function showTutorial() {
  const overlay = document.createElement('div');
  overlay.className = 'tutorial-overlay';

  const steps = [
    { icon: '🎨', text: t('tutorial.step1') },
    { icon: '💥', text: t('tutorial.step2') },
    { icon: '✨', text: t('tutorial.step3') }
  ];

  // Contenidor principal
  const box = document.createElement('div');
  box.className = 'tutorial-box';

  // Passos
  const stepsRow = document.createElement('div');
  stepsRow.className = 'tutorial-steps';

  steps.forEach((step, i) => {
    const el = document.createElement('div');
    el.className = 'tutorial-step';
    el.style.animationDelay = `${0.15 + i * 0.2}s`;

    const num = document.createElement('div');
    num.className = 'tutorial-num';
    num.textContent = i + 1;

    const icon = document.createElement('div');
    icon.className = 'tutorial-icon';
    icon.textContent = step.icon;

    const label = document.createElement('div');
    label.className = 'tutorial-label';
    label.textContent = step.text;

    el.appendChild(num);
    el.appendChild(icon);
    el.appendChild(label);
    stepsRow.appendChild(el);

    // Fletxa entre passos (excepte l'últim)
    if (i < steps.length - 1) {
      const arrow = document.createElement('div');
      arrow.className = 'tutorial-arrow';
      arrow.textContent = '→';
      arrow.style.animationDelay = `${0.25 + i * 0.2}s`;
      stepsRow.appendChild(arrow);
    }
  });

  box.appendChild(stepsRow);

  // Botó de tancar
  const btn = document.createElement('button');
  btn.className = 'tutorial-btn';
  btn.textContent = t('tutorial.skip');
  btn.addEventListener('click', () => dismiss(overlay));
  box.appendChild(btn);

  overlay.appendChild(box);

  // Tancar amb clic fora o Escape
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) dismiss(overlay);
  });
  const onKey = (e) => {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      dismiss(overlay);
      document.removeEventListener('keydown', onKey);
    }
  };
  document.addEventListener('keydown', onKey);

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));
}

/**
 * Tanca el tutorial i marca com a completat
 */
function dismiss(overlay) {
  localStorage.setItem(STORAGE_KEY, '1');
  overlay.classList.remove('active');
  setTimeout(() => overlay.remove(), 400);
}
