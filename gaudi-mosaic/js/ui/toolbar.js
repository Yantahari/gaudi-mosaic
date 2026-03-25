// =====================================================
// GAUDÍ MOSAIC — Barra d'eines inferior
// Eines de composició, fons i controls
// =====================================================

import { getState, setState, emit, subscribe,
         clearCanvas, duplicatePiece, undo } from '../state.js';
import { render, resetZoom } from '../engine/canvas.js';
import { BACKGROUNDS } from '../data/palettes.js';

/**
 * Inicialitza la barra d'eines
 */
export function initToolbar() {
  setupTools();
  setupBackgroundButtons();
  setupGroutControls();
  setupHeaderActions();
  setupFragmentsTray();
}

/**
 * Configura els botons d'eines
 */
function setupTools() {
  const toolButtons = {
    toolMove: 'move',
    toolRotate: 'rotate',
    toolScale: 'scale',
    toolDelete: 'delete',
    toolPan: 'pan'
  };

  Object.entries(toolButtons).forEach(([btnId, tool]) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    btn.addEventListener('click', () => {
      setActiveTool(tool);
    });
  });
}

/**
 * Estableix l'eina activa
 */
export function setActiveTool(tool) {
  setState('currentTool', tool);

  // Actualitzar UI
  document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
  const toolMap = { move: 'toolMove', rotate: 'toolRotate', scale: 'toolScale', delete: 'toolDelete', pan: 'toolPan' };
  const activeBtn = document.getElementById(toolMap[tool]);
  if (activeBtn) activeBtn.classList.add('active');

  // Canviar cursor
  const canvas = document.getElementById('mosaicCanvas');
  if (canvas) {
    const cursors = {
      move: 'default',
      rotate: 'crosshair',
      scale: 'nwse-resize',
      delete: 'not-allowed',
      pan: 'grab'
    };
    canvas.style.cursor = cursors[tool] || 'default';
  }
}

/**
 * Configura els botons de fons
 */
function setupBackgroundButtons() {
  BACKGROUNDS.forEach(bg => {
    const btn = document.getElementById(`bg-${bg.id}`);
    if (!btn) return;

    btn.style.backgroundColor = bg.color;
    btn.addEventListener('click', () => {
      setState('canvasBg', bg.color);
      // Marcar actiu
      document.querySelectorAll('.bg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
  });
}

/**
 * Configura els controls del rejunt
 */
function setupGroutControls() {
  const toggle = document.getElementById('groutToggle');
  if (toggle) {
    toggle.addEventListener('change', (e) => {
      const state = getState();
      state.grout.enabled = e.target.checked;
      render();
    });
  }

  const colorPicker = document.getElementById('groutColor');
  if (colorPicker) {
    colorPicker.addEventListener('input', (e) => {
      const state = getState();
      state.grout.color = e.target.value;
      render();
    });
  }

  const widthSlider = document.getElementById('groutWidth');
  if (widthSlider) {
    widthSlider.addEventListener('input', (e) => {
      const state = getState();
      state.grout.width = parseInt(e.target.value);
      render();
    });
  }
}

/**
 * Configura les accions de la capçalera
 */
function setupHeaderActions() {
  // Netejar
  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (getState().placedPieces.length > 0) {
        clearCanvas();
      }
    });
  }

  // Desfer
  const undoBtn = document.getElementById('undoBtn');
  if (undoBtn) {
    undoBtn.addEventListener('click', () => undo());
  }

  // Exportar
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => emit('export:png'));
  }

  // Guardar
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => emit('project:save'));
  }

  // Carregar
  const loadBtn = document.getElementById('loadBtn');
  if (loadBtn) {
    loadBtn.addEventListener('click', () => emit('project:load'));
  }

  // Contingut educatiu i guia d'ús (unificats en un sol botó)
  const eduBtn = document.getElementById('eduBtn');
  if (eduBtn) {
    eduBtn.addEventListener('click', () => emit('modal:education'));
  }

  // Reset zoom
  const zoomResetBtn = document.getElementById('zoomReset');
  if (zoomResetBtn) {
    zoomResetBtn.addEventListener('click', resetZoom);
  }

  // Duplicar
  const dupBtn = document.getElementById('toolDuplicate');
  if (dupBtn) {
    dupBtn.addEventListener('click', () => {
      const state = getState();
      if (state.selectedPiece !== null) {
        duplicatePiece(state.selectedPiece);
      }
    });
  }
}

/**
 * Configura la safata de fragments
 */
function setupFragmentsTray() {
  // En mòbil, moure la safata fora de canvas-area perquè sigui visible
  // independentment de quina vista estigui activa (canvas-area té display:none)
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (isMobile) {
    const tray = document.getElementById('fragmentsTray');
    if (tray) {
      document.getElementById('app').appendChild(tray);
    }
  }
  subscribe('fragments:update', updateFragmentsTray);
}

