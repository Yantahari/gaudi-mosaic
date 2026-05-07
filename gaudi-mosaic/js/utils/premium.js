// =====================================================
// GAUDÍ MOSAIC — Compra de versió 4K imprimible
// Flux: genera token → obre Gumroad → fa polling → renderitza HD
// =====================================================

import { getState, emit } from '../state.js';
import { renderExportCanvas } from './export.js';

// Feature flag: posa-ho a true només quan el producte Gumroad estigui publicat
// i el flux estigui testejat end-to-end en producció.
export const PREMIUM_ENABLED = true;

const GUMROAD_PRODUCT_URL = 'https://cardom.gumroad.com/l/gaudimosaic-hd';
const PRICE_LABEL = '4 €';

const POLL_INTERVAL_FAST_MS = 2000;     // primers 30s
const POLL_INTERVAL_SLOW_MS = 5000;     // següents 9 min 30s
const POLL_FAST_DURATION_MS = 30_000;
const POLL_TIMEOUT_MS = 10 * 60 * 1000; // 10 min total

/**
 * Punt d'entrada — obre el modal de compra premium
 */
export function startPremiumPurchase() {
  const state = getState();

  if (state.placedPieces.length === 0) {
    emit('notify', 'Crea primer un mosaic abans de comprar la versió 4K');
    return;
  }

  // Generem un token criptogràfic per identificar aquesta intenció de compra.
  // El passem a Gumroad via URL params; el ping ens el retorna i actualitza el store.
  const token = generateToken();
  showPurchaseModal(token);
}

/**
 * Genera un token aleatori segur (24 caràcters base64url).
 */
function generateToken() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Modal amb instruccions, botó "Pagar" i estat del polling.
 */
