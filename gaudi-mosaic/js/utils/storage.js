// =====================================================
// GAUDÍ MOSAIC — Guardar i carregar projectes
// Persistència amb localStorage
// =====================================================

import { getState, emit, subscribe } from '../state.js';
import { t } from '../i18n/i18n.js';

const STORAGE_PREFIX = 'gaudi-mosaic-';
const MAX_STORAGE_WARNING = 4 * 1024 * 1024; // 4MB avís

/**
 * Inicialitza el sistema de persistència
 */
export function initStorage() {
  subscribe('project:save', saveProject);
  subscribe('project:load', showLoadDialog);

  // Autoguardat cada 60 segons
  setInterval(autoSave, 60000);
}

/**
 * Serialitza l'estat actual a JSON
 */
function serializeState() {
  const state = getState();
  const pieces = state.placedPieces.map(p => ({
    x: p.x,
    y: p.y,
    w: p.w,
    h: p.h,
    rotation: p.rotation,
    scale: p.scale,
    layer: p.layer,
    dataURL: p.canvas.toDataURL('image/png', 0.7)
  }));

  return {
    version: 2,
    name: state.projectName,
    date: new Date().toISOString(),
    canvasBg: state.canvasBg,
    grout: { ...state.grout },
    layers: state.layers.map(l => ({ ...l })),
    activeLayer: state.activeLayer,
    transform: { ...state.transform },
    showGrid: state.showGrid,
    gridSize: state.gridSize,
    pieces
  };
}

/**
 * Deserialitza un projecte guardat a l'estat
 */
async function deserializeState(data) {
  const state = getState();

  // Carregar peces (convertir dataURL a canvas)
  const pieces = await Promise.all(data.pieces.map(p => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = p.w;
        canvas.height = p.h;
        canvas.getContext('2d').drawImage(img, 0, 0);
        resolve({
          canvas,
          x: p.x, y: p.y,
          w: p.w, h: p.h,
          rotation: p.rotation || 0,
          scale: p.scale || 1,
          layer: p.layer || 'default'
        });
      };
      img.onerror = () => resolve(null);
      img.src = p.dataURL;
    });
  }));

  state.placedPieces = pieces.filter(Boolean);
  state.canvasBg = data.canvasBg || '#1C1914';
  state.projectName = data.name || null;

  if (data.grout) {
    state.grout = { ...state.grout, ...data.grout };
  }
  if (data.layers) {
    state.layers = data.layers;
    state.activeLayer = data.activeLayer || data.layers[0]?.id || 'default';
  }
  if (data.transform) {
    state.transform = { ...state.transform, ...data.transform };
  }
  if (data.showGrid !== undefined) state.showGrid = data.showGrid;
  if (data.gridSize) state.gridSize = data.gridSize;

  state.selectedPiece = null;
  state.history = [];

  emit('canvas:render');
  emit('layers:change');
}

/**
 * Guarda el projecte actual
 */
function saveProject() {
  const state = getState();

  let name = state.projectName;
  if (!name) {
    const input = prompt(t('dialogs.projectName'), t('dialogs.defaultProjectName'));
    if (input === null) return;
    name = input || t('dialogs.defaultProjectName');
    state.projectName = name;
  } else {
    // Ja té nom: oferir sobreescriure o guardar com a nou
    const key = STORAGE_PREFIX + 'project-' + slugify(name);
    if (localStorage.getItem(key)) {
      const overwrite = confirm(t('dialogs.overwrite', { name }));
      if (!overwrite) {
        const newName = prompt(t('dialogs.newProjectName'), t('dialogs.copyName', { name }));
        if (newName === null) return;
        name = newName || t('dialogs.copyName', { name });
        state.projectName = name;
      }
    }
  }

  try {
    const data = serializeState();
    const json = JSON.stringify(data);

    // Comprovar mida
    const sizeBytes = new Blob([json]).size;
    if (sizeBytes > MAX_STORAGE_WARNING) {
      const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(1);
      if (!confirm(t('dialogs.storageSizeWarning', { size: sizeMB }))) {
        return;
      }
    }

    const key = STORAGE_PREFIX + 'project-' + slugify(name);
    localStorage.setItem(key, json);

    // Actualitzar índex de projectes
    updateProjectIndex(name, key);

    state.lastSaved = new Date();
    emit('notify', t('notify.projectSaved', { name }));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      emit('notify', t('notify.storageFullError'));
    } else {
      emit('notify', t('notify.saveError'));
      console.error('Error guardant:', e);
    }
  }
}

/**
 * Mostra el diàleg de carregar projectes
 */
