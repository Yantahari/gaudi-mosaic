// =====================================================
// GAUDÍ MOSAIC — UI per generar mosaic des d'una foto
// Carrega imatge → preview → generació amb progress →
// substitueix les peces del llenç pel resultat.
// =====================================================

import { generatePhotoMosaic } from '../engine/photoMosaic.js';
import { replacePieces, getState, emit } from '../state.js';

/**
 * Inicialitza el sistema. Subscriu a un event 'photoMosaic:open'
 * que altres mòduls (toolbar, panells) poden emetre.
 */
export function initPhotoUpload() {
  // Subscripció directa via DOM, no afegim event al state
  // perquè aquesta UI és autocontinguda.
}

/**
 * Obre el modal de pujada de foto.
 */
export function openPhotoUploadModal() {
  // Tancar qualsevol modal anterior
  const existing = document.querySelector('.modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.maxWidth = '520px';

  // Header
  const header = document.createElement('div');
  header.className = 'modal-header';
  const title = document.createElement('h2');
  title.className = 'modal-title';
  title.textContent = 'Mosaic des de foto';
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
  intro.style.cssText = 'margin: 0 0 16px; line-height: 1.55; color: rgba(245,236,215,0.85); font-size: 14px;';
  intro.innerHTML = `
    Puja una foto i la convertim en un trencadís utilitzant
    fragments de ceràmiques del catàleg que millor coincideixen amb
    cada zona de la imatge. Funciona millor amb fotos de subjectes
    contrastats: retrats, animals, monuments, plantes.
  `;
  body.appendChild(intro);

  // Drop zone / input
  const dropZone = document.createElement('label');
  dropZone.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    min-height: 180px;
    padding: 24px;
    border: 2px dashed rgba(212,168,67,0.35);
    border-radius: 12px;
    background: rgba(212,168,67,0.04);
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    box-sizing: border-box;
  `;

  const dropIcon = document.createElement('div');
  dropIcon.style.cssText = 'font-size: 36px;';
  dropIcon.textContent = '🖼';
  dropZone.appendChild(dropIcon);

  const dropText = document.createElement('div');
  dropText.style.cssText = 'font-size: 14px; color: rgba(245,236,215,0.75); text-align: center;';
  dropText.innerHTML = `
    <strong>Clica per triar foto</strong><br>
    <span style="font-size: 12px; color: rgba(245,236,215,0.5);">o arrossega-la aquí · JPG, PNG, fins a 10 MB</span>
  `;
  dropZone.appendChild(dropText);

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/jpeg,image/png,image/webp';
  fileInput.style.display = 'none';
  dropZone.appendChild(fileInput);

  body.appendChild(dropZone);

  // Preview area (oculta per defecte)
  const preview = document.createElement('div');
  preview.style.cssText = 'margin-top: 16px; display: none; text-align: center;';

  const previewImg = document.createElement('img');
  previewImg.style.cssText = 'max-width: 100%; max-height: 280px; border-radius: 8px; border: 1px solid rgba(212,168,67,0.2);';
  preview.appendChild(previewImg);

  body.appendChild(preview);

  // Progress (oculta per defecte)
  const progressBox = document.createElement('div');
  progressBox.style.cssText = 'margin-top: 16px; display: none;';

  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    width: 100%;
    height: 8px;
    background: rgba(212,168,67,0.15);
    border-radius: 4px;
    overflow: hidden;
  `;
  const progressFill = document.createElement('div');
  progressFill.style.cssText = `
    width: 0%;
    height: 100%;
    background: linear-gradient(90deg, rgba(212,168,67,0.8), rgba(184,134,46,0.95));
    transition: width 0.3s;
  `;
  progressBar.appendChild(progressFill);
  progressBox.appendChild(progressBar);

  const progressLabel = document.createElement('div');
  progressLabel.style.cssText = 'margin-top: 8px; font-size: 12px; color: rgba(245,236,215,0.6); text-align: center;';
  progressBox.appendChild(progressLabel);

  body.appendChild(progressBox);

  // Botons
  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px; flex-wrap: wrap;';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'break-btn cancel';
  cancelBtn.textContent = 'Cancel·lar';

  const generateBtn = document.createElement('button');
  generateBtn.className = 'break-btn use';
  generateBtn.textContent = 'Generar mosaic';
  generateBtn.disabled = true;
  generateBtn.style.opacity = '0.4';

  btnRow.appendChild(cancelBtn);
  btnRow.appendChild(generateBtn);
  body.appendChild(btnRow);

  modal.appendChild(header);
  modal.appendChild(body);
  overlay.appendChild(modal);

  // Estat
  let loadedImage = null;
  let isGenerating = false;

  function close() {
    if (isGenerating) return; // no permetem tancar mentre genera
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  }

  closeBtn.addEventListener('click', close);
  cancelBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  // Drag & drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.background = 'rgba(212,168,67,0.12)';
    dropZone.style.borderColor = 'rgba(212,168,67,0.6)';
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.style.background = 'rgba(212,168,67,0.04)';
    dropZone.style.borderColor = 'rgba(212,168,67,0.35)';
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.background = 'rgba(212,168,67,0.04)';
    dropZone.style.borderColor = 'rgba(212,168,67,0.35)';
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  });

  // File input
  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) handleFile(file);
  });

  function handleFile(file) {
    if (!file.type.startsWith('image/')) {
      emit('notify', 'El fitxer ha de ser una imatge');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      emit('notify', 'La imatge no pot superar 10 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        loadedImage = img;
        previewImg.src = ev.target.result;
        preview.style.display = 'block';
        dropZone.style.display = 'none';
        generateBtn.disabled = false;
        generateBtn.style.opacity = '1';
      };
      img.onerror = () => emit('notify', 'No s\'ha pogut llegir la imatge');
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Botó generar
  generateBtn.addEventListener('click', async () => {
    if (!loadedImage || isGenerating) return;

    isGenerating = true;
    generateBtn.disabled = true;
    generateBtn.style.opacity = '0.4';
    cancelBtn.style.display = 'none';
    progressBox.style.display = 'block';

    try {
      const result = await generatePhotoMosaic(loadedImage, {
        outputWidth: 1000,
        onProgress: (pct, msg) => {
          progressFill.style.width = `${Math.round(pct * 100)}%`;
          progressLabel.textContent = msg;
        }
      });

      // Substituir les peces del llenç pel resultat
      replacePieces(result.placements);

      // Centrar la vista al mosaic resultant: ajustem el transform de l'estat
      // (el user pot fer servir el zoom existent per ajustar després)
      const state = getState();
      // Reset zoom/pan perquè el mosaic estigui visible
      state.transform.offsetX = 0;
      state.transform.offsetY = 0;
      state.transform.scale = Math.min(
        (window.innerWidth - 100) / result.bounds.width,
        (window.innerHeight - 200) / result.bounds.height,
        1
      );
      emit('canvas:render');

      emit('notify', `Mosaic generat amb ${result.placements.length} fragments`);

      // Tancar el modal després d'un moment
      setTimeout(() => {
        isGenerating = false;
        close();
      }, 500);

    } catch (err) {
      console.error(err);
      isGenerating = false;
      cancelBtn.style.display = '';
      generateBtn.disabled = false;
      generateBtn.style.opacity = '1';
      progressLabel.textContent = `Error: ${err.message}`;
      progressLabel.style.color = 'rgba(220,120,120,0.95)';
    }
  });

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));
}
