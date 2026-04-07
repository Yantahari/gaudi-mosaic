// =====================================================
// GAUDÍ MOSAIC — Sistema d'internacionalització (i18n)
// Gestió d'idiomes amb localStorage i events
// =====================================================

import ca from './ca.js';
import en from './en.js';
import ja from './ja.js';
import es from './es.js';

const STORAGE_KEY = 'gaudi-mosaic-lang';

// Idiomes disponibles (es inclòs per mostrar el botó, però té easter egg)
const AVAILABLE_LANGS = { ca, en, ja, es };

// Idioma actiu
let currentLang = ca;

/**
 * Inicialitza el sistema i18n.
 * Carrega l'idioma guardat a localStorage o usa el per defecte (català).
 */
export function initI18n() {
  // 1. Prioritzar ?lang= de la URL (per a indexació de cercadors)
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');
  if (urlLang && AVAILABLE_LANGS[urlLang] && !AVAILABLE_LANGS[urlLang].meta.hasEasterEgg) {
    currentLang = AVAILABLE_LANGS[urlLang];
    localStorage.setItem(STORAGE_KEY, urlLang);
  } else {
    // 2. Fallback a localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && AVAILABLE_LANGS[saved]) {
      currentLang = AVAILABLE_LANGS[saved];
    }
  }
  document.documentElement.lang = currentLang.meta.lang;
}

/**
 * Obté una traducció per clau amb notació de punt.
 * Exemple: t('panels.ceramics') → 'Ceràmiques'
 * Suporta interpolació: t('notify.templateActive', { name: 'Drac' })
 * @param {string} key - Clau amb punts (ex: 'header.save')
 * @param {Object} [params] - Paràmetres d'interpolació
 * @returns {string|Array|Object} El valor traduït o la clau si no es troba
 */
export function t(key, params) {
  const parts = key.split('.');
  let value = currentLang;

  for (const part of parts) {
    if (value == null || typeof value !== 'object') return key;
    value = value[part];
  }

  if (value == null) return key;

  // Interpolació de paràmetres {name}, {count}, etc.
  if (typeof value === 'string' && params) {
    return value.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`);
  }

  return value;
}

/**
 * Canvia l'idioma actiu.
 * @param {string} langCode - Codi d'idioma ('ca', 'en')
 */
export function setLanguage(langCode) {
  if (!AVAILABLE_LANGS[langCode]) return;

  // Easter egg: si l'idioma té la marca, emetre event especial en lloc de canviar
  if (AVAILABLE_LANGS[langCode].meta.hasEasterEgg) {
    window.dispatchEvent(new CustomEvent('easteregg:lang', { detail: langCode }));
    return;
  }

  currentLang = AVAILABLE_LANGS[langCode];
  localStorage.setItem(STORAGE_KEY, langCode);
  document.documentElement.lang = langCode;

  window.dispatchEvent(new CustomEvent('languagechange', { detail: langCode }));
}

/**
 * Retorna el codi d'idioma actiu.
 * @returns {string}
 */
export function getCurrentLang() {
  return currentLang.meta.lang;
}

/**
 * Retorna la llista d'idiomes disponibles (amb meta).
 * @returns {Array<{lang, name, flag}>}
 */
export function getAvailableLanguages() {
  return Object.values(AVAILABLE_LANGS).map(l => l.meta);
}
