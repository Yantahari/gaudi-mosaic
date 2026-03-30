// =====================================================
// GAUDÍ MOSAIC — Trencadís Creator
// Punt d'entrada principal de l'aplicació
//
// "L'originalitat consisteix a tornar a l'origen."
// — Antoni Gaudí
// =====================================================

import { getState, subscribe, emit, addPiece, removePiece, duplicatePiece, undo, clearCanvas } from './state.js';
import { initCanvas, render, resetZoom } from './engine/canvas.js';
import { initSplash } from './ui/splash.js';
import { initPanels, initMobilePanel, rebuildDynamicUI } from './ui/panels.js';
import { initToolbar, updateFragmentsTray, setActiveTool } from './ui/toolbar.js';
import { initBreakZone } from './ui/breakzone.js';
import { initModals } from './ui/modals.js';
import { initStorage } from './utils/storage.js';
import { initExport } from './utils/export.js';
import { initTutorial } from './ui/tutorial.js';
import { initI18n, t, setLanguage, getCurrentLang, getAvailableLanguages } from './i18n/i18n.js';

/**
 * Inicialització principal de l'aplicació
 */
function init() {
  // Inicialitzar sistema i18n PRIMER
  initI18n();

  // Traduir el DOM estàtic
  translateDOM();

  // Inicialitzar mòduls
  initSplash();
  initCanvas();
  initPanels();
  initToolbar();
  initBreakZone();
  initModals();
  initStorage();
  initExport();
  initTutorial();
  initMobilePanel();

  // Selector d'idioma
  setupLanguageSelector();

  // Sistema de notificacions
  setupNotifications();

  // Dreceres de teclat
  setupKeyboardShortcuts();

  // Event d'afegir peça des de la safata
  subscribe('piece:add', (piece) => addPiece(piece));

  // Easter egg: cita aleatòria en fer doble clic al logo
  setupEasterEgg();

  // Inicialitzar la safata
  subscribe('app:ready', () => {
    updateFragmentsTray();
    const canvas = document.getElementById('mosaicCanvas');
    if (canvas) {
      const state = getState();
      state.transform.offsetX = 0;
      state.transform.offsetY = 0;
      render();
    }
  });

  // Reaccionar a canvis d'idioma
  window.addEventListener('languagechange', () => {
    translateDOM();
    rebuildDynamicUI();
    setupLanguageSelector();
  });
}

/**
 * Tradueix tots els elements del DOM que tenen atributs data-i18n
 */
function translateDOM() {
  // Text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val !== key) el.textContent = val;
  });

  // Títols (tooltip)
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const val = t(key);
    if (val !== key) el.title = val;
  });

  // Aria-labels
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    const val = t(key);
    if (val !== key) el.setAttribute('aria-label', val);
  });
}

/**
 * Crea el selector d'idioma a la capçalera
 */
function setupLanguageSelector() {
  const container = document.getElementById('langSelector');
  if (!container) return;

  container.innerHTML = '';
  const langs = getAvailableLanguages();
  const current = getCurrentLang();

  langs.forEach(lang => {
    const btn = document.createElement('button');
    btn.className = `lang-btn ${lang.lang === current ? 'active' : ''}`;
    btn.textContent = lang.flag;
    btn.title = lang.name;
    btn.setAttribute('aria-label', lang.name);
    btn.addEventListener('click', () => {
      if (lang.lang === current) return;
      setLanguage(lang.lang);
      emit('notify', t('notify.langChanged', { name: lang.name }));
    });
    container.appendChild(btn);
  });
}

/**
 * Sistema de notificacions toast
 */
function setupNotifications() {
  const el = document.getElementById('notification');
  let timeout = null;

  subscribe('notify', (msg) => {
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      el.classList.remove('show');
    }, 2500);
  });
}

