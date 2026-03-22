// =====================================================
// GAUDÍ MOSAIC — Gestió del llenç amb zoom/pan
// =====================================================

import { getState, setState, emit, subscribe,
         addPiece, removePiece, duplicatePiece, saveHistory } from '../state.js';
import { screenToWorld, clamp } from '../utils/helpers.js';

let canvasEl = null;
let canvasArea = null;
let ctx = null;
let animFrameId = null;

// Estat d'interacció local
let isPanning = false;
let panStart = { x: 0, y: 0 };
let lastTouchDist = 0;
let isRotating = false;
let rotateStart = 0;
let isScaling = false;
let scaleStart = 1;

// Constants
const MIN_SCALE = 0.2;
const MAX_SCALE = 5.0;

/**
 * Inicialitza el llenç
 */
export function initCanvas() {
  canvasEl = document.getElementById('mosaicCanvas');
  canvasArea = document.getElementById('canvasArea');
  if (!canvasEl || !canvasArea) return;
  ctx = canvasEl.getContext('2d');

  setupCanvasEvents();

  window.addEventListener('resize', resizeCanvas);
  subscribe('canvas:render', render);
  subscribe('transform:change', render);

  // Redimensionar quan l'app es fa visible (la splash amaga l'app amb display:none)
  subscribe('app:ready', () => {
    resizeCanvas();
  });

  return { canvas: canvasEl, ctx };
}

/**
 * Redimensiona el llenç per ocupar tot l'espai disponible
 */
function resizeCanvas() {
  if (!canvasArea || !canvasEl) return;
  canvasEl.width = canvasArea.clientWidth;
  canvasEl.height = canvasArea.clientHeight;
  render();
}

/**
 * Renderitza tot el llenç
 */
export function render() {
  if (!ctx) return;
  const state = getState();
  const { transform } = state;
  const w = canvasEl.width;
  const h = canvasEl.height;

  ctx.clearRect(0, 0, w, h);

  // Fons
  ctx.fillStyle = state.canvasBg;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(transform.offsetX, transform.offsetY);
  ctx.scale(transform.scale, transform.scale);

  // Graella
  if (state.showGrid) {
    drawGrid(ctx, w, h, state.gridSize, transform);
  }

  // Plantilla de referència
  if (state.activeTemplate) {
    drawTemplate(ctx, w, h, state.activeTemplate, state.templateOpacity, state.templateScale, transform);
  }

  // Renderitzar peces per capes (amb rejunt integrat)
  state.layers.forEach(layer => {
    if (!layer.visible) return;
    state.placedPieces.forEach((piece, idx) => {
      if (piece.layer !== layer.id) return;
      drawPiece(ctx, piece, idx, state);
    });
  });

  ctx.restore();

  // Dibuixar peça arrossegada des de la safata (en coordenades de pantalla)
  if (state.isDraggingFromTray && state.dragFragment) {
    ctx.globalAlpha = 0.7;
    ctx.drawImage(
      state.dragFragment.canvas,
      state.dragFragment.x, state.dragFragment.y,
      state.dragFragment.w, state.dragFragment.h
    );
    ctx.globalAlpha = 1.0;
  }
}

/**
 * Dibuixa la graella de referència
 */
function drawGrid(ctx, w, h, gridSize, transform) {
  ctx.strokeStyle = 'rgba(212,168,67,0.1)';
  ctx.lineWidth = 0.5 / transform.scale;

  // Calcular rang visible en coordenades del món
  const startX = Math.floor(-transform.offsetX / transform.scale / gridSize) * gridSize;
  const startY = Math.floor(-transform.offsetY / transform.scale / gridSize) * gridSize;
  const endX = startX + w / transform.scale + gridSize;
  const endY = startY + h / transform.scale + gridSize;

  ctx.beginPath();
  for (let x = startX; x < endX; x += gridSize) {
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
  }
  for (let y = startY; y < endY; y += gridSize) {
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
  }
  ctx.stroke();
}

/**
 * Dibuixa una plantilla SVG com a guia
 */
