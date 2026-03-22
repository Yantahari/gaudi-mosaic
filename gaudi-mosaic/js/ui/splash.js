// =====================================================
// GAUDÍ MOSAIC — Pantalla de benvinguda
// Mosaic animat generatiu com a primera impressió
// =====================================================

import { getState, emit } from '../state.js';
import { t, setLanguage, getCurrentLang, getAvailableLanguages } from '../i18n/i18n.js';

/**
 * Inicialitza la pantalla de benvinguda amb un mosaic generatiu
 */
export function initSplash() {
  createSplashMosaic();
  createSplashLangSelector();
  updateSplashQuote();

  const enterBtn = document.getElementById('enterBtn');
  if (enterBtn) {
    enterBtn.addEventListener('click', hideSplash);
  }

  // Reaccionar a canvis d'idioma des de la pròpia splash
  window.addEventListener('languagechange', () => {
    updateSplashQuote();
    createSplashLangSelector();
  });
}

/**
 * Crea el selector d'idioma a la splash screen
 */
function createSplashLangSelector() {
  const container = document.getElementById('splashLang');
  if (!container) return;

  container.innerHTML = '';
  const langs = getAvailableLanguages();
  const current = getCurrentLang();

  langs.forEach(lang => {
    const btn = document.createElement('button');
    btn.className = `splash-lang-btn${lang.lang === current ? ' active' : ''}`;
    btn.setAttribute('aria-label', lang.name);

    const flag = document.createElement('span');
    flag.className = 'splash-lang-flag';
    flag.textContent = lang.flag;
    btn.appendChild(flag);

    const label = document.createTextNode(lang.lang.toUpperCase());
    btn.appendChild(label);

    btn.addEventListener('click', () => {
      if (lang.lang === current) return;
      setLanguage(lang.lang);
    });
    container.appendChild(btn);
  });
}

/**
 * Mostra una cita aleatòria de Gaudí a la splash
 */
function updateSplashQuote() {
  const citaEl = document.getElementById('splashCita');
  if (!citaEl) return;
  const quotes = t('education.quotes');
  if (Array.isArray(quotes)) {
    const cita = quotes[Math.floor(Math.random() * quotes.length)];
    citaEl.textContent = `«${cita}»`;
  }
}

/**
 * Crea un mosaic animat generatiu per la splash screen
 */
function createSplashMosaic() {
  const container = document.getElementById('splashMosaic');
  if (!container) return;

  const colors = [
    '#D4A843', '#2E6B8A', '#1A8A7D', '#D4763A',
    '#B84233', '#4A7C59', '#E8DCC8', '#8B6914',
    '#4A9BB5', '#C4956A', '#6BB5A0', '#967544'
  ];

  const pieces = [
    { x: 0, y: 0, w: 55, h: 50, r: -3 },
    { x: 58, y: 5, w: 58, h: 48, r: 2 },
    { x: 5, y: 53, w: 50, h: 55, r: 1 },
    { x: 57, y: 55, w: 60, h: 52, r: -2 },
    { x: 20, y: 20, w: 35, h: 35, r: 5 },
    { x: 70, y: 25, w: 30, h: 40, r: -4 },
    { x: 10, y: 70, w: 45, h: 35, r: 3 },
    { x: 65, y: 72, w: 40, h: 38, r: -1 }
  ];

  pieces.forEach((p, i) => {
    const el = document.createElement('div');
    el.className = 'splash-piece';
    el.style.cssText = `
      left: ${p.x}px; top: ${p.y}px;
      width: ${p.w}px; height: ${p.h}px;
      background: ${colors[i % colors.length]};
      transform: rotate(${p.r}deg);
      opacity: ${0.7 + Math.random() * 0.3};
      animation-delay: ${i * 0.1}s;
      clip-path: polygon(
        ${5 + Math.random() * 15}% ${Math.random() * 10}%,
        ${85 + Math.random() * 15}% ${5 + Math.random() * 10}%,
        ${90 + Math.random() * 10}% ${85 + Math.random() * 15}%,
        ${Math.random() * 15}% ${90 + Math.random() * 10}%
      );
    `;
    container.appendChild(el);
  });
}

/**
 * Amaga la splash screen amb animació
 */
function hideSplash() {
  const splash = document.getElementById('splash');
  const app = document.getElementById('app');

  if (splash) {
    splash.classList.add('hidden');
  }

  setTimeout(() => {
    if (app) {
      app.classList.add('active');
    }
    emit('app:ready');
    emit('canvas:render');
  }, 400);
}