/**
 * Dreceres de teclat
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' ||
        e.target.tagName === 'SELECT') return;

    const splash = document.getElementById('splash');
    if (splash && !splash.classList.contains('hidden')) return;
    if (document.querySelector('.modal-overlay')) return;

    const state = getState();

    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      undo();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      if (state.selectedPiece !== null) {
        duplicatePiece(state.selectedPiece);
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      emit('project:save');
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
      e.preventDefault();
      emit('project:load');
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      emit('export:png');
      return;
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (state.selectedPiece !== null) {
        e.preventDefault();
        removePiece(state.selectedPiece);
        emit('notify', t('notify.fragmentDeleted'));
      }
      return;
    }

    if (e.key === ' ' && !e.repeat) {
      e.preventDefault();
      state._prevTool = state.currentTool;
      setActiveTool('pan');
      return;
    }

    if (e.key === 'v' || e.key === 'V') { setActiveTool('move'); return; }
    if (e.key === 'r' || e.key === 'R') { setActiveTool('rotate'); return; }
    if (e.key === 's' && !e.ctrlKey && !e.metaKey) { setActiveTool('scale'); return; }
    if (e.key === 'x' || e.key === 'X') { setActiveTool('delete'); return; }
    if (e.key === '?') { emit('modal:help'); return; }

    if (e.key === 'g' || e.key === 'G') {
      state.showGrid = !state.showGrid;
      render();
      emit('notify', state.showGrid ? t('notify.gridOn') : t('notify.gridOff'));
      return;
    }

    if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      resetZoom();
      emit('notify', t('notify.zoomReset'));
      return;
    }

    if (e.key === '+' || e.key === '=') {
      state.transform.scale = Math.min(state.transform.scale * 1.2, 5);
      render();
      return;
    }
    if (e.key === '-') {
      state.transform.scale = Math.max(state.transform.scale / 1.2, 0.2);
      render();
      return;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      if (state.selectedPiece !== null) {
        e.preventDefault();
        const piece = state.placedPieces[state.selectedPiece];
        if (piece) {
          const step = e.shiftKey ? 10 : 1;
          if (e.key === 'ArrowUp') piece.y -= step;
          if (e.key === 'ArrowDown') piece.y += step;
          if (e.key === 'ArrowLeft') piece.x -= step;
          if (e.key === 'ArrowRight') piece.x += step;
          render();
        }
      } else if (state.placedPieces.length > 0) {
        emit('notify', t('notify.selectFragment'));
      }
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === ' ') {
      const state = getState();
      if (state._prevTool) {
        setActiveTool(state._prevTool);
        state._prevTool = null;
      }
    }
  });
}

/**
 * Easter egg: cita aleatòria de Gaudí
 */
function setupEasterEgg() {
  const brand = document.querySelector('.header-brand');
  if (!brand) return;

  brand.addEventListener('dblclick', () => {
    const quotes = t('education.quotes');
    if (Array.isArray(quotes)) {
      const cita = quotes[Math.floor(Math.random() * quotes.length)];
      emit('notify', `"${cita}" — Gaudí`);
    }
  });
}

// ---- PWA: Service Worker + instal·lació ----

/** Registra el Service Worker per funcionar offline */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.register('./sw.js')
    .then(reg => {
      console.log('[PWA] Service Worker registrat, scope:', reg.scope);
      // Avisar quan hi ha una actualització disponible
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            emit('notify', t('pwa.updated'));
          }
        });
      });
    })
    .catch(err => {
      console.error('[PWA] Error registrant Service Worker:', err);
    });
}

/** Gestiona l'estat online/offline */
function setupOfflineIndicator() {
  // L'event 'online' només es dispara quan es recupera la connexió,
  // i 'offline' quan es perd — no cal verificar navigator.onLine.
  window.addEventListener('offline', () => emit('notify', t('pwa.offline')));
  window.addEventListener('online', () => emit('notify', t('pwa.online')));
}

/** Captura l'event d'instal·lació PWA */
let deferredInstallPrompt = null;

function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    // Mostrem un botó d'instal·lació subtil a la capçalera
    showInstallButton();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    hideInstallButton();
    emit('notify', t('pwa.installed'));
  });
}

function showInstallButton() {
  // Afegir botó d'instal·lació a les accions de capçalera
  const actions = document.querySelector('.header-actions');
  if (!actions || document.getElementById('installBtn')) return;

  const sep = document.createElement('div');
  sep.className = 'header-sep';
  sep.id = 'installSep';

  const btn = document.createElement('button');
  btn.className = 'header-btn';
  btn.id = 'installBtn';
  btn.textContent = t('pwa.install');
  btn.title = t('pwa.installTitle');
  btn.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const result = await deferredInstallPrompt.userChoice;
    if (result.outcome === 'accepted') {
      deferredInstallPrompt = null;
    }
  });

  // Inserir abans del selector d'idioma
  const langSelector = document.getElementById('langSelector');
  if (langSelector) {
    actions.insertBefore(sep, langSelector);
    actions.insertBefore(btn, langSelector);
  } else {
    actions.appendChild(sep);
    actions.appendChild(btn);
  }
}

function hideInstallButton() {
  const btn = document.getElementById('installBtn');
  const sep = document.getElementById('installSep');
  if (btn) btn.remove();
  if (sep) sep.remove();
}

// Iniciar l'aplicació quan el DOM estigui llest
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Registrar SW després de la càrrega (no bloquejar el render)
window.addEventListener('load', () => {
  registerServiceWorker();
  setupOfflineIndicator();
  setupInstallPrompt();
});