function drawTemplate(ctx, w, h, template, opacity, userScale, transform) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = 'rgba(212,168,67,0.3)';
  ctx.lineWidth = 1.5 / transform.scale;

  // Parsejar viewBox de la plantilla
  const [vx, vy, vw, vh] = template.viewBox.split(' ').map(Number);

  // Centrar la plantilla al viewport visible (coordenades del món)
  const viewCenterX = -transform.offsetX / transform.scale + (w / transform.scale) / 2;
  const viewCenterY = -transform.offsetY / transform.scale + (h / transform.scale) / 2;
  const visibleW = w / transform.scale;
  const visibleH = h / transform.scale;
  const baseScale = Math.min(visibleW * 0.7 / vw, visibleH * 0.7 / vh);
  const templateScale = baseScale * (userScale || 1);
  const tx = viewCenterX - (vw * templateScale) / 2;
  const ty = viewCenterY - (vh * templateScale) / 2;

  ctx.translate(tx, ty);
  ctx.scale(templateScale, templateScale);

  template.paths.forEach(pathStr => {
    const path = new Path2D(pathStr);
    ctx.stroke(path);
  });

  ctx.restore();
}

/**
 * Dibuixa una peça individual.
 * Si el rejunt està activat, dibuixa el fragment dues vegades:
 * primer una versió lleugerament més gran amb el color del rejunt,
 * i després la versió normal per sobre. L'espai entre ambdues
 * crea l'efecte visual de rejunt/ciment, com en un trencadís real.
 */
