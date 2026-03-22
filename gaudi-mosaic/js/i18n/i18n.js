// =====================================================
// GAUDÍ MOSAIC — Sistema d'internacionalització (i18n)
// Gestió d'idiomes amb localStorage i events
// =====================================================

import ca from './ca.js';
import en from './en.js';

const STORAGE_KEY = 'gaudi-mosaic-lang';

// Idiomes disponibles (només els complets)
const AVAILABLE_LANGS = { ca, en };

// Idioma actiu
let currentLang = ca;

/**
 * Inicialitza el sistema i18n.
 * Carrega l'idioma guardat a localStorage o usa el per defecte (català).
 */
export function initI18n() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && AVAILABLE_LANGS[saved]) {
    currentLang = AVAILABLE_LANGS[saved];
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
  currentLang = AVAILABLE_LANGS[langCode];
  localStorage.setItem(STORAGE_KEY, langCode);
  document.documentElement.lang = langCode;

  // Emetre event perquè la UI es pugui actualitzar
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
