// =====================================================
// GAUDÍ MOSAIC — Exportació i compartició d'imatges
// PNG d'alta qualitat + watermark + Web Share API
// =====================================================

import { getState, emit, subscribe } from '../state.js';
import { t } from '../i18n/i18n.js';
import { startPremiumPurchase, PREMIUM_ENABLED } from './premium.js';

/**
 * Inicialitza el sistema d'exportació
 */
export function initExport() {
  subscribe('export:png', exportPNG);
}

/**
 * Renderitza el mosaic a un canvas d'exportació.
 * @param {Object} [opts]
 * @param {number} [opts.scale=2] Multiplicador de resolució (2 = estàndard, 4 = HD imprimible)
 * @param {boolean} [opts.watermark=true] Si dibuixa la marca d'aigua "gaudimosaic.art"
 */
export function renderExportCanvas(opts = {}) {
  const { scale = 2, watermark = true } = opts;
  const state = getState();

  // Calcular el bounding box de totes les peces
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  state.placedPieces.forEach(piece => {
    const s = piece.scale || 1;
    const margin = Math.max(piece.w, piece.h) * s;
    minX = Math.min(minX, piece.x - margin * 0.1);
    minY = Math.min(minY, piece.y - margin * 0.1);
    maxX = Math.max(maxX, piece.x + piece.w * s + margin * 0.1);
    maxY = Math.max(maxY, piece.y + piece.h * s + margin * 0.1);
  });

  // Afegir marge
  const padding = 40;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  const contentW = maxX - minX;
  const contentH = maxY - minY;

  // Exportar al multiplicador demanat (2 = estàndard, 4 = HD imprimible)
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = contentW * scale;
  exportCanvas.height = contentH * scale;
  const eCtx = exportCanvas.getContext('2d');

  eCtx.scale(scale, scale);
  eCtx.imageSmoothingEnabled = true;
  eCtx.imageSmoothingQuality = 'high';

  // Fons
  eCtx.fillStyle = state.canvasBg;
  eCtx.fillRect(0, 0, contentW, contentH);

  // Peces per capes (amb rejunt integrat i ombra)
  state.layers.forEach(layer => {
    if (!layer.visible) return;
    state.placedPieces.forEach(piece => {
      if (piece.layer !== layer.id) return;

      eCtx.save();
      eCtx.translate(piece.x - minX + piece.w / 2, piece.y - minY + piece.h / 2);
      eCtx.rotate(piece.rotation || 0);
      eCtx.scale(piece.scale || 1, piece.scale || 1);

      // Rejunt: versió ampliada amb color del rejunt SOTA el fragment
      if (state.grout.enabled) {
        const gw = state.grout.width;
        const expand = 1 + (gw * 2) / Math.min(piece.w, piece.h);

        eCtx.save();
        eCtx.shadowColor = 'transparent';
        eCtx.shadowBlur = 0;
        eCtx.shadowOffsetX = 0;
        eCtx.shadowOffsetY = 0;

        const groutCanvas = document.createElement('canvas');
        groutCanvas.width = piece.canvas.width;
        groutCanvas.height = piece.canvas.height;
        const gCtx = groutCanvas.getContext('2d');
        gCtx.drawImage(piece.canvas, 0, 0);
        gCtx.globalCompositeOperation = 'source-in';
        gCtx.fillStyle = state.grout.color;
        gCtx.fillRect(0, 0, groutCanvas.width, groutCanvas.height);

        const ew = piece.w * expand;
        const eh = piece.h * expand;
        eCtx.drawImage(groutCanvas, -ew / 2, -eh / 2, ew, eh);
        eCtx.restore();
      }

      // Fragment real amb ombra
      eCtx.shadowColor = 'rgba(0,0,0,0.3)';
      eCtx.shadowBlur = 6;
      eCtx.shadowOffsetX = 2;
      eCtx.shadowOffsetY = 2;

      eCtx.drawImage(piece.canvas, -piece.w / 2, -piece.h / 2, piece.w, piece.h);
      eCtx.restore();
    });
  });

  // Watermark subtil a la cantonada inferior dreta (opcional)
  if (watermark) {
    drawWatermark(eCtx, contentW, contentH);
  }

  return exportCanvas;
}

/**
 * Dibuixa el watermark "gaudimosaic.art" a la cantonada inferior dreta
 */