function drawPiece(ctx, piece, idx, state) {
  ctx.save();
  ctx.translate(piece.x + piece.w / 2, piece.y + piece.h / 2);
  ctx.rotate(piece.rotation || 0);
  ctx.scale(piece.scale || 1, piece.scale || 1);

  // Rejunt: dibuixar una versió ampliada amb el color del rejunt
  if (state.grout.enabled) {
    const gw = state.grout.width;
    const expand = 1 + (gw * 2) / Math.min(piece.w, piece.h);

    ctx.save();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Cachear el canvas de rejunt per evitar crear-ne un a cada frame
    const cacheKey = `${state.grout.color}`;
    if (!piece._groutCache || piece._groutCacheKey !== cacheKey) {
      const gc = document.createElement('canvas');
      gc.width = piece.canvas.width;
      gc.height = piece.canvas.height;
      const gCtx = gc.getContext('2d');
      gCtx.drawImage(piece.canvas, 0, 0);
      gCtx.globalCompositeOperation = 'source-in';
      gCtx.fillStyle = state.grout.color;
      gCtx.fillRect(0, 0, gc.width, gc.height);
      piece._groutCache = gc;
      piece._groutCacheKey = cacheKey;
    }

    const ew = piece.w * expand;
    const eh = piece.h * expand;
    ctx.drawImage(piece._groutCache, -ew / 2, -eh / 2, ew, eh);

    ctx.restore();
  }

  // Ombra
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  // Fragment real per sobre
  ctx.drawImage(piece.canvas, -piece.w / 2, -piece.h / 2, piece.w, piece.h);

  // Highlight de selecció
  if (state.selectedPiece === idx) {
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = 'rgba(212,168,67,0.8)';
    ctx.lineWidth = 2 / (state.transform.scale * (piece.scale || 1));
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(-piece.w / 2 - 3, -piece.h / 2 - 3, piece.w + 6, piece.h + 6);
    ctx.setLineDash([]);

    // Indicador de rotació
    ctx.beginPath();
    ctx.arc(0, -piece.h / 2 - 12, 4 / (piece.scale || 1), 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(212,168,67,0.8)';
    ctx.fill();
  }

  ctx.restore();
}

// =====================================================
// EVENTS
// =====================================================
function setupCanvasEvents() {
  // Roda del ratolí: zoom
  canvasEl.addEventListener('wheel', (e) => {
    e.preventDefault();
    const state = getState();
    const { transform } = state;
    const rect = canvasEl.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = clamp(transform.scale * zoomFactor, MIN_SCALE, MAX_SCALE);

    // Zoom centrat al cursor
    const worldBefore = screenToWorld(mx, my, transform);
    transform.scale = newScale;
    transform.offsetX = mx - worldBefore.x * newScale;
    transform.offsetY = my - worldBefore.y * newScale;

    render();
  }, { passive: false });

  // Mouse down
  canvasEl.addEventListener('mousedown', (e) => {
    const state = getState();
    const { transform } = state;
    const rect = canvasEl.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const world = screenToWorld(sx, sy, transform);

    // Clic central o eina pan: iniciar pan
    if (e.button === 1 || state.currentTool === 'pan') {
      isPanning = true;
      panStart = { x: e.clientX, y: e.clientY };
      canvasEl.style.cursor = 'grabbing';
      return;
    }

    // Clic esquerre: interacció amb peces
    if (e.button === 0) {
      handlePieceInteraction(world.x, world.y, sx, sy);
    }
  });

  // Mouse move
  canvasEl.addEventListener('mousemove', (e) => {
    const state = getState();
    const { transform } = state;
    const rect = canvasEl.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const world = screenToWorld(sx, sy, transform);

    if (isPanning) {
      transform.offsetX += e.clientX - panStart.x;
      transform.offsetY += e.clientY - panStart.y;
      panStart = { x: e.clientX, y: e.clientY };
      render();
      return;
    }

    if (state.isDragging && state.selectedPiece !== null) {
      const piece = state.placedPieces[state.selectedPiece];
      if (piece) {
        piece.x = world.x - state.dragOffset.x;
        piece.y = world.y - state.dragOffset.y;

        // Snap a graella si activat
        if (state.snapToGrid) {
          piece.x = Math.round(piece.x / state.gridSize) * state.gridSize;
          piece.y = Math.round(piece.y / state.gridSize) * state.gridSize;
        }

        render();
      }
    }

    // Rotació lliure amb arrossegament
    if (isRotating && state.selectedPiece !== null) {
      const piece = state.placedPieces[state.selectedPiece];
      if (piece) {
        const cx = piece.x + piece.w / 2;
        const cy = piece.y + piece.h / 2;
        const angle = Math.atan2(world.y - cy, world.x - cx);
        piece.rotation = angle - rotateStart + piece._startRotation;
        render();
      }
    }

    if (state.isDraggingFromTray && state.dragFragment) {
      state.dragFragment.x = sx - state.dragFragment.w / 2;
      state.dragFragment.y = sy - state.dragFragment.h / 2;
      render();
    }
  });

  // Mouse up
  canvasEl.addEventListener('mouseup', (e) => {
    const state = getState();

    if (isPanning) {
      isPanning = false;
      canvasEl.style.cursor = state.currentTool === 'pan' ? 'grab' : 'default';
      return;
    }

    if (isRotating) {
      isRotating = false;
      return;
    }

    // El drag-from-tray es gestiona a toolbar.js (onUp handler)

    state.isDragging = false;
  });

  // Touch events
  setupTouchEvents();

  // Prevenir menú contextual
  canvasEl.addEventListener('contextmenu', e => e.preventDefault());
}

/**
 * Gestiona la interacció amb peces (clic)
 */
function handlePieceInteraction(wx, wy, sx, sy) {
  const state = getState();
  const idx = getPieceAt(wx, wy);

  if (idx >= 0) {
    state.selectedPiece = idx;
    const piece = state.placedPieces[idx];

    if (state.currentTool === 'delete') {
      removePiece(idx);
      return;
    }

    if (state.currentTool === 'rotate') {
      // Rotació lliure: arrossegar per girar
      isRotating = true;
      const cx = piece.x + piece.w / 2;
      const cy = piece.y + piece.h / 2;
      rotateStart = Math.atan2(wy - cy, wx - cx);
      piece._startRotation = piece.rotation || 0;
      saveHistory();
      return;
    }

    if (state.currentTool === 'scale') {
      saveHistory();
      piece.scale = (piece.scale || 1) * 1.15;
      if (piece.scale > 3) piece.scale = 0.5;
      render();
      return;
    }

    // Eina moure
    state.isDragging = true;
    state.dragOffset = { x: wx - piece.x, y: wy - piece.y };

    // Portar al davant
    const [moved] = state.placedPieces.splice(idx, 1);
    state.placedPieces.push(moved);
    state.selectedPiece = state.placedPieces.length - 1;
    saveHistory();
    render();
  } else {
    state.selectedPiece = null;
    render();
  }
}

/**
 * Troba quina peça hi ha en una posició (coordenades del món)
 */
export function getPieceAt(wx, wy) {
  const state = getState();
  for (let i = state.placedPieces.length - 1; i >= 0; i--) {
    const p = state.placedPieces[i];
    const layer = state.layers.find(l => l.id === p.layer);
    if (layer && (!layer.visible || layer.locked)) continue;

    const s = p.scale || 1;
    // Comprovació de bounding box (sense rotació per simplicitat)
    if (wx >= p.x && wx <= p.x + p.w * s &&
        wy >= p.y && wy <= p.y + p.h * s) {
      return i;
    }
  }
  return -1;
}

/**
 * Events tàctils per mòbil
 */
function setupTouchEvents() {
  let touchStartTime = 0;

  canvasEl.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const state = getState();
    const { transform } = state;

    if (e.touches.length === 2) {
      // Pinch zoom / pan amb dos dits
      isPanning = true;
      const t1 = e.touches[0], t2 = e.touches[1];
      panStart = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2
      };
      lastTouchDist = Math.sqrt(
        (t2.clientX - t1.clientX) ** 2 + (t2.clientY - t1.clientY) ** 2
      );
      return;
    }

    touchStartTime = Date.now();
    const t = e.touches[0];
    const rect = canvasEl.getBoundingClientRect();
    const sx = t.clientX - rect.left;
    const sy = t.clientY - rect.top;
    const world = screenToWorld(sx, sy, transform);

    handlePieceInteraction(world.x, world.y, sx, sy);
  }, { passive: false });

  canvasEl.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const state = getState();
    const { transform } = state;

    if (e.touches.length === 2 && isPanning) {
      const t1 = e.touches[0], t2 = e.touches[1];
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;

      // Pan
      transform.offsetX += midX - panStart.x;
      transform.offsetY += midY - panStart.y;
      panStart = { x: midX, y: midY };

      // Pinch zoom
      const dist = Math.sqrt(
        (t2.clientX - t1.clientX) ** 2 + (t2.clientY - t1.clientY) ** 2
      );
      if (lastTouchDist > 0) {
        const rect = canvasEl.getBoundingClientRect();
        const zoomCenter = screenToWorld(
          midX - rect.left, midY - rect.top, transform
        );
        const factor = dist / lastTouchDist;
        const newScale = clamp(transform.scale * factor, MIN_SCALE, MAX_SCALE);
        transform.scale = newScale;
        transform.offsetX = midX - rect.left - zoomCenter.x * newScale;
        transform.offsetY = midY - rect.top - zoomCenter.y * newScale;
      }
      lastTouchDist = dist;
      render();
      return;
    }

    const t = e.touches[0];
    const rect = canvasEl.getBoundingClientRect();
    const sx = t.clientX - rect.left;
    const sy = t.clientY - rect.top;
    const world = screenToWorld(sx, sy, transform);

    if (state.isDragging && state.selectedPiece !== null) {
      const piece = state.placedPieces[state.selectedPiece];
      if (piece) {
        piece.x = world.x - state.dragOffset.x;
        piece.y = world.y - state.dragOffset.y;
        render();
      }
    }

    // Rotació lliure amb arrossegament (tàctil)
    if (isRotating && state.selectedPiece !== null) {
      const piece = state.placedPieces[state.selectedPiece];
      if (piece) {
        const cx = piece.x + piece.w / 2;
        const cy = piece.y + piece.h / 2;
        const angle = Math.atan2(world.y - cy, world.x - cx);
        piece.rotation = angle - rotateStart + piece._startRotation;
        render();
      }
    }

    if (state.isDraggingFromTray && state.dragFragment) {
      state.dragFragment.x = sx - state.dragFragment.w / 2;
      state.dragFragment.y = sy - state.dragFragment.h / 2;
      render();
    }
  }, { passive: false });

  canvasEl.addEventListener('touchend', (e) => {
    const state = getState();

    if (isPanning && e.touches.length < 2) {
      isPanning = false;
      lastTouchDist = 0;
    }

    // El drag-from-tray es gestiona a toolbar.js (onUp handler)

    state.isDragging = false;
    isRotating = false;
  });
}

/**
 * Retorna el canvas i el context
 */
export function getCanvas() {
  return { canvas: canvasEl, ctx };
}

/**
 * Reset del zoom
 */
export function resetZoom() {
  const state = getState();
  state.transform.offsetX = 0;
  state.transform.offsetY = 0;
  state.transform.scale = 1.0;
  render();
}
