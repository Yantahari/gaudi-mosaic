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
  setupEasterEggES();

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

  // Actualitzar meta tags SEO segons l'idioma actiu
  updateMetaTags();
}

/**
 * Actualitza els meta tags del <head> segons l'idioma actiu.
 * Permet que Google indexi el contingut correcte per cada idioma.
 */
function updateMetaTags() {
  const title = t('seo.title');
  const desc = t('seo.description');
  const ogTitle = t('seo.ogTitle');
  const ogDesc = t('seo.ogDescription');
  const ogImgAlt = t('seo.ogImageAlt');

  // Només actualitzar si la clau existeix (no és la clau literal)
  if (title !== 'seo.title') {
    document.title = title;
  }
  if (desc !== 'seo.description') {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = desc;
  }
  if (ogTitle !== 'seo.ogTitle') {
    const ogT = document.querySelector('meta[property="og:title"]');
    if (ogT) ogT.content = ogTitle;
    const twT = document.querySelector('meta[name="twitter:title"]');
    if (twT) twT.content = ogTitle;
  }
  if (ogDesc !== 'seo.ogDescription') {
    const ogD = document.querySelector('meta[property="og:description"]');
    if (ogD) ogD.content = ogDesc;
    const twD = document.querySelector('meta[name="twitter:description"]');
    if (twD) twD.content = ogDesc;
  }
  if (ogImgAlt !== 'seo.ogImageAlt') {
    const ogA = document.querySelector('meta[property="og:image:alt"]');
    if (ogA) ogA.content = ogImgAlt;
    const twA = document.querySelector('meta[name="twitter:image:alt"]');
    if (twA) twA.content = ogImgAlt;
  }

  // Actualitzar canonical URL segons l'idioma actiu
  const currentLang = getCurrentLang();
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    if (currentLang && currentLang !== 'ca') {
      canonicalLink.href = `https://gaudimosaic.art/?lang=${currentLang}`;
    } else {
      canonicalLink.href = 'https://gaudimosaic.art/';
    }
  }
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
 * Easter egg: modal quan l'usuari tria castellà
 */
function setupEasterEggES() {
  window.addEventListener('easteregg:lang', () => {
    // Si ja existeix el modal, no crear-ne un altre
    if (document.getElementById('easterEggModal')) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'easterEggModal';
    overlay.style.zIndex = '1100'; // sobre la splash (z-index: 1000)

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = 'max-width:600px; padding:0; overflow-y:auto;';

    modal.innerHTML = `
      <div style="padding:40px 32px; text-align:center;">
        <p style="font-family:'Playfair Display',serif; font-size:28px; font-style:italic; color:#D4A843; line-height:1.3; margin-bottom:8px;">
          «Sóc català i parlaré en català.»
        </p>
        <p style="font-size:13px; color:rgba(245,236,215,0.5); margin-bottom:32px;">
          — Antoni Gaudí, 11 de setembre de 1924
        </p>

        <!-- Retall de diari de l'arrest de Gaudí, 1924 -->
        <div style="width:100%; height:1px; background:rgba(212,168,67,0.15); margin:0 auto 28px;"></div>

        <div style="text-align:left; font-family:'DM Sans',sans-serif; font-size:14px; color:rgba(245,236,215,0.8); line-height:1.7;">
          <p style="margin-bottom:16px;">
            El 11 de septiembre de 1924 — Diada Nacional de Catalunya — Antoni Gaudí, de 72 años, fue detenido por la policía durante una manifestación. Cuando los agentes le exigieron que hablara en castellano, Gaudí se negó rotundamente.
          </p>
          <p style="margin-bottom:16px;">
            Fue llevado a comisaría y solo quedó en libertad tras el pago de una fianza. El episodio tuvo amplia repercusión en la prensa de la época.
          </p>
          <p style="margin-bottom:16px;">
            Para Gaudí, el catalán no era solo un idioma — era parte inseparable de su identidad, de su arte y de su visión del mundo. La misma pasión que ponía en cada mosaico, en cada curva de la Sagrada Família, la ponía en defender su lengua.
          </p>

          <div style="width:100%; height:1px; background:rgba(212,168,67,0.15); margin:20px auto;"></div>

          <p style="margin-bottom:16px; color:rgba(245,236,215,0.6);">
            Hoy, un siglo después, el catalán sigue siendo una lengua amenazada. A pesar de ser hablada por más de 10 millones de personas, su presencia en la educación, los medios y la vida pública se ve continuamente cuestionada.
          </p>

          <div style="width:100%; height:1px; background:rgba(212,168,67,0.15); margin:20px auto;"></div>

          <p style="margin-bottom:8px;">
            Esta aplicación está hecha en catalán — la lengua de Gaudí.
          </p>
          <p style="margin-bottom:8px;">
            Dado que el catalán y el castellano son lenguas hermanas, te invitamos a explorarla en catalán. Creemos que entenderás la mayor parte, y de paso, descubrirás una lengua con una rica tradición literaria y cultural.
          </p>
          <p style="color:#D4A843; font-style:italic;">
            Es lo que habría querido el maestro.
          </p>
        </div>

        <div style="display:flex; gap:12px; justify-content:center; margin-top:28px; flex-wrap:wrap;">
          <button id="eeCA" style="padding:12px 28px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; background:#D4A843; color:#1C1914; border:none; border-radius:4px; cursor:pointer; letter-spacing:0.5px;">
            Endavant, en català
          </button>
          <button id="eeEN" style="padding:12px 28px; font-family:'DM Sans',sans-serif; font-size:13px; background:transparent; color:rgba(245,236,215,0.5); border:1px solid rgba(245,236,215,0.2); border-radius:4px; cursor:pointer;">
            English version
          </button>
        </div>
      </div>
    `;

    overlay.appendChild(modal);

    // Tancar amb clic al fons
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    // Botons
    modal.querySelector('#eeCA').addEventListener('click', () => {
      overlay.remove();
      setLanguage('ca');
      translateDOM();
      emit('notify', t('notify.langChanged', { name: 'Català' }));
    });
    modal.querySelector('#eeEN').addEventListener('click', () => {
      overlay.remove();
      setLanguage('en');
      translateDOM();
      emit('notify', t('notify.langChanged', { name: 'English' }));
    });

    // Escape per tancar
    const onKey = (e) => {
      if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onKey); }
    };
    document.addEventListener('keydown', onKey);

    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 10);
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

