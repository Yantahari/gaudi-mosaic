// =====================================================
// GAUDÍ MOSAIC — Gestió d'estat centralitzada (pub/sub)
// =====================================================

import { generateId } from './utils/helpers.js';
import { t } from './i18n/i18n.js';

// Estat global de l'aplicació
const state = {
  // Ceràmica seleccionada
  selectedCeramic: null,

  // Zona de trencament
  brokenFragments: [],
  fractureType: 'voronoi', // voronoi, radial, organic
  fractureGranularity: 0.5, // 0 = fi, 1 = gruixut
  ceramicType: 'glazed', // glazed, matte, iridescent, rustic

  // Fragments a la safata
  fragments: [],

  // Peces col·locades al llenç
  placedPieces: [],

  // Capes
  layers: [
    { id: 'default', name: 'Capa 1', visible: true, locked: false }
  ],
  activeLayer: 'default',

  // Eines
  currentTool: 'move', // move, rotate, scale, delete, pan
  selectedPiece: null,
  dragOffset: { x: 0, y: 0 },
  isDragging: false,
  isDraggingFromTray: false,
  dragFragment: null,

  // Transformació del llenç (zoom/pan)
  transform: {
    offsetX: 0,
    offsetY: 0,
    scale: 1.0
  },

  // Llenç
  canvasBg: '#1C1914',
  showGrid: true,
  gridSize: 30,
  snapToGrid: false,

  // Rejunt (grout)
  grout: {
    enabled: false,
    color: '#B5A898',
    width: 2
  },

  // Plantilla activa
  activeTemplate: null,
  templateOpacity: 0.15,
  templateScale: 1,

  // Historial (desfer)
  history: [],
  maxHistory: 50,

  // Interfície
  showSplash: true,
  activePanel: 'ceramics', // ceramics, layers, templates
  showEducation: false,

  // Autoguardat
  projectName: null,
  lastSaved: null
};

// Sistema de subscripció (Observer pattern)
const listeners = new Map();

/**
 * Subscriu't a un event de l'estat
 * @param {string} event - Nom de l'event
 * @param {Function} fn - Funció callback
 * @returns {Function} Funció per cancel·lar la subscripció
 */
export function subscribe(event, fn) {
  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }
  listeners.get(event).add(fn);
  return () => listeners.get(event).delete(fn);
}

/**
 * Emet un event a tots els subscriptors
 */
export function emit(event, data) {
  if (listeners.has(event)) {
    listeners.get(event).forEach(fn => fn(data));
  }
}

/**
 * Retorna una còpia de l'estat actual
 */
export function getState() {
  return state;
}

/**
 * Actualitza l'estat i emet l'event corresponent
 */
export function setState(key, value) {
  state[key] = value;
  emit(`${key}:change`, value);
  emit('state:change', { key, value });
}

/**
 * Desa l'historial per poder desfer
 */
export function saveHistory() {
  // Serialitzar peces (sense canvas, que no es pot clonar amb JSON)
  const snapshot = state.placedPieces.map(p => ({
    ...p,
    canvasData: p.canvas.toDataURL('image/png', 0.8)
  }));
  state.history.push(JSON.stringify(snapshot));
  if (state.history.length > state.maxHistory) state.history.shift();
}

/**
 * Desfà l'última acció
 */
export function undo() {
  if (state.history.length === 0) return false;

  const snapshot = JSON.parse(state.history.pop());

  // Restaurar peces amb els seus canvas
  const promises = snapshot.map(p => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = p.w;
        canvas.height = p.h;
        canvas.getContext('2d').drawImage(img, 0, 0);
        resolve({ ...p, canvas, canvasData: undefined });
      };
      img.src = p.canvasData;
    });
  });

  Promise.all(promises).then(pieces => {
    state.placedPieces = pieces;
    state.selectedPiece = null;
    emit('canvas:render');
    emit('notify', t('notify.actionUndone'));
  });

  return true;
}

/**
 * Afegeix una peça al llenç
 */
export function addPiece(piece) {
  saveHistory();
  state.placedPieces.push({
    ...piece,
    id: generateId(),
    layer: state.activeLayer,
    rotation: piece.rotation || 0,
    scale: piece.scale || 1
  });
  emit('canvas:render');
  emit('pieces:change');
}

/**
 * Elimina una peça del llenç
 */
export function removePiece(index) {
  saveHistory();
  state.placedPieces.splice(index, 1);
  state.selectedPiece = null;
  emit('canvas:render');
  emit('pieces:change');
}

/**
 * Duplica una peça
 */
export function duplicatePiece(index) {
  const original = state.placedPieces[index];
  if (!original) return;

  saveHistory();

  // Clonar el canvas
  const newCanvas = document.createElement('canvas');
  newCanvas.width = original.canvas.width;
  newCanvas.height = original.canvas.height;
  newCanvas.getContext('2d').drawImage(original.canvas, 0, 0);

  const newPiece = {
    ...original,
    id: generateId(),
    canvas: newCanvas,
    x: original.x + 20,
    y: original.y + 20
  };

  state.placedPieces.push(newPiece);
  state.selectedPiece = state.placedPieces.length - 1;
  emit('canvas:render');
  emit('pieces:change');
  emit('notify', t('notify.fragmentDuplicated'));
}

/**
 * Substitueix totes les peces del llenç de cop. Usat pel
 * generador de mosaic des de foto (~2000 peces) on cridar
 * addPiece n vegades faria n snapshots d'historial = catàstrofe.
 *
 * Crea UN sol snapshot d'historial (l'estat anterior, perquè
 * l'undo retorni al llenç buit/anterior) i emet un sol render.
 */
export function replacePieces(newPieces) {
  saveHistory();
  state.placedPieces = newPieces.map(p => ({
    ...p,
    id: generateId(),
    layer: state.activeLayer,
    rotation: p.rotation || 0,
    scale: p.scale || 1
  }));
  state.selectedPiece = null;
  emit('canvas:render');
  emit('pieces:change');
}

/**
 * Neteja tot el llenç
 */
export function clearCanvas() {
  if (state.placedPieces.length === 0) return;
  saveHistory();
  state.placedPieces = [];
  state.selectedPiece = null;
  emit('canvas:render');
  emit('pieces:change');
  emit('notify', t('notify.canvasCleared'));
}

/**
 * Gestió de capes
 */
export function addLayer(name) {
  const layer = {
    id: generateId(),
    name: name || `Capa ${state.layers.length + 1}`,
    visible: true,
    locked: false
  };
  state.layers.push(layer);
  state.activeLayer = layer.id;
  emit('layers:change');
  return layer;
}

export function removeLayer(layerId) {
  if (state.layers.length <= 1) return;
  state.layers = state.layers.filter(l => l.id !== layerId);
  // Moure peces de la capa eliminada a la primera capa
  state.placedPieces.forEach(p => {
    if (p.layer === layerId) p.layer = state.layers[0].id;
  });
  if (state.activeLayer === layerId) {
    state.activeLayer = state.layers[0].id;
  }
  emit('layers:change');
  emit('canvas:render');
}

export function toggleLayerVisibility(layerId) {
  const layer = state.layers.find(l => l.id === layerId);
  if (layer) {
    layer.visible = !layer.visible;
    emit('layers:change');
    emit('canvas:render');
  }
}

export function reorderLayers(fromIndex, toIndex) {
  const [moved] = state.layers.splice(fromIndex, 1);
  state.layers.splice(toIndex, 0, moved);
  emit('layers:change');
  emit('canvas:render');
}