function showPurchaseModal(token) {
  const existingOverlay = document.querySelector('.modal-overlay');
  if (existingOverlay) existingOverlay.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.maxWidth = '480px';

  // Header
  const header = document.createElement('div');
  header.className = 'modal-header';
  const title = document.createElement('h2');
  title.className = 'modal-title';
  title.textContent = 'Versió imprimible 4K';
  header.appendChild(title);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.innerHTML = '✕';
  closeBtn.setAttribute('aria-label', 'Tancar');
  header.appendChild(closeBtn);

  // Body
  const body = document.createElement('div');
  body.className = 'modal-body';

  const intro = document.createElement('p');
  intro.style.cssText = 'margin: 0 0 16px; line-height: 1.55; color: rgba(245,236,215,0.85);';
  intro.innerHTML = `
    Descarrega el teu mosaic en alta resolució <strong>4×</strong>, sense marca d'aigua,
    llest per imprimir en A2 a 300 DPI.
  `;
  body.appendChild(intro);

  const details = document.createElement('ul');
  details.style.cssText = 'margin: 0 0 20px; padding-left: 20px; color: rgba(245,236,215,0.7); line-height: 1.7; font-size: 13px;';
  details.innerHTML = `
    <li>Resolució 4× (~4× la mida estàndard, ideal per impressió)</li>
    <li>Sense marca d'aigua</li>
    <li>Pagament únic, descàrrega immediata</li>
    <li>Processat per Gumroad (factura amb IVA inclosa)</li>
  `;
  body.appendChild(details);

  // Status / instructions area (es modifica durant el flux)
  const status = document.createElement('div');
  status.className = 'premium-status';
  status.style.cssText = `
    background: rgba(212,168,67,0.08);
    border: 1px solid rgba(212,168,67,0.2);
    border-radius: 8px;
    padding: 14px 16px;
    margin: 0 0 18px;
    font-size: 13px;
    line-height: 1.5;
    color: rgba(245,236,215,0.85);
    min-height: 52px;
    display: flex;
    align-items: center;
    gap: 10px;
  `;
  status.innerHTML = `<span>Pagament segur a Gumroad. Tornaràs aquí automàticament.</span>`;
  body.appendChild(status);

  // Botons
  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'break-btn cancel';
  cancelBtn.textContent = 'Cancel·lar';

  const buyBtn = document.createElement('button');
  buyBtn.className = 'break-btn use';
  buyBtn.textContent = `Comprar · ${PRICE_LABEL}`;

  btnRow.appendChild(cancelBtn);
  btnRow.appendChild(buyBtn);
  body.appendChild(btnRow);

  modal.appendChild(header);
  modal.appendChild(body);
  overlay.appendChild(modal);

  // Estat del polling
  let pollHandle = null;
  let pollStartedAt = null;
  let cancelled = false;

  function setStatus(html) {
    status.innerHTML = html;
  }

  function close() {
    cancelled = true;
    if (pollHandle) clearTimeout(pollHandle);
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  }

  closeBtn.addEventListener('click', close);
  cancelBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  // Inicia compra
  buyBtn.addEventListener('click', () => {
    // Obrim Gumroad en nova pestanya passant el token via url_params
    const buyUrl = `${GUMROAD_PRODUCT_URL}?wanted=true&mosaic_token=${encodeURIComponent(token)}`;
    window.open(buyUrl, '_blank', 'noopener');

    // Bloquegem el botó comprar i mostrem estat d'espera
    buyBtn.disabled = true;
    buyBtn.style.opacity = '0.5';
    buyBtn.textContent = 'Esperant pagament…';
    cancelBtn.textContent = 'Tancar';

    setStatus(`
      <span class="premium-spinner" aria-hidden="true"></span>
      <span>
        S'ha obert Gumroad en una pestanya nova. Completa el pagament allà.
        Quan acabi, tornarem aquí automàticament i la descàrrega començarà.
      </span>
    `);

    // Inserir un petit spinner CSS si encara no existeix
    ensureSpinnerStyle();

    pollStartedAt = Date.now();
    startPolling();
  });

  function startPolling() {
    if (cancelled) return;

    const elapsed = Date.now() - pollStartedAt;
    if (elapsed > POLL_TIMEOUT_MS) {
      setStatus(`
        <span style="color: rgba(220,120,120,0.95);">
          Ha passat massa temps sense detectar el pagament. Si has pagat però no es desbloqueja la descàrrega,
          contacta'ns a <a href="mailto:contact@gaudimosaic.art?subject=Versió%204K%20no%20descarregada" style="color: rgba(212,168,67,0.9);">contact@gaudimosaic.art</a>
          incloent el teu Order ID de Gumroad.
        </span>
      `);
      return;
    }

    fetch(`/.netlify/functions/check-payment?token=${encodeURIComponent(token)}`, {
      cache: 'no-store'
    })
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (data.paid) {
          handlePaymentConfirmed();
          return;
        }
        scheduleNextPoll();
      })
      .catch(() => {
        // Errors transitoris no han d'aturar el polling
        scheduleNextPoll();
      });
  }

  function scheduleNextPoll() {
    if (cancelled) return;
    const elapsed = Date.now() - pollStartedAt;
    const interval = elapsed < POLL_FAST_DURATION_MS
      ? POLL_INTERVAL_FAST_MS
      : POLL_INTERVAL_SLOW_MS;
    pollHandle = setTimeout(startPolling, interval);
  }

  function handlePaymentConfirmed() {
    setStatus(`<span style="color: rgba(140,210,140,0.95);">✓ Pagament confirmat. Generant la versió 4K…</span>`);

    // Render asíncron perquè el navegador pugui actualitzar UI primer
    setTimeout(() => {
      try {
        const hdCanvas = renderExportCanvas({ scale: 4, watermark: false });
        triggerDownload(hdCanvas);
        setStatus(`<span style="color: rgba(140,210,140,0.95);">✓ Descàrrega iniciada. Gràcies!</span>`);
        cancelBtn.textContent = 'Tancar';
        // Auto-tancar després de 4s
        setTimeout(() => { if (!cancelled) close(); }, 4000);
      } catch (err) {
        console.error('Error generant HD', err);
        setStatus(`
          <span style="color: rgba(220,120,120,0.95);">
            Error generant l'arxiu 4K. Torna-ho a provar prement el botó de descàrrega:
          </span>
        `);
        cancelBtn.style.display = 'none';
        const retry = document.createElement('button');
        retry.className = 'break-btn use';
        retry.style.marginTop = '8px';
        retry.textContent = 'Tornar a generar';
        retry.addEventListener('click', () => {
          const hdCanvas = renderExportCanvas({ scale: 4, watermark: false });
          triggerDownload(hdCanvas);
        });
        body.appendChild(retry);
      }
    }, 100);
  }

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));
}

/**
 * Genera nom de fitxer + dispara descàrrega del canvas com a PNG.
 */
function triggerDownload(canvas) {
  const state = getState();
  const baseName = (state.projectName || 'gaudi-mosaic').replace(/\s+/g, '-');
  const fileName = `${baseName}-4K.png`;

  // Usem toBlob per evitar dataURL gegants en mòbils
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }, 'image/png');
}

/**
 * Inserir CSS del spinner (un sol cop)
 */
function ensureSpinnerStyle() {
  if (document.getElementById('premium-spinner-style')) return;
  const style = document.createElement('style');
  style.id = 'premium-spinner-style';
  style.textContent = `
    .premium-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(212,168,67,0.25);
      border-top-color: rgba(212,168,67,0.9);
      border-radius: 50%;
      display: inline-block;
      flex-shrink: 0;
      animation: premium-spin 0.9s linear infinite;
    }
    @keyframes premium-spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