function drawWatermark(ctx, w, h) {
  const text = 'gaudimosaic.art';
  const fontSize = Math.max(11, Math.min(w, h) * 0.028);
  ctx.save();
  ctx.font = `500 ${fontSize}px 'DM Sans', sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  // Ombra suau per llegibilitat sobre qualsevol fons
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = 'rgba(212,168,67,0.45)';
  ctx.fillText(text, w - 12, h - 8);
  ctx.restore();
}

/**
 * Punt d'entrada: genera el PNG i mostra el modal de compartir
 */
function exportPNG() {
  const state = getState();

  if (state.placedPieces.length === 0) {
    emit('notify', t('notify.exportEmpty'));
    return;
  }

  const exportCanvas = renderExportCanvas();
  showShareModal(exportCanvas);
}

/**
 * Mostra el modal de compartir/descarregar amb previsualització
 */
function showShareModal(exportCanvas) {
  // Tancar qualsevol modal anterior (educatiu, etc.)
  const existingOverlay = document.querySelector('.modal-overlay');
  if (existingOverlay) existingOverlay.remove();

  const state = getState();
  const fileName = (state.projectName || 'gaudi-mosaic').replace(/\s+/g, '-') + '.png';

  // --- Overlay ---
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  // --- Modal ---
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.maxWidth = '420px';

  // --- Header ---
  const header = document.createElement('div');
  header.className = 'modal-header';

  const title = document.createElement('h2');
  title.className = 'modal-title';
  title.textContent = t('share.modalTitle');
  header.appendChild(title);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.innerHTML = '✕';
  closeBtn.setAttribute('aria-label', t('dialogs.close') || 'Tancar');
  closeBtn.addEventListener('click', close);
  header.appendChild(closeBtn);

  // --- Body ---
  const body = document.createElement('div');
  body.className = 'modal-body';
  body.style.textAlign = 'center';

  // Previsualització: canvas escalar a mida de pantalla
  const maxW = Math.min(340, window.innerWidth - 80);
  const maxH = Math.min(260, window.innerHeight * 0.3);
  const ratio = exportCanvas.height / exportCanvas.width;
  let pw = maxW;
  let ph = pw * ratio;
  if (ph > maxH) { ph = maxH; pw = ph / ratio; }

  const preview = document.createElement('canvas');
  preview.width = Math.round(pw * 2);
  preview.height = Math.round(ph * 2);
  preview.style.width = Math.round(pw) + 'px';
  preview.style.height = Math.round(ph) + 'px';
  preview.style.borderRadius = '6px';
  preview.style.marginBottom = '16px';
  preview.style.border = '1px solid rgba(212,168,67,0.15)';
  const pCtx = preview.getContext('2d');
  pCtx.drawImage(exportCanvas, 0, 0, preview.width, preview.height);
  body.appendChild(preview);

  // Text
  const desc = document.createElement('p');
  desc.style.cssText = 'font-size:13px; color:rgba(245,236,215,0.6); margin-bottom:20px; line-height:1.5;';
  desc.textContent = t('share.modalText');
  body.appendChild(desc);

  // --- Botons ---
  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex; gap:10px; justify-content:center; flex-wrap:wrap;';

  // Botó compartir (Web Share API — disponible en mòbil)
  const canShare = navigator.canShare && navigator.canShare({ files: [new File([''], 'test.png', { type: 'image/png' })] });
  if (canShare) {
    const shareBtn = document.createElement('button');
    shareBtn.className = 'break-btn use';
    shareBtn.textContent = '📤 ' + t('share.shareBtn');
    shareBtn.addEventListener('click', async () => {
      try {
        const blob = await canvasToBlob(exportCanvas);
        const file = new File([blob], fileName, { type: 'image/png' });
        await navigator.share({
          title: t('share.title'),
          text: t('share.text'),
          url: 'https://gaudimosaic.art',
          files: [file]
        });
        emit('notify', t('share.shared'));
        close();
      } catch (err) {
        if (err.name !== 'AbortError') {
          emit('notify', t('share.shareFailed'));
        }
      }
    });
    btnRow.appendChild(shareBtn);
  }

  // Botó descarregar (gratuït, amb watermark, 2x)
  const dlBtn = document.createElement('button');
  dlBtn.className = canShare ? 'break-btn cancel' : 'break-btn use';
  dlBtn.textContent = '↓ ' + t('share.downloadBtn');
  dlBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
    emit('notify', t('notify.exported'));
    close();
  });
  btnRow.appendChild(dlBtn);

  body.appendChild(btnRow);

  // --- Bloc de compra premium 4K (només si està habilitat) ---
  if (!PREMIUM_ENABLED) {
    // Premium desactivat — saltem completament la secció
  } else {
  const premiumBlock = document.createElement('div');
  premiumBlock.style.cssText = `
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid rgba(212,168,67,0.15);
    text-align: center;
  `;

  const premiumLabel = document.createElement('p');
  premiumLabel.style.cssText = 'margin: 0 0 10px; font-size: 12px; color: rgba(245,236,215,0.55); line-height: 1.5;';
  premiumLabel.innerHTML = `Vols la <strong>versió imprimible 4K</strong> sense marca d'aigua?`;

  const premiumBtn = document.createElement('button');
  premiumBtn.className = 'break-btn use';
  premiumBtn.style.cssText = 'background: linear-gradient(135deg, rgba(212,168,67,0.95), rgba(184,134,46,0.95)); color: #1C1914;';
  premiumBtn.textContent = '✦ Comprar versió 4K · 4 €';
  premiumBtn.addEventListener('click', () => {
    close();
    startPremiumPurchase();
  });

  premiumBlock.appendChild(premiumLabel);
  premiumBlock.appendChild(premiumBtn);
  body.appendChild(premiumBlock);
  }

  // --- Montar ---
  modal.appendChild(header);
  modal.appendChild(body);
  overlay.appendChild(modal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));

  function close() {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  }
}

/**
 * Converteix un canvas a Blob
 */
function canvasToBlob(canvas) {
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}