/**
 * Actualitza la safata de fragments
 */
export function updateFragmentsTray() {
  const tray = document.getElementById('fragmentsTray');
  if (!tray) return;

  const state = getState();

  // Eliminar miniatures anteriors (mantenir l'etiqueta)
  tray.querySelectorAll('.fragment-thumb').forEach(el => el.remove());

  if (state.fragments.length === 0) {
    tray.classList.add('hidden');
    return;
  }

  tray.classList.remove('hidden');

  state.fragments.forEach((frag, idx) => {
    const thumb = document.createElement('div');
    thumb.className = 'fragment-thumb';
    thumb.setAttribute('role', 'button');
    thumb.setAttribute('aria-label', `Fragment ${idx + 1}`);

    const tc = document.createElement('canvas');
    tc.width = 48;
    tc.height = 48;
    tc.getContext('2d').drawImage(frag.canvas, 0, 0, 48, 48);
    thumb.appendChild(tc);

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      // Mòbil: tap per col·locar al centre del llenç
      thumb.addEventListener('click', () => placeTrayFragmentAtCenter(idx));
    } else {
      // Desktop: arrossegar des de la safata
      thumb.addEventListener('mousedown', (e) => startDragFromTray(e, idx));
      thumb.addEventListener('touchstart', (e) => startDragFromTray(e, idx), { passive: false });
    }

    tray.appendChild(thumb);
  });
}

/**
 * Col·loca un fragment de la safata al centre del llenç (mòbil)
 */
function placeTrayFragmentAtCenter(fragIdx) {
  const state = getState();
  const frag = state.fragments[fragIdx];
  if (!frag) return;

  const mosaicCanvas = document.getElementById('mosaicCanvas');
  if (!mosaicCanvas) return;

  const { transform } = state;
  const scale = Math.min(80 / frag.w, 80 / frag.h, 1);

  // Centre del viewport en coordenades del món
  const cx = (mosaicCanvas.width / 2 - transform.offsetX) / transform.scale;
  const cy = (mosaicCanvas.height / 2 - transform.offsetY) / transform.scale;

  // Treure de la safata
  state.fragments.splice(fragIdx, 1);
  updateFragmentsTray();

  // Offset aleatori perquè les peces no s'apilin al centre
  const spread = 60;
  const ox = (Math.random() - 0.5) * spread;
  const oy = (Math.random() - 0.5) * spread;

  emit('piece:add', {
    canvas: frag.canvas,
    x: cx - (frag.w * scale) / 2 + ox,
    y: cy - (frag.h * scale) / 2 + oy,
    w: frag.w * scale,
    h: frag.h * scale,
    polygon: frag.polygon || []
  });
}

/**
 * Inicia l'arrossegament d'un fragment des de la safata
 */
function startDragFromTray(e, fragIdx) {
  e.preventDefault();
  const state = getState();
  const frag = state.fragments[fragIdx];
  state.isDraggingFromTray = true;

  const scale = Math.min(80 / frag.w, 80 / frag.h, 1);
  state.dragFragment = {
    canvas: frag.canvas,
    x: 0, y: 0,
    w: frag.w * scale,
    h: frag.h * scale,
    polygon: frag.polygon || []
  };

  const mosaicCanvas = document.getElementById('mosaicCanvas');

  const onMove = (ev) => {
    const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
    const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
    const rect = mosaicCanvas.getBoundingClientRect();
    state.dragFragment.x = clientX - rect.left - state.dragFragment.w / 2;
    state.dragFragment.y = clientY - rect.top - state.dragFragment.h / 2;
    render();
  };

  const onUp = (ev) => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onUp);

    if (state.isDraggingFromTray && state.dragFragment) {
      const rect = mosaicCanvas.getBoundingClientRect();
      const clientX = ev.changedTouches ? ev.changedTouches[0].clientX : ev.clientX;
      const clientY = ev.changedTouches ? ev.changedTouches[0].clientY : ev.clientY;

      if (clientX >= rect.left && clientX <= rect.right &&
          clientY >= rect.top && clientY <= rect.bottom) {
        // Col·locar la peça al llenç
        const { transform } = state;
        const wx = (state.dragFragment.x - transform.offsetX) / transform.scale;
        const wy = (state.dragFragment.y - transform.offsetY) / transform.scale;

        // IMPORTANT: treure de la safata ABANS d'afegir al llenç
        // per evitar que una excepció a addPiece impedeixi el splice
        state.fragments.splice(fragIdx, 1);
        updateFragmentsTray();

        emit('piece:add', {
          canvas: state.dragFragment.canvas,
          x: wx,
          y: wy,
          w: state.dragFragment.w,
          h: state.dragFragment.h,
          polygon: state.dragFragment.polygon || []
        });
      }
    }

    state.isDraggingFromTray = false;
    state.dragFragment = null;
    render();
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend', onUp);
}