// ---- GDPR: consentiment de cookies + GA4 condicional ----

const CONSENT_KEY = 'gaudi-mosaic-cookies-consent';
const GA_ID = 'G-8K62JMVDNQ';

/** Carrega GA4 dinàmicament (només si l'usuari ha acceptat) */
function carregarAnalytics() {
  if (document.querySelector(`script[src*="${GA_ID}"]`)) return; // ja carregat
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', GA_ID);
}

/** Inicialitza el banner de consentiment */
function setupCookieConsent() {
  const consent = localStorage.getItem(CONSENT_KEY);
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;

  // Si ja ha decidit, aplicar sense mostrar banner
  if (consent === 'accepted') {
    carregarAnalytics();
    return;
  }
  if (consent === 'rejected') {
    return;
  }

  // Mostrar banner quan l'splash desapareix (no abans — splash té z-index 1000)
  const splash = document.getElementById('splash');
  const mostrarBanner = () => { banner.style.display = 'flex'; };

  if (splash && !splash.classList.contains('hidden')) {
    // Observar quan la splash s'amaga
    const obs = new MutationObserver(() => {
      if (splash.classList.contains('hidden')) {
        obs.disconnect();
        setTimeout(mostrarBanner, 500);
      }
    });
    obs.observe(splash, { attributes: true, attributeFilter: ['class'] });
  } else {
    // Splash ja amagada (o no existeix) — mostrar després d'1 segon
    setTimeout(mostrarBanner, 1000);
  }

  document.getElementById('cookieAccept')?.addEventListener('click', () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    carregarAnalytics();
    banner.style.display = 'none';
  });

  document.getElementById('cookieReject')?.addEventListener('click', () => {
    localStorage.setItem(CONSENT_KEY, 'rejected');
    banner.style.display = 'none';
  });
}

/** Permet restablir el consentiment (des de la secció de privacitat) */
export function restablirConsentiment() {
  localStorage.removeItem(CONSENT_KEY);
  const banner = document.getElementById('cookieBanner');
  if (banner) {
    banner.style.display = 'flex';
  }
}

// Registrar SW i cookies després de la càrrega (no bloquejar el render)
window.addEventListener('load', () => {
  registerServiceWorker();
  setupOfflineIndicator();
  setupInstallPrompt();
  setupCookieConsent();
});