function showLoadDialog() {
  const projects = getProjectList();

  if (projects.length === 0) {
    emit('notify', t('notify.noProjects'));
    return;
  }

  // Crear llista de projectes
  const container = document.createElement('div');
  container.className = 'load-dialog';

  projects.forEach(project => {
    const item = document.createElement('div');
    item.className = 'load-item';

    const info = document.createElement('div');
    info.className = 'load-info';
    info.innerHTML = `
      <strong>${project.name}</strong>
      <small>${new Date(project.date).toLocaleDateString()} — ${project.pieces} ${t('dialogs.pieces')}</small>
    `;

    const actions = document.createElement('div');
    actions.className = 'load-actions';

    const loadBtn = document.createElement('button');
    loadBtn.className = 'load-btn';
    loadBtn.textContent = t('dialogs.loadBtn');
    loadBtn.addEventListener('click', () => {
      loadProject(project.key);
      // Tancar modal
      document.querySelector('.modal-overlay')?.remove();
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'load-del-btn';
    delBtn.textContent = '✕';
    delBtn.title = t('dialogs.deleteBtn');
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(t('dialogs.deleteProject', { name: project.name }))) {
        deleteProject(project.key);
        item.remove();
        emit('notify', t('notify.projectDeleted', { name: project.name }));
      }
    });

    actions.appendChild(loadBtn);
    actions.appendChild(delBtn);
    item.appendChild(info);
    item.appendChild(actions);
    container.appendChild(item);
  });

  // Mostrar com a modal
  emit('modal:custom', { content: container, title: 'Carregar projecte' });

  // Alternativament, si no hi ha sistema de modals genèric, mostrar inline
  showLoadModal(container);
}

/**
 * Mostra un modal amb el contingut de carregar
 */
function showLoadModal(content) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';

  const modal = document.createElement('div');
  modal.className = 'modal';

  const header = document.createElement('div');
  header.className = 'modal-header';
  header.innerHTML = `
    <h2 class="modal-title">${t('dialogs.loadProject')}</h2>
    <button class="modal-close" aria-label="${t('dialogs.close')}">✕</button>
  `;
  header.querySelector('.modal-close').addEventListener('click', () => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  });

  const body = document.createElement('div');
  body.className = 'modal-body';
  body.appendChild(content);

  modal.appendChild(header);
  modal.appendChild(body);
  overlay.appendChild(modal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
    }
  });

  document.body.appendChild(overlay);
}

/**
 * Carrega un projecte des de localStorage
 */
async function loadProject(key) {
  try {
    const json = localStorage.getItem(key);
    if (!json) {
      emit('notify', t('notify.projectNotFound'));
      return;
    }

    const data = JSON.parse(json);
    await deserializeState(data);
    emit('notify', t('notify.projectLoaded', { name: data.name }));
  } catch (e) {
    emit('notify', t('notify.loadError'));
    console.error('Error carregant:', e);
  }
}

/**
 * Elimina un projecte
 */
function deleteProject(key) {
  localStorage.removeItem(key);
  const indexJson = localStorage.getItem(STORAGE_PREFIX + 'index');
  if (indexJson) {
    const index = JSON.parse(indexJson);
    const filtered = index.filter(p => p.key !== key);
    localStorage.setItem(STORAGE_PREFIX + 'index', JSON.stringify(filtered));
  }
}

/**
 * Retorna la llista de projectes guardats
 */
function getProjectList() {
  const indexJson = localStorage.getItem(STORAGE_PREFIX + 'index');
  if (!indexJson) return [];

  try {
    return JSON.parse(indexJson);
  } catch {
    return [];
  }
}

/**
 * Actualitza l'índex de projectes
 */
function updateProjectIndex(name, key) {
  let index = getProjectList();
  const state = getState();

  // Actualitzar o afegir
  const existing = index.findIndex(p => p.key === key);
  const entry = {
    name,
    key,
    date: new Date().toISOString(),
    pieces: state.placedPieces.length
  };

  if (existing >= 0) {
    index[existing] = entry;
  } else {
    index.push(entry);
  }

  localStorage.setItem(STORAGE_PREFIX + 'index', JSON.stringify(index));
}

/**
 * Autoguardat
 */
function autoSave() {
  const state = getState();
  if (state.placedPieces.length === 0) return;

  try {
    const data = serializeState();
    data.name = t('notify.autoSaveName');
    const key = STORAGE_PREFIX + 'autosave';
    localStorage.setItem(key, JSON.stringify(data));

    // Actualitzar índex perquè aparegui a la llista de càrrega
    updateProjectIndex(t('notify.autoSaveName'), key);

    emit('notify', t('notify.autoSaved'));
  } catch {
    // Silenciós — l'autoguardat no ha de molestar
  }
}

/**
 * Converteix un nom a slug
 */
function slugify(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
